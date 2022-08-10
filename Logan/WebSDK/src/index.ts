import {
    LogEncryptMode,
    ReportConfig,
    GlobalConfig,
    LogConfig
} from './interface';
import Config from './global-config';
import { isValidDay } from './lib/utils';
import { ResultMsg, ReportResult } from './interface';
import LogManager from './log-manager';
import { Promise as ES6Promise } from 'es6-promise';
if (!window.Promise) {
    // @ts-ignore
    window.Promise = ES6Promise;
}
let logQueueBeforeLoad: LogConfig[] = [];

function logContentWrapper (content: string, logType: number): string {
    const logOb = {
        t: logType,
        c: `${encodeURIComponent(content)}`,
        d: `${Date.now()}`
    };
    return JSON.stringify(logOb);
}

function reportParamChecker (reportConfig: ReportConfig): never | void {
    if (!reportConfig) {
        throw new Error('reportConfig needs to be an object');
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

function logParamChecker (logType: number, encryptVersion: LogEncryptMode): never | void {
    if (typeof logType !== 'number') {
        throw new Error('logType needs to be set');
    }
    if (encryptVersion === LogEncryptMode.RSA) {
        if (!Config.get('publicKey')) {
            throw new Error(
                'publicKey needs to be set before logWithEncryption'
            );
        }
    }
}

async function logAsync (logItem: LogConfig): Promise<void> {
    // No need to async import if tryTimes exceeds.
    if (LogManager.canSave()) {
        try {
            const saveLogModule = await import(
                /* webpackChunkName: "save_log" */ './save-log'
            );
            saveLogModule.default(logItem);
        } catch (e) {
            LogManager.errorTrigger();
            await (Config.get('errorHandler') as Function)(e);
        }
    } else {
        await (Config.get('errorHandler') as Function)(new Error(ResultMsg.EXCEED_TRY_TIMES));
    }
}

function logIfLoaded (logItem: LogConfig): void {
    if (
        !document.readyState ||
        (document.readyState && document.readyState === 'complete')
    ) {
        logAsync(logItem);
    } else {
        logQueueBeforeLoad.push(logItem);
    }
}

function standardLog (content: string, logType: number, encryptVersion: LogEncryptMode): never | void {
    try {
        logParamChecker(logType, LogEncryptMode.PLAIN);
    } catch (e) {
        (Config.get('errorHandler') as Function)(e);
    }
    logIfLoaded({
        logContent: logContentWrapper(content, logType),
        encryptVersion
    });
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
 * Save one log locally.
 * @param content Log content.
 * @param logType Log type.
 */
export function log (content: string, logType: number): void {
    standardLog(content, logType, LogEncryptMode.PLAIN);
}

/**
 * Save one confidential log locally. Before saving, the log content will be encrypted and it is very hard to crack after then.
 * @param content Log content.
 * @param logType Log type.
 */
export function logWithEncryption (content: string, logType: number): void {
    standardLog(content, logType, LogEncryptMode.RSA);
}

/**
 * Save custom formatted log content locally.
 * @param {LogConfig} logConfig
 */
export function customLog (logConfig: LogConfig): void {
    logIfLoaded({
        logContent: logConfig.logContent,
        encryptVersion: logConfig.encryptVersion
    });
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
    customLog,
    ResultMsg
};
