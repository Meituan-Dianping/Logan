import { LogEncryptMode, LogItem, ResultMsg } from './interface';
import Config from './global';
import LoganDB from './lib/logan-db';
import LogManager from './log-manager';
// @ts-ignore
const ENC_UTF8 = require('crypto-js/enc-utf8');
// @ts-ignore
const ENC_BASE64 = require('crypto-js/enc-base64');
interface LogStringOb {
    l: string;
    iv?: string;
    k?: string;
    v?: number;
}
let LoganDBInstance: LoganDB;
let logQueue: LogItem[] = [];
let logIsSaving: boolean = false;
function base64Encode(text: string) {
    var textUtf8 = ENC_UTF8.parse(text);
    var textBase64 = textUtf8.toString(ENC_BASE64);
    return textBase64;
}
function stringifyLogItem(logItem: LogItem) {
    let logOb = {
        t: logItem.logType,
        c: `${encodeURIComponent(logItem.content)}`,
        d: `${Date.now()}`
    };
    return JSON.stringify(logOb);
}
async function saveRecursion() {
    while (logQueue.length > 0 && !logIsSaving) {
        logIsSaving = true;
        let logItem = logQueue.shift() as LogItem;
        try {
            if (!LogManager.canSave()) {
                throw new Error(ResultMsg.EXCEED_TRY_TIMES);
            }
            const plainLog = stringifyLogItem(logItem);
            if (logItem.encryptVersion === LogEncryptMode.PLAIN) {
                const logStringOb: LogStringOb = {
                    l: base64Encode(plainLog)
                };
                return await LoganDBInstance.addLog(
                    JSON.stringify(logStringOb)
                );
            } else if (logItem.encryptVersion === LogEncryptMode.RSA) {
                const publicKey = Config.get('publicKey');
                const encryptionModule = await import(
                    /* webpackChunkName: "encryption" */ './lib/encryption'
                );
                const cipherOb = encryptionModule.encryptByRSA(
                    plainLog,
                    `${publicKey}`
                );
                const logStringOb: LogStringOb = {
                    l: cipherOb.cipherText,
                    iv: cipherOb.iv,
                    k: cipherOb.secretKey,
                    v: LogEncryptMode.RSA
                };
                return await LoganDBInstance.addLog(
                    JSON.stringify(logStringOb)
                );
            }
        } catch (e) {
            throw e;
        } finally {
            logIsSaving = false;
            await saveRecursion();
        }
    }
}

export default async function saveLog(logItem: LogItem) {
    if (!LoganDB.idbIsSupported()) {
        throw new Error(ResultMsg.DB_NOT_SUPPORT);
    } else {
        if (!LoganDBInstance) {
            LoganDBInstance = new LoganDB(Config.get('dbName') as
                | string
                | undefined);
        }
        logQueue.push(logItem);
        await saveRecursion();
    }
}
