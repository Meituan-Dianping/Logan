package com.meituan.logan.web.parser;

import com.meituan.logan.web.enums.ResultEnum;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.io.LineIterator;
import org.apache.commons.lang3.ArrayUtils;
import org.apache.log4j.Logger;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.core.io.support.PropertiesLoaderUtils;

import javax.annotation.PreDestroy;
import javax.crypto.BadPaddingException;
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

    private static final String AES_NO_PADDING = "AES/CBC/NoPadding";
    private static final String AES_WITH_PADDING = "AES/CBC/PKCS5Padding";

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
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey, "AES");
            IvParameterSpec ivParamSpec = new IvParameterSpec(iv);

            Cipher cipher;
            try {
                // 先尝试带 padding 模式解密末尾 16 字节
                cipher = Cipher.getInstance(AES_WITH_PADDING);
                cipher.init(Cipher.DECRYPT_MODE, secretKeySpec, ivParamSpec);
                cipher.doFinal(encrypt, encrypt.length - 16, 16);
            } catch (BadPaddingException e) {
                LOGGER.warn("decrypt with padding mode fail", e);
                // 带 padding 模式解密失败，尝试无 padding 模式
                cipher = Cipher.getInstance(AES_NO_PADDING);
            }

            cipher.init(Cipher.DECRYPT_MODE, secretKeySpec, ivParamSpec);
            byte[] compressed = cipher.doFinal(encrypt);
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
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try(GZIPInputStream gzipInputStream = new GZIPInputStream(new ByteArrayInputStream(contentBytes))) {
            IOUtils.copy(gzipInputStream, out);
            return out.toByteArray();
        } catch (IOException e) {
            // 虽然解压抛了异常，但前面已经解出来的内容还是可用的
            // 由于多条日志使用 \n 分割，这里取最后一个 \n 前的内容
            byte[] arr = out.toByteArray();
            int lastIndexOfLf = ArrayUtils.lastIndexOf(arr, (byte) '\n');
            arr = lastIndexOfLf < 0 ? new byte[0] : ArrayUtils.subarray(arr, 0, lastIndexOfLf + 1);
            LOGGER.error("decompress, dropped=" + (out.size() - arr.length), e);
            return arr;
        }
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

    private static int countLines(File file) throws IOException {
        int count = 0;
        try (LineIterator iterator = FileUtils.lineIterator(file)) {
            while (iterator.hasNext()) {
                count++;
                iterator.next();
            }
        }
        return count;
    }

    public static void main(String[] args) throws IOException {
        if (args.length < 2) {
            System.exit(-1);
        }
        File input = new File(args[0]); // 原始文件路径
        File output = new File(args[1]); // 输出文件路径
        try (FileInputStream inputStream = new FileInputStream(input)) {
            LoganProtocol protocol = new LoganProtocol(inputStream, output);
            ResultEnum result = protocol.process();
            System.out.println("result: " + result);
        }
        System.out.println("output lines: " + countLines(output));

        output = new File(output.getAbsolutePath() + ".legacy");
        try (FileInputStream inputStream = new FileInputStream(input)) {
            LegacyLoganProtocol protocol = new LegacyLoganProtocol(inputStream, output);
            ResultEnum result = protocol.process();
            System.out.println("legacy result: " + result);
        }
        System.out.println("legacy output lines: " + countLines(output));
    }
}