import { ReportConfig, ResultMsg, ReportResult, ReportXHROpts } from './interface';
import LoganDB from './lib/logan-db';
import {
    LoganLogDayItem,
    FormattedLogReportName,
    LOG_DAY_TABLE_PRIMARY_KEY
} from './lib/logan-db';
import Config from './global-config';
import Ajax from './lib/ajax';
import { dayFormat2Date, ONE_DAY_TIME_SPAN, dateFormat2Day } from './lib/utils';
import { invokeInQueue } from './logan-operation-queue';
let LoganDBInstance: LoganDB;

/**
 * @returns Promise<number> with reported pageIndex if this page has logs, otherwise Promise<null>.
 */
async function getLogAndSend (reportName: string, reportConfig: ReportConfig): Promise<number | null> {
    const logItems = await LoganDBInstance.getLogsByReportName(reportName);
    if (logItems.length > 0) {
        const pageIndex = LoganDBInstance.logReportNameParser(reportName).pageIndex;
        const logItemStrings = logItems
            .map(logItem => {
                return encodeURIComponent(logItem.logString);
            });
        const logReportOb = LoganDBInstance.logReportNameParser(reportName);
        const customXHROpts: ReportXHROpts = typeof reportConfig.xhrOptsFormatter === 'function' ? reportConfig.xhrOptsFormatter(logItemStrings, logReportOb.pageIndex + 1, logReportOb.logDay) : {};
        return await Ajax(
            customXHROpts.reportUrl || reportConfig.reportUrl || (Config.get('reportUrl') as string),
            customXHROpts.data || JSON.stringify({
                client: 'Web',
                webSource: `${reportConfig.webSource || ''}`,
                deviceId: reportConfig.deviceId,
                environment: `${reportConfig.environment || ''}`,
                customInfo: `${reportConfig.customInfo || ''}`,
                logPageNo: logReportOb.pageIndex + 1, // pageNo start from 1,
                fileDate: logReportOb.logDay,
                logArray: logItems
                    .map(logItem => {
                        return encodeURIComponent(logItem.logString);
                    })
                    .toString()
            }),
            customXHROpts.withCredentials ?? false,
            'POST',
            customXHROpts.headers || {
                'Content-Type': 'application/json',
                'Accept': 'application/json,text/javascript'
            }
        ).then((responseText: any) => {
            if (typeof customXHROpts.responseDealer === 'function') {
                const result = customXHROpts.responseDealer(responseText);
                if (result.resultMsg === ResultMsg.REPORT_LOG_SUCC) {
                    return pageIndex;
                } else {
                    throw new Error(result.desc);
                }
            } else {
                let response;
                try {
                    response = JSON.parse(responseText);
                } catch (e) {
                    throw new Error(`Try to parse response failed, responseText: ${responseText}`);
                }
                if (response?.code === 200) {
                    return pageIndex;
                } else {
                    throw new Error(`Server error, code: ${response?.code}`);
                }
            }
        });
    } else {
        // Resolve directly if no logs in current page.
        return Promise.resolve(null);
    }
}

export default async function reportLog (
    reportConfig: ReportConfig
): Promise<ReportResult> {
    if (!LoganDB.idbIsSupported()) {
        throw new Error(ResultMsg.DB_NOT_SUPPORT);
    } else {
        if (!LoganDBInstance) {
            LoganDBInstance = new LoganDB(Config.get('dbName') as
                | string
                | undefined);
        }
        return await invokeInQueue(async () => {
            const logDaysInfoList: LoganLogDayItem[] = await LoganDBInstance.getLogDaysInfo(
                reportConfig.fromDayString,
                reportConfig.toDayString
            );
            const logReportMap: {
                [key: string]: FormattedLogReportName[];
            } = logDaysInfoList.reduce((acc, logDayInfo: LoganLogDayItem) => {
                return {
                    [logDayInfo[
                        LOG_DAY_TABLE_PRIMARY_KEY
                    ]]: logDayInfo.reportPagesInfo ? logDayInfo.reportPagesInfo.pageSizes.map((i, pageIndex) => {
                        return LoganDBInstance.logReportNameFormatter(
                            logDayInfo[LOG_DAY_TABLE_PRIMARY_KEY],
                            pageIndex
                        );
                    }) : [],
                    ...acc
                };
            }, {});
            const reportResult: ReportResult = {};
            const startDate = dayFormat2Date(reportConfig.fromDayString);
            const endDate = dayFormat2Date(reportConfig.toDayString);
            for (
                let logTime = +startDate;
                logTime <= +endDate;
                logTime += ONE_DAY_TIME_SPAN
            ) {
                const logDay = dateFormat2Day(new Date(logTime));
                if (logReportMap[logDay] && logReportMap[logDay].length > 0) {
                    try {
                        const batchReportResults = await Promise.all(
                            logReportMap[logDay].map(reportName => {
                                return getLogAndSend(reportName, reportConfig);
                            })
                        );
                        reportResult[logDay] = { msg: ResultMsg.REPORT_LOG_SUCC };
                        try {
                            const reportedPageIndexes = batchReportResults.filter(reportedPageIndex => reportedPageIndex !== null) as number[];
                            if (reportedPageIndexes.length > 0 && reportConfig.incrementalReport) {
                                // Delete logs of reported pages after report.
                                await LoganDBInstance.incrementalDelete(logDay, reportedPageIndexes);
                            }
                        } catch (e) {
                            // Noop if deletion failed.
                        }
                    } catch (e) {
                        reportResult[logDay] = {
                            msg: ResultMsg.REPORT_LOG_FAIL,
                            desc: e.message || e.stack || JSON.stringify(e)
                        };
                    }
                } else {
                    reportResult[logDay] = { msg: ResultMsg.NO_LOG };
                }
            }
            return reportResult;
        });
    }
}
