import express from "express";
import path from "path";
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

interface ILog {
    /**log type */
    t: number;

    /**log content */
    c: string;

    /**js timestamp */
    d: string;
}

const port = '9002';

const publicKey = '-----BEGIN PUBLIC KEY-----\n' +
    'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDkgR0WDJ9HSZpBI3Nt2y1OG3OB\n' +
    'S/gNgbwVe456B9NZAcWKFmV3u37V9+heG58WE2+chpA65yC3SY7eZR3Ebi8qGlnB\n' +
    'DnuptJ6HT2LYKiVktycx+8iPdaUi/n6Y9S5x4oYzegvYDzhQeUT3o/E6R0folO8C\n' +
    '+9UPFBcqrckd+m8xZQIDAQAB\n' +
    '-----END PUBLIC KEY-----';
const privateKey = '-----BEGIN PRIVATE KEY-----\n' +
    'MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAOSBHRYMn0dJmkEj\n' +
    'c23bLU4bc4FL+A2BvBV7jnoH01kBxYoWZXe7ftX36F4bnxYTb5yGkDrnILdJjt5l\n' +
    'HcRuLyoaWcEOe6m0nodPYtgqJWS3JzH7yI91pSL+fpj1LnHihjN6C9gPOFB5RPej\n' +
    '8TpHR+iU7wL71Q8UFyqtyR36bzFlAgMBAAECgYB9Eq75Aq+sNX1Zai4kU3PY7O2s\n' +
    'OAjuW7S3jYnPAbmNXorhqqCfiOFD/Q4TdMr/KmRNKNqJYzllGb45vN8uRaFKQTXN\n' +
    'aHRfW5AyBaVpkJjv0nUx3uDUV+rRSKOU4t7B7v5M3TM1PYXLCEqN38MdLzWtx73K\n' +
    'MBKvq3jgvTewtuQ4AQJBAP+Jr8Hgc1nqCytSFSlH1V9ctALgo6y1nZkCk1nCoFJm\n' +
    '2GYdf3kY7sq1ZIVIeLbIHalsIvqL5K4CaEctLL4WNzECQQDk6ukedp4l11QFTAdb\n' +
    'R/noxMCDKcg2Ge6I9fziEy1/OLvwE6qt6IMmwahIyTTCYIcc/AKeMlSo7ojsQhgu\n' +
    'uXh1AkBm3fhgpYgJ9AtW/w4BticQ4nKcje2Vgu7UP5MtmQmM4lXOlaVRDFZkR60V\n' +
    'cl0Vx20ZXKygC1ydJ97ueCMAylShAkBnTddLxw3RV93z0f6T4+RUdc3GoylVuNgb\n' +
    'eJ7ZSvxCKFEvo0Bn4MCm0cfmqN4lRbhTjSqFR4NLBPJHZABTvaEtAkEAm3Msk0Mx\n' +
    'wVmukzz/VkM1kbW7KwX2Exca3tFt83A2BNkwwQAjGDJ65pmcCzebDu9VcrNOEPi2\n' +
    'T8ieSiw8+tEN9g==' +
    '-----END PRIVATE KEY-----';
const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', (req, res, next) => {
    const log: IReportLog = req.body;
    const logArray: Array<ILogItem> = log.logArray.split(',').map(it => JSON.parse(decodeURIComponent(it))) as Array<ILogItem>;

    let logContent: Array<ILog> = logArray.map(it => {
        let log: ILog, content: string;

        if (it.iv && it.k && it.v) {

            /**
             * 如果加密过
             * 则先使用RSA解密出AES加密的key
             * 再使用得到的key使用AES解密得到内容
             */

            const en = new JSEncrypt();
            en.setPrivateKey(privateKey);
            const key = en.decrypt(it.k).toString(enc.Utf8);

            content = AES.decrypt(it.l, enc.Utf8.parse(key), { iv: enc.Utf8.parse(it.iv), mode: mode.CTR, padding: pad.NoPadding }).toString(enc.Utf8);
        } else {
            content = enc.Base64.parse(it.l).toString(enc.Utf8);
        }

        log = JSON.parse(content);
        log.c = decodeURIComponent(log.c);
        return log;
    });

    res.status(200).json(logContent);
});

app.listen(port, () => { console.log(`server run at ${port}`); });
