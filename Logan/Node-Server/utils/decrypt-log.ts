import { AES, enc, mode, pad } from "crypto-js";
const { JSEncrypt } = require("js-encrypt");

import { ILogItem } from "../dao/interface/log-item";
import { ILogContent } from "../dao/interface/log-content";

/**
 * RSA私钥，必须与client端配对，否则无法解析
 */
const privateKey = '-----BEGIN PRIVATE KEY-----\n' +
    'MIICXAIBAAKBgG2m5VVtZ4mHml3FB9foDRpDW7PwFoa+1eYN777rNmIdnmezQqHW\n' +
    'IRVcnTRVjrgGt2ndP2cYT7MgmWpvr8IjgN0PZ6ngMmKYGpapMqkxsnS/6Q8UZO4P\n' +
    'QNlnsK2hSPoIDeJcHxDvo6Nelg+mRHEpD6K+1FIqzvdwVPCcgK7UbZElAgMBAAEC\n' +
    'gYAXQM9dgGf2iGU6AXCaXsF4klQ+ImoEhS/DK61t5V+RCwrunttAirJVX2CPGp27\n' +
    'dOEseBjb+hHcwMsIAUtadkD7VqDoLg0C63pP6Yr91zoLSq7ru7FL4j8ZDGgHV2tE\n' +
    '6TbtIRGbxuuF+EmztKqrMCvN4qcxqDvTtU6Xq9Us7xC+uQJBANoFtsuTqDaFFOJ0\n' +
    'p0S3+w4lzUcfp+XboVb4+q7wcFumfDCLIuvOTEiCFj5Tj0o2eHtEo3ARHWIcNZqB\n' +
    'OgYPPdMCQQCAwJzubpjr7oXxINLERcQ1PXvjD5HD9Q4A20p6pFkcEYTlDYW/nm60\n' +
    'PMr7JWG54TH0e6w8IfJZVR2xonVasoInAkEAjdIfuUdgqa5iCnkFgb8IEYjngneG\n' +
    'GRCIX/Hv57JB9GxU5qLrYWa92oC8hWiHkifisZTRmAmaCoL9H3cmTmDFvwJAJjwM\n' +
    '3mmNlBLDR/YdYRfuyni1v5oyCWVOgUad+YmwxLsXIgY//8WGzpN3G9ngCZksgpPv\n' +
    'c/QIyiqSpNu/ye1U5QJBAIgSfWXvx+varXagGojcCH8mVtT/E4/w3R+QTLAp6s0L\n' +
    'QTQUDPnDGrxvT4sDoU6ib+nn0FAr/kTyJptdlvaXfeo=' +
    '-----END PRIVATE KEY-----';

/**
 * 解析一条日志
 * @param logItem 日志条目
 */
export const decryptLog = (logItem: ILogItem): ILogContent => {
    let logContent: ILogContent, content: string;
    if (logItem.iv && logItem.k && logItem.v) {

        /**
         * 如果加密过
         * 则先使用RSA解密出AES加密的key
         * 再使用得到的key使用AES解密得到内容
         */

        /**
         * if log with encryption
         * first, use RSA decrypt to get the AES encryption key
         * then, use the key do AES decrypt can get our log content
         */

        const en = new JSEncrypt();
        en.setPrivateKey(privateKey);
        const key = en.decrypt(logItem.k).toString(enc.Utf8);

        content = AES.decrypt(logItem.l, enc.Utf8.parse(key), { iv: enc.Utf8.parse(logItem.iv), mode: mode.CTR, padding: pad.NoPadding }).toString(enc.Utf8);
    } else {
        content = enc.Base64.parse(logItem.l).toString(enc.Utf8);
    }

    logContent = JSON.parse(content);
    logContent.c = decodeURIComponent(logContent.c);
    return logContent;
};

/**
 * 解析批量日志
 * @param logArray 日志数组
 */
export const decryptLogArray = (logArray: Array<ILogItem>): Array<ILogContent> => logArray.map(logItem => decryptLog(logItem));

/**
 * 解析字符串格式批量日志
 * @param logArrayString 日志数组字符串
 */
export const decryptLogArrayString = (logArrayString: string) => logArrayString.split(',').map(it => decryptLog(JSON.parse(decodeURIComponent(it))));