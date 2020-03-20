import {
    LogEncryptMode,
    LogItem,
    ReportConfig,
    GlobalConfig
} from './interface';
import Config from './global';
import { isValidDay } from './lib/utils';
import { ResultMsg, ReportResult } from './interface';
import LogManager from './log-manager';
const ES6Promise = require('es6-promise'); // eslint-disable-line
if (!window.Promise) {
    window.Promise = ES6Promise;
}
let logQueueBeforeLoad: LogItem[] = [];

function reportParamChecker (reportConfig: ReportConfig): never | void {
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

function logParamChecker (logItem: LogItem): never | void {
    if (typeof logItem.logType !== 'number') {
        throw new Error('logType needs to be set');
    }
    if (logItem.encryptVersion === LogEncryptMode.RSA) {
        if (!Config.get('publicKey')) {
            throw new Error(
                'publicKey needs to be set before logWithEncryption'
            );
        }
    }
}

async function logAsync (logItem: LogItem): Promise<void> {
    // No need to async import if tryTimes exceeds.
    if (LogManager.canSave()) {
        try {
            logParamChecker(logItem);
            const saveLogModule = await import(
                /* webpackChunkName: "save_log" */ './save-log'
            );
            saveLogModule.default(logItem);
        } catch (e) {
            LogManager.errorTrigger();
            (Config.get('errorHandler') as Function)(e);
        }
    } else {
        (Config.get('errorHandler') as Function)(new Error(ResultMsg.EXCEED_TRY_TIMES));
    }
}

function logIfLoaded (logItem: LogItem): void {
    if (
        !document.readyState ||
        (document.readyState && document.readyState === 'complete')
    ) {
        logAsync(logItem);
    } else {
        logQueueBeforeLoad.push(logItem);
    }
}

function onWindowLoad (): void {
    logQueueBeforeLoad.forEach(logItem => {
        logAsync(logItem);
    });
    logQueueBeforeLoad = [];
    window.removeEventListener('load', onWindowLoad);
}
window.addEventListener('load', onWindowLoad);

/**
 * Set global settings for this single Logan instance. Usually you only need to call this once after Logan is imported. Each time this method is called, all previous global configs will be overwritten by current settings.
 *
 * @param globalConfig Global settings
 */
export function initConfig (globalConfig: GlobalConfig): void {
    Config.set(globalConfig);
}

/**
 * Save one log to local.
 * @param content Log content.
 * @param logType Log type.
 */
export function log (content: string, logType: number): void {
    logIfLoaded({ content, logType, encryptVersion: LogEncryptMode.PLAIN });
}

/**
 * Save one confidential log to local. Before saving, the log content will be encrypted and it is very hard to crack after then.
 * @param content Log content.
 * @param logType Log type.
 */
export function logWithEncryption (content: string, logType: number): void {
    logIfLoaded({ content, logType, encryptVersion: LogEncryptMode.RSA });
}

/**
 * Report local logs to the server side.
 *
 * @param reportConfig Config for this report.
 * @returns {Promise<ReportResult>} Reject with an Error if anything goes wrong during the report process. Resolve ReportResult if the process is successful.
 */
export async function report (reportConfig: ReportConfig): Promise<ReportResult> {
    reportParamChecker(reportConfig);
    const reportLogModule = await import(
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
