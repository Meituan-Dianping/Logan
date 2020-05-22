/**
 * ResultMsg is used for logan-web to show failure reasons or report results.
 */
export enum ResultMsg {
    DB_NOT_SUPPORT = 'IndexedDB is not supported',
    NO_LOG = 'No log exists',
    REPORT_LOG_SUCC = 'Report succ',
    REPORT_LOG_FAIL = 'Report fail',
    EXCEED_TRY_TIMES = 'Exceed try times',
    EXCEED_LOG_SIZE_LIMIT = 'Exceed log size day limit'
}

/**
 * logan-web now supports two kinds of log mode. PLAIN mode is used for log() method. And RSA mode is used for logWithEncryption() method.
 *
 * PLAIN mode means that log saved in DB will only be encoded by base64, almost plaintext and can be easily obtained by local user.
 *
 * RSA mode means that logs will be hybrid encrypted before saved and it is very difficult to be cracked after then.
 *
 */
export enum LogEncryptMode {
    PLAIN = 0,
    RSA = 1
}

/**
 * One Log is composed of the log content, the log type and the encryption mode to save it.
 * @deprecated replaced by LogConfig
 */
export interface LogItem {
    content: string;
    logType: number;
    encryptVersion: LogEncryptMode;
}

/**
 * Callback to handle error happened in log-saving related methods.
 */
export interface LogErrorHandler {
    (e: Error): void | Promise<void>;
}

/**
 * Callback to do something when one log is saved locally.
 */
export interface LogSuccHandler {
    (log: LogConfig): void | Promise<void>;
}

/**
 * Global settings for logan-web. Used when calling initConfig() method.
 *
 * @param reportUrl The server address to accept logs. The reportUrl set in report() method will overide this.
 * @param publicKey A 1024 bit public key used for RSA encryption. This key is needed if you will use logWithEncryption() method to make local logs encrypted.
 * @param logTryTimes The failure times Logan Web allows for logging. Default to be 3. No further logs will be saved if times exhaust.
 * @param dbName Name of the database in IndexedDB. You can set your own dbName. Default to be "logan_web_db".
 * @param errorHandler This method will be invoked if error happened in log-saving related methods such as log(), customLog(), etc.
 * @param succHandler This method will be invoked if one log is saved locally.
 *
 */
export interface GlobalConfig {
    reportUrl?: string;
    publicKey?: string;
    logTryTimes?: number;
    dbName?: string;
    errorHandler?: LogErrorHandler;
    succHandler?: LogSuccHandler;
}

export interface ReportXHROpts {
    reportUrl?: string;
    data?: any;
    withCredentials?: boolean;
    headers?: Record<string, any>;
    responseDealer?: {
        (xhrResponseText: any): {
            resultMsg: ResultMsg.REPORT_LOG_SUCC | ResultMsg.REPORT_LOG_FAIL;
            desc?: string;
        };
    };
}
/**
 * Settings for report() method.
 *
 * @param reportUrl The server address to accept logs in this report. It is not necessary if global reportUrl is set by initConfig() method.
 * @param deviceId Unique local deviceId that represents current environment or user on this device. This id is used for later log retrieval from the server.
 * @param {YYYY-MM-DD} fromDayString Logs that saved from this day (this day is not exclusive) will be uploaded.
 * @param {YYYY-MM-DD} toDayString Logs that saved until this day (this day is not exclusive) will be uploaded.
 * @param webSource Extra report source information. Like browser, WeChat etc.
 * @param environment Extra current environment information.
 * @param customInfo Extra information of current biz, user etc.
 * @param xhrOptsFormatter This formatter can override standard xhr options when reporting logs. Each property you set in formatter will replace the standard logan report option.
 *
 */
export interface ReportConfig {
    /**
     * @param {YYYY-MM-DD}
     */
    fromDayString: string;
    /**
     * @param {YYYY-MM-DD}
     */
    toDayString: string;
    reportUrl?: string;
    deviceId?: string;
    webSource?: string;
    environment?: string;
    customInfo?: string;
    xhrOptsFormatter?: {
        (logItemStrings: string[], logPageNo: number /* logPageNo starts from 1 */, logDayString: string): ReportXHROpts;
    };
    /**
     * Will delete reported logs after report.
     */
    incrementalReport?: boolean;
}

/**
 * Result resolved by report() method.
 *
 * @param {YYYY-MM-DD} key The log day string.
 * @param msg This log day's report result message.
 * @param desc More information of report failure reason.
 */
export interface ReportResult {
    [key: string]: {
        msg: ResultMsg; desc?: string;
    };
}

/**
 * Log-saving related configs.
 */
export interface LogConfig {
    logContent: string;
    encryptVersion: LogEncryptMode;
}
