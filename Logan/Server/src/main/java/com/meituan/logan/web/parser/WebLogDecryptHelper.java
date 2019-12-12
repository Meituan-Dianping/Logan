package com.meituan.logan.web.parser;

import org.apache.commons.codec.binary.Base64;
import org.apache.log4j.Logger;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.KeyFactory;
import java.security.Security;
import java.security.interfaces.RSAPrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;

/**
 * 功能描述:  <p></p>
 *
 *
 * @version 1.0 2019-11-01
 * @since logan-web 1.0
 */
public class WebLogDecryptHelper {
    private static final Logger LOGGER = Logger.getLogger(WebLogDecryptHelper.class);

    private static final String ALGORITHM = "AES";
    private static final String ALGORITHM_TYPE_H5 = "AES/CTR/NoPadding";
    private static final String RSA_PRIVATE_KEY_H5 = "MIICXAIBAAKBgG2m5VVtZ4mHml3FB9foDRpDW7PwFoa+1eYN777rNmIdnmezQqHWIRVcnTRVjrgGt2ndP2cYT7MgmWpvr8IjgN0PZ6ngMmKYGpapMqkxsnS/6Q8UZO4PQNlnsK2hSPoIDeJcHxDvo6Nelg+mRHEpD6K+1FIqzvdwVPCcgK7UbZElAgMBAAECgYAXQM9dgGf2iGU6AXCaXsF4klQ+ImoEhS/DK61t5V+RCwrunttAirJVX2CPGp27dOEseBjb+hHcwMsIAUtadkD7VqDoLg0C63pP6Yr91zoLSq7ru7FL4j8ZDGgHV2tE6TbtIRGbxuuF+EmztKqrMCvN4qcxqDvTtU6Xq9Us7xC+uQJBANoFtsuTqDaFFOJ0p0S3+w4lzUcfp+XboVb4+q7wcFumfDCLIuvOTEiCFj5Tj0o2eHtEo3ARHWIcNZqBOgYPPdMCQQCAwJzubpjr7oXxINLERcQ1PXvjD5HD9Q4A20p6pFkcEYTlDYW/nm60PMr7JWG54TH0e6w8IfJZVR2xonVasoInAkEAjdIfuUdgqa5iCnkFgb8IEYjngneGGRCIX/Hv57JB9GxU5qLrYWa92oC8hWiHkifisZTRmAmaCoL9H3cmTmDFvwJAJjwM3mmNlBLDR/YdYRfuyni1v5oyCWVOgUad+YmwxLsXIgY//8WGzpN3G9ngCZksgpPvc/QIyiqSpNu/ye1U5QJBAIgSfWXvx+varXagGojcCH8mVtT/E4/w3R+QTLAp6s0LQTQUDPnDGrxvT4sDoU6ib+nn0FAr/kTyJptdlvaXfeo=";

    private static final String RSA = "RSA";

    private SecretKeySpec secretKeySpec;

    static {
        Security.addProvider(new org.bouncycastle.jce.provider.BouncyCastleProvider());
    }

    public static WebLogDecryptHelper create(String encryptKey) {
        WebLogDecryptHelper webLogDecryptHelper = new WebLogDecryptHelper();
        byte[] uploadKey = getPrivateKey(encryptKey);
        webLogDecryptHelper.secretKeySpec = new SecretKeySpec(uploadKey, ALGORITHM);
        return webLogDecryptHelper;
    }

    private static byte[] getPrivateKey(String uploadKey) {
        byte[] back = null;
        try {
            PKCS8EncodedKeySpec pkcs8EncodedKeySpec = new PKCS8EncodedKeySpec(Base64.decodeBase64(RSA_PRIVATE_KEY_H5));
            KeyFactory keyFactory = KeyFactory.getInstance(RSA);
            RSAPrivateKey privateKey = (RSAPrivateKey) keyFactory.generatePrivate(pkcs8EncodedKeySpec);
            Cipher cipher = Cipher.getInstance(RSA);
            cipher.init(Cipher.DECRYPT_MODE, privateKey);
            back = cipher.doFinal(Base64.decodeBase64(uploadKey));
        } catch (Exception e) {
            LOGGER.error(e);
        }
        return back;
    }

    public String doDecrypt(String iv, byte[] content) {
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM_TYPE_H5);
            cipher.init(Cipher.DECRYPT_MODE, secretKeySpec, new IvParameterSpec(iv.getBytes()));
            return new String(cipher.doFinal(content));
        } catch (Exception e) {
            LOGGER.error(e);
        }
        return null;
    }
}
