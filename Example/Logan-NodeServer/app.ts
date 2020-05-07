import express from "express";
import logger from "morgan";
import { AES, enc, mode, pad } from "crypto-js";
const { JSEncrypt } = require("js-encrypt");

interface IReportLog {
    client: string;
    webSource?: string;
    deviceId: string;
    environment?: string;
    customInfo: string;
    logPageNo: number;
    fileDate: string;
    logArray: string;
}

interface ILogItem {
    l: string;
    iv?: string;
    k?: string;
    v?: number;
}

interface ILogContent {
    /**log type */
    t: number;

    /**log content */
    c: string;

    /**js timestamp */
    d: string;
}

const port = '9002';

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

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', (req, res, next) => {
    const reportLog: IReportLog = req.body;
    const logArray: Array<ILogItem> = reportLog.logArray.split(',').map(it => JSON.parse(decodeURIComponent(it))) as Array<ILogItem>;

    let logContent: Array<ILogContent> = logArray.map(it => {
        let logContent: ILogContent, content: string;

        if (it.iv && it.k && it.v) {

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
            const key = en.decrypt(it.k).toString(enc.Utf8);

            content = AES.decrypt(it.l, enc.Utf8.parse(key), { iv: enc.Utf8.parse(it.iv), mode: mode.CTR, padding: pad.NoPadding }).toString(enc.Utf8);
        } else {
            content = enc.Base64.parse(it.l).toString(enc.Utf8);
        }

        logContent = JSON.parse(content);
        logContent.c = decodeURIComponent(logContent.c);
        return logContent;
    });

    res.status(200).json(logContent);
});

app.listen(port, () => { console.log(`server run at ${port}`); });
