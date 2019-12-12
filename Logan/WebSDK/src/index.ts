import {
    LogEncryptMode,
    LogItem,
    ReportConfig,
    GlobalConfig
} from './interface';
import Config from './global';
import { isValidDay } from './lib/utils';
import { ResultMsg } from './interface';
import LogManager from './log-manager';
// @ts-ignore
const ES6Promise = require('es6-promise');
if (!(window as any).Promise) {
    (window as any).Promise = ES6Promise;
}
var logQueueBeforeLoad: LogItem[] = [];

async function onWindowLoad() {
    logQueueBeforeLoad.forEach(logItem => {
        logAsync(logItem);
    });
    logQueueBeforeLoad = [];
    window.removeEventListener('load', onWindowLoad);
}
window.addEventListener('load', onWindowLoad);

function reportParamChecker(reportConfig: ReportConfig) {
    if (!reportConfig.reportUrl && !Config.get('reportUrl')) {
        throw new Error('reportUrl needs to be set before report');
    }
    if (reportConfig.deviceId === undefined) {
        throw new Error('deviceId is needed');
    }
    const dayFormatDesc = 'is not valid, needs to be YYYY-MM-DD format';
    if (!isValidDay(reportConfig.fromDayString)) {
        throw new Error(`fromDayString ${dayFormatDesc}`);
    }
    if (!isValidDay(reportConfig.toDayString)) {
        throw new Error(`toDayString ${dayFormatDesc}`);
    }
    if (reportConfig.fromDayString > reportConfig.toDayString) {
        throw new Error('fromDayString needs to be no bigger than toDayString');
    }
}

function logParamChecker(logType: number, encryptMode: LogEncryptMode) {
    if (typeof logType !== 'number') {
        throw new Error('logType needs to be set');
    }
    if (encryptMode === LogEncryptMode.RSA) {
        if (!Config.get('publicKey')) {
            throw new Error(
                'publicKey needs to be set before logWithEncryption'
            );
        }
    }
}

async function logIfLoaded(logItem: LogItem) {
    if (
        !document.readyState ||
        (document.readyState && document.readyState === 'complete')
    ) {
        await logAsync(logItem);
    } else {
        logQueueBeforeLoad.push(logItem);
    }
}

async function logAsync(logItem: LogItem) {
    if (LogManager.canSave()) {
        try {
            let saveLogModule = await import(
                /* webpackChunkName: "save_log" */ './save-log'
            );
            await saveLogModule.default(logItem);
        } catch (e) {
            LogManager.errorTrigger();
            (Config.get('errorHandler') as Function)(e);
        }
    } else {
        (Config.get('errorHandler') as Function)(
            new Error(ResultMsg.EXCEED_TRY_TIMES)
        );
    }
}

/**
 * Set global settings for this single Logan instance. Usually you only need to call this once after Logan is imported. Each time this method is called, all previous global configs will be overwritten by current settings.
 *
 * @param globalConfig Global settings
 */
export function initConfig(globalConfig: GlobalConfig) {
    Config.set(globalConfig);
}

/**
 * Save one log to local.
 *
 * @param content Log content.
 * @param logType Log type.
 */
export async function log(content: string, logType: number) {
    logParamChecker(logType, LogEncryptMode.PLAIN);
    await logIfLoaded({
        content,
        logType,
        encryptVersion: LogEncryptMode.PLAIN
    });
}

/**
 * Save one confidential log to local. Before saving, the log content will be encrypted and it is very hard to crack after then.
 *
 * @param content Log content.
 * @param logType Log type.
 */
export async function logWithEncryption(content: string, logType: number) {
    logParamChecker(logType, LogEncryptMode.RSA);
    await logIfLoaded({ content, logType, encryptVersion: LogEncryptMode.RSA });
}

/**
 * Report local logs to the server side.
 *
 * @param reportConfig Config for this report.
 * @returns {Promise<ReportResult>} Reject with an Error if anything goes wrong during the report process. Resolve ReportResult if the process is successful.
 */
export async function report(reportConfig: ReportConfig) {
    reportParamChecker(reportConfig);
    let reportLogModule = await import(
        /* webpackChunkName: "report_log" */ './report-log'
    );
    return await reportLogModule.default(reportConfig);
}

export default {
    initConfig,
    log,
    logWithEncryption,
    report,
    ResultMsg
};
