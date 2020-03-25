import { LogEncryptMode, LogItem, ResultMsg } from './interface';
import Config from './global';
import LoganDB from './lib/logan-db';
import LogManager from './log-manager';
const ENC_UTF8 = require('crypto-js/enc-utf8');
const ENC_BASE64 = require('crypto-js/enc-base64');
interface LogStringOb {
    l: string;
    iv?: string;
    k?: string;
    v?: number;
}
let LoganDBInstance: LoganDB;
const logQueue: LogItem[] = [];
let logIsSaving: boolean = false;
function base64Encode (text: string): string {
    const textUtf8 = ENC_UTF8.parse(text);
    const textBase64 = textUtf8.toString(ENC_BASE64);
    return textBase64;
}
function stringifyLogItem (logItem: LogItem): string {
    const logOb = {
        t: logItem.logType,
        c: `${encodeURIComponent(logItem.content)}`,
        d: `${Date.now()}`
    };
    return JSON.stringify(logOb);
}
async function saveRecursion (): Promise<void> {
    while (logQueue.length > 0 && !logIsSaving) {
        logIsSaving = true;
        const logItem = logQueue.shift() as LogItem;
        try {
            if (!LogManager.canSave()) {
                throw new Error(ResultMsg.EXCEED_TRY_TIMES);
            }
            if (!LoganDB.idbIsSupported()) {
                throw new Error(ResultMsg.DB_NOT_SUPPORT);
            }
            if (!LoganDBInstance) {
                LoganDBInstance = new LoganDB(Config.get('dbName') as
                    | string
                    | undefined);
            }
            const plainLog = stringifyLogItem(logItem);
            if (logItem.encryptVersion === LogEncryptMode.PLAIN) {
                const logStringOb: LogStringOb = {
                    l: base64Encode(plainLog)
                };
                await LoganDBInstance.addLog(
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
                await LoganDBInstance.addLog(
                    JSON.stringify(logStringOb)
                );
            }
            (Config.get('succHandler') as Function)({
                content: logItem.content,
                logType: logItem.logType,
                encrypted: logItem.encryptVersion === LogEncryptMode.RSA
            });
        } catch (e) {
            LogManager.errorTrigger();
            (Config.get('errorHandler') as Function)(e);
        } finally {
            logIsSaving = false; //eslint-disable-line require-atomic-updates
            saveRecursion();
        }
    }
}

export default function saveLog (logItem: LogItem): void {
    logQueue.push(logItem);
    saveRecursion();
}
