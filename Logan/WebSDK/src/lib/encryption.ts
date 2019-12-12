// @ts-ignore
import JSEncrypt from './js-encrypt.js';
// @ts-ignore
const AES = require('crypto-js/aes');
// @ts-ignore
const ENC_UTF8 = require('crypto-js/enc-utf8');
// @ts-ignore
const ENC_BASE64 = require('crypto-js/enc-base64');
// @ts-ignore
const CTR_MODE = require('crypto-js/mode-ctr');
// @ts-ignore
const PAD_NOPADDING = require('crypto-js/pad-nopadding');
export interface RSACipherOb {
    cipherText: string;
    iv: string;
    secretKey: string;
}
function generateRandomBytes(byteLength: number) {
    let result = '';
    while (result.length < byteLength) {
        result += Math.random()
            .toString(36)
            .substr(2, 1);
    }
    return result;
}

function aesEncrypt(
    plaintext: string,
    keyString: string,
    ivString: string,
    mode: any,
    padding: any
) {
    var key = ENC_UTF8.parse(keyString);
    var iv = ENC_UTF8.parse(ivString);
    var cipherResult = AES.encrypt(plaintext, key, {
        mode: mode,
        padding: padding,
        iv: iv
    });
    var ciphertext = cipherResult.ciphertext;
    var ciphertextBase64 = ciphertext.toString(ENC_BASE64);
    return ciphertextBase64;
}

function rsaEncrypt(plaintext: string, publicKey: string) {
    var en = new JSEncrypt();
    en.setPublicKey(publicKey);
    var cipher = en.encrypt(plaintext);
    return cipher;
}

/**
 * AES-128-CTR
 */
function ctrEncrypt(plaintext: string, keyString: string, ivString: string) {
    return aesEncrypt(plaintext, keyString, ivString, CTR_MODE, PAD_NOPADDING);
}

export function encryptByRSA(
    plaintext: string,
    publicKey: string
): RSACipherOb {
    const iv = generateRandomBytes(16);
    const aesKey = generateRandomBytes(16);
    const cipherText = ctrEncrypt(plaintext, aesKey, iv);
    const secretKey = rsaEncrypt(aesKey, publicKey);
    return {
        cipherText,
        iv,
        secretKey
    };
}
