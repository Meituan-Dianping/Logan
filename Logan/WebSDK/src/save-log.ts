import { LogEncryptMode, ResultMsg, LogConfig } from './interface';
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
const logQueue: LogConfig[] = [];
let logIsSaving: boolean = false;
function base64Encode (text: string): string {
    const textUtf8 = ENC_UTF8.parse(text);
    const textBase64 = textUtf8.toString(ENC_BASE64);
    return textBase64;
}

async function saveRecursion (): Promise<void> {
    while (logQueue.length > 0 && !logIsSaving) {
        logIsSaving = true;
        const logItemToSave = logQueue.shift() as LogConfig;
        const logContent = logItemToSave.logContent;
        const encryptVersion = logItemToSave.encryptVersion;
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
            if (encryptVersion === LogEncryptMode.PLAIN) {
                const logStringOb: LogStringOb = {
                    l: base64Encode(logItemToSave.logContent)
                };
                await LoganDBInstance.addLog(
                    JSON.stringify(logStringOb)
                );
            } else if (encryptVersion === LogEncryptMode.RSA) {
                const publicKey = Config.get('publicKey');
                const encryptionModule = await import(
                    /* webpackChunkName: "encryption" */ './lib/encryption'
                );
                const cipherOb = encryptionModule.encryptByRSA(
                    logContent,
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
            } else {
                throw new Error(`encryptVersion ${encryptVersion} is not supported.`);
            }
            await (Config.get('succHandler') as Function)(logItemToSave);
        } catch (e) {
            LogManager.errorTrigger();
            await (Config.get('errorHandler') as Function)(e);
        } finally {
            logIsSaving = false; //eslint-disable-line require-atomic-updates
            saveRecursion();
        }
    }
}

export default function saveLog (logConfig: LogConfig): void {
    logQueue.push(logConfig);
    saveRecursion();
}
