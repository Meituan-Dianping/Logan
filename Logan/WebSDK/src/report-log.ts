import { ReportConfig, ResultMsg, ReportResult } from './interface';
import LoganDB from './lib/logan-db';
import {
    LoganLogDayItem,
    FormattedLogReportName,
    LOG_DAY_TABLE_PRIMARY_KEY
} from './lib/logan-db';
import Config from './global';
import { ajaxPost } from './lib/ajax';
import { dayFormat2Date, ONE_DAY_TIME_SPAN, dateFormat2Day } from './lib/utils';
let LoganDBInstance: LoganDB;

async function getLogAndSend(reportName: string, reportConfig: ReportConfig) {
    const logItems = await LoganDBInstance.getLogsByReportName(reportName);
    const logReportOb = LoganDBInstance.logReportNameParser(reportName);
    return await ajaxPost(
        reportConfig.reportUrl || (Config.get('reportUrl') as string),
        {
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
        }
    );
}

export default async function reportLog(
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
                ]]: logDayInfo.reportPagesInfo.pageSizes.map((i, pageIndex) => {
                    return LoganDBInstance.logReportNameFormatter(
                        logDayInfo[LOG_DAY_TABLE_PRIMARY_KEY],
                        pageIndex
                    );
                }),
                ...acc
            };
        }, {});
        let reportResult: ReportResult = {};
        const startDate = dayFormat2Date(reportConfig.fromDayString);
        const endDate = dayFormat2Date(reportConfig.toDayString);
        for (
            let logTime = +startDate;
            logTime <= +endDate;
            logTime += ONE_DAY_TIME_SPAN
        ) {
            const logDay = dateFormat2Day(new Date(logTime));
            if (logReportMap[logDay]) {
                try {
                    const results = ((await Promise.all(
                        logReportMap[logDay].map(reportName => {
                            return getLogAndSend(reportName, reportConfig);
                        })
                    )) as any) as { code: number }[];
                    results.forEach(result => {
                        if (result.code !== 200) {
                            throw new Error(`Server error: ${result.code}`);
                        }
                    });
                    reportResult[logDay] = { msg: ResultMsg.REPORT_LOG_SUCC };
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
    }
}
