package com.meituan.logan.web.parser;

import com.meituan.logan.web.enums.ResultEnum;
import org.apache.commons.io.IOUtils;
import org.apache.log4j.Logger;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.core.io.support.PropertiesLoaderUtils;

import javax.annotation.PreDestroy;
import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.io.*;
import java.nio.ByteBuffer;
import java.security.Security;
import java.util.Properties;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.zip.GZIPInputStream;

/**
 * @since logan-web 1.0
 */
public class LoganProtocol {

    private static final Logger LOGGER = Logger.getLogger(LoganProtocol.class);

    private static final char ENCRYPT_CONTENT_START = '\1';

    private static final String AES_ALGORITHM_TYPE = "AES/CBC/NoPadding";

    private static AtomicBoolean initialized = new AtomicBoolean(false);

    static {
        initialize();
    }

    private byte[] secretKey;
    private byte[] iv;
    private ByteBuffer wrap;
    private FileOutputStream fileOutputStream;

    public LoganProtocol(InputStream stream, File file) {
        try {
            wrap = ByteBuffer.wrap(IOUtils.toByteArray(stream));
            fileOutputStream = new FileOutputStream(file);
        } catch (IOException e) {
            LOGGER.error(e);
        }
    }

    public ResultEnum process() {
        if (!initSecureParams()) {
            return ResultEnum.ERROR_DECRYPT;
        }
        while (wrap.hasRemaining()) {
            while (wrap.hasRemaining() && wrap.get() == ENCRYPT_CONTENT_START) {
                byte[] encrypt = new byte[wrap.getInt()];
                if (!tryGetEncryptContent(encrypt) || !decryptAndAppendFile(encrypt)) {
                    return ResultEnum.ERROR_DECRYPT;
                }
            }
        }
        return ResultEnum.SUCCESS;
    }

    private boolean tryGetEncryptContent(byte[] encrypt) {
        try {
            wrap.get(encrypt);
        } catch (java.nio.BufferUnderflowException e) {
            LOGGER.error(e);
            return false;
        }
        return true;
    }

    private boolean decryptAndAppendFile(byte[] encrypt) {
        boolean result = false;
        try {
            Cipher aesEncryptCipher = Cipher.getInstance(AES_ALGORITHM_TYPE);
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey, "AES");
            aesEncryptCipher.init(Cipher.DECRYPT_MODE, secretKeySpec, new IvParameterSpec(iv));
            byte[] compressed = aesEncryptCipher.doFinal(encrypt);
            byte[] plainText = decompress(compressed);
            result = true;
            fileOutputStream.write(plainText);
            fileOutputStream.flush();
        } catch (Exception e) {
            LOGGER.error("decryptAndAppendFile", e);
        }
        return result;
    }

    private static byte[] decompress(byte[] contentBytes) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            IOUtils.copy(new GZIPInputStream(new ByteArrayInputStream(contentBytes)), out);
            return out.toByteArray();
        } catch (IOException e) {
            LOGGER.error(e);
        }
        return new byte[0];
    }

    @PreDestroy
    public void closeFileSteam() {
        try {
            fileOutputStream.close();
        } catch (IOException e) {
            LOGGER.error(e);
        }
    }

    /**
     * BouncyCastle作为安全提供，防止我们加密解密时候因为jdk内置的不支持改模式运行报错。
     **/
    private static void initialize() {
        if (initialized.get()) {
            return;
        }
        Security.addProvider(new BouncyCastleProvider());
        initialized.set(true);
    }


    private boolean initSecureParams() {
        if (checkSecureParams()) {
            return true;
        }
        try {
            Properties properties = PropertiesLoaderUtils.loadAllProperties("secure.properties");
            secretKey = properties.getProperty("AES_KEY").getBytes();
            iv = properties.getProperty("IV").getBytes();
            return checkSecureParams();
        } catch (IOException e) {
            LOGGER.error("initSecureParams", e);
        }
        return false;
    }

    private boolean checkSecureParams() {
        return secretKey != null && secretKey.length == 16 &&
                iv != null && iv.length == 16;
    }
}