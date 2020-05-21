import { CustomDB, idbIsSupported, deleteDB } from 'idb-managed';
import { dateFormat2Day, M_BYTE, sizeOf, getStartOfDay, dayFormat2Date } from './utils';
import { ResultMsg } from '../interface';
const LOGAN_DB_VERSION = 1;
const LOGAN_DB_NAME = 'logan_web_db';
const LOG_DETAIL_TABLE_NAME = 'logan_detail_table';
const LOG_DETAIL_REPORTNAME_INDEX = 'logReportName';
const LOG_DETAIL_CREATETIME_INDEX = 'logCreateTime';
const LOG_DAY_TABLE_NAME = 'log_day_table';
export const LOG_DAY_TABLE_PRIMARY_KEY = 'logDay';
export type FormattedLogReportName = string;
const DEFAULT_LOG_DURATION = 7 * 24 * 3600 * 1000; // logan-web keeps 7 days logs locally
const DEFAULT_SINGLE_DAY_MAX_SIZE = 7 * M_BYTE; // 7M storage limit for one day
const DEFAULT_SINGLE_PAGE_MAX_SIZE = 1 * M_BYTE; // 1M storage limit for one page
type TimeStamp = number;
interface LogReportNameParsedOb {
    logDay: string;
    pageIndex: number;
}
interface LoganLogItem {
    [LOG_DETAIL_REPORTNAME_INDEX]: string;
    [LOG_DETAIL_CREATETIME_INDEX]: TimeStamp;
    logSize: number;
    logString: string;
}

export interface LoganLogDayItem {
    [LOG_DAY_TABLE_PRIMARY_KEY]: string;
    totalSize: number;
    reportPagesInfo: {
        pageSizes: number[]; // Array of pageSize of each page.
    };
}
export default class LoganDB {
    public static idbIsSupported = idbIsSupported;
    public static deleteDB = deleteDB;
    private DB: CustomDB;
    constructor(dbName?: string) {
        this.DB = new CustomDB({
            dbName: dbName || LOGAN_DB_NAME,
            dbVersion: LOGAN_DB_VERSION,
            tables: {
                [LOG_DETAIL_TABLE_NAME]: {
                    indexList: [
                        {
                            indexName: LOG_DETAIL_REPORTNAME_INDEX,
                            unique: false
                        },
                        {
                            indexName: LOG_DETAIL_CREATETIME_INDEX,
                            unique: false
                        }
                    ]
                },
                [LOG_DAY_TABLE_NAME]: {
                    primaryKey: LOG_DAY_TABLE_PRIMARY_KEY
                }
            }
        });
    }
    /**
     * @param logDay
     * @param pageIndex start from 0
     */
    logReportNameFormatter (
        logDay: string,
        pageIndex: number
    ): FormattedLogReportName {
        return `${logDay}_${pageIndex}`;
    }
    logReportNameParser (reportName: FormattedLogReportName): LogReportNameParsedOb {
        const splitArray = reportName.split('_');
        return {
            logDay: splitArray[0],
            pageIndex: +splitArray[1]
        };
    }
    async getLogDayInfo (logDay: string): Promise<LoganLogDayItem | null> {
        return ((await this.DB.getItem(
            LOG_DAY_TABLE_NAME,
            logDay
        )) as any) as LoganLogDayItem | null;
    }
    async getLogDaysInfo (
        fromLogDay: string,
        toLogDay: string
    ): Promise<LoganLogDayItem[]> {
        if (fromLogDay === toLogDay) {
            const result = ((await this.DB.getItem(
                LOG_DAY_TABLE_NAME,
                fromLogDay
            )) as any) as LoganLogDayItem | null;
            return result ? [result] : [];
        } else {
            return ((await this.DB.getItemsInRange({
                tableName: LOG_DAY_TABLE_NAME,
                indexRange: {
                    indexName: LOG_DAY_TABLE_PRIMARY_KEY,
                    lowerIndex: fromLogDay,
                    upperIndex: toLogDay,
                    lowerExclusive: false,
                    upperExclusive: false
                }
            })) as any[]) as LoganLogDayItem[];
        }
    }
    async getLogsByReportName (
        reportName: FormattedLogReportName
    ): Promise<LoganLogItem[]> {
        const logs = ((await this.DB.getItemsInRange({
            tableName: LOG_DETAIL_TABLE_NAME,
            indexRange: {
                indexName: LOG_DETAIL_REPORTNAME_INDEX,
                onlyIndex: reportName
            }
        })) as any[]) as LoganLogItem[];
        return logs;
    }
    async addLog (logString: string): Promise<void> {
        const logSize = sizeOf(logString);
        const now = new Date();
        const today: string = dateFormat2Day(now);
        const todayInfo: LoganLogDayItem = (await this.getLogDayInfo(
            today
        )) || {
            [LOG_DAY_TABLE_PRIMARY_KEY]: today,
            totalSize: 0,
            reportPagesInfo: {
                pageSizes: [0]
            }
        };
        if (todayInfo.totalSize + logSize > DEFAULT_SINGLE_DAY_MAX_SIZE) {
            throw new Error(ResultMsg.EXCEED_LOG_SIZE_LIMIT);
        }
        if (!todayInfo.reportPagesInfo || !todayInfo.reportPagesInfo.pageSizes) {
            todayInfo.reportPagesInfo = { pageSizes: [0] };
        }
        const currentPageSizesArr = todayInfo.reportPagesInfo.pageSizes;
        const currentPageIndex = currentPageSizesArr.length - 1;
        const currentPageSize = currentPageSizesArr[currentPageIndex];
        const needNewPage =
            currentPageSize > 0 &&
            currentPageSize + logSize > DEFAULT_SINGLE_PAGE_MAX_SIZE;
        const nextPageSizesArr = (function (): number[] {
            const arrCopy = currentPageSizesArr.slice();
            if (needNewPage) {
                arrCopy.push(logSize);
            } else {
                arrCopy[currentPageIndex] += logSize;
            }
            return arrCopy;
        })();
        const logItem: LoganLogItem = {
            [LOG_DETAIL_REPORTNAME_INDEX]: this.logReportNameFormatter(
                today,
                needNewPage ? currentPageIndex + 1 : currentPageIndex
            ),
            [LOG_DETAIL_CREATETIME_INDEX]: +now,
            logSize,
            logString
        };
        const updatedTodayInfo: LoganLogDayItem = {
            [LOG_DAY_TABLE_PRIMARY_KEY]: today,
            totalSize: todayInfo.totalSize + logSize,
            reportPagesInfo: {
                pageSizes: nextPageSizesArr
            }
        };
        // The expire time is the start of the day after 7 days.
        const durationBeforeExpired =
            DEFAULT_LOG_DURATION - (+new Date() - getStartOfDay(new Date()));
        await this.DB.addItems([
            {
                tableName: LOG_DAY_TABLE_NAME,
                item: updatedTodayInfo,
                itemDuration: durationBeforeExpired
            },
            {
                tableName: LOG_DETAIL_TABLE_NAME,
                item: logItem,
                itemDuration: durationBeforeExpired
            }
        ]);
    }
    /**
     * Delete reported pages of logDay, in case that new pages are added after last report.
     */
    async incrementalDelete (logDay: string, reportedPageIndexes: number[]): Promise<void> {
        const dayInfo: LoganLogDayItem | null = await this.getLogDayInfo(logDay);
        if (dayInfo && dayInfo.reportPagesInfo && dayInfo.reportPagesInfo.pageSizes instanceof Array) {
            const currentPageSizesArr = dayInfo.reportPagesInfo.pageSizes;
            const currentTotalSize = dayInfo.totalSize;
            const totalReportedSize = currentPageSizesArr.reduce((accSize, currentSize, indexOfPage) => {
                if (reportedPageIndexes.indexOf(indexOfPage) >= 0) {
                    return accSize + currentSize;
                } else {
                    return accSize;
                }
            }, 0);
            const pageSizesArrayWithNewPage = (function addNewPageIfLastPageIsReported (): number[] {
                // Add a new page with 0 page size if the last page is reported.
                if (reportedPageIndexes.indexOf(currentPageSizesArr.length - 1) >= 0) {
                    return currentPageSizesArr.concat([0]);
                } else {
                    return currentPageSizesArr;
                }
            })();
            const resetReportedPageSizes = pageSizesArrayWithNewPage.reduce((accSizesArray, currentSize, index) => {
                if (reportedPageIndexes.indexOf(index) >= 0) {
                    return accSizesArray.concat([0]); // Reset to 0 if this page is reported.
                } else {
                    return accSizesArray.concat([currentSize]);
                }
            }, [] as number[]);
            // Update dayInfo with new pageSizeArray and new totalSize
            const updatedDayInfo = {
                ...dayInfo,
                reportPagesInfo: {
                    pageSizes: resetReportedPageSizes
                },
                totalSize: Math.max(currentTotalSize - totalReportedSize, 0)
            };
            // The expire time is the start of the day after 7 days.
            const durationBeforeExpired = DEFAULT_LOG_DURATION - (+new Date() - getStartOfDay(new Date())) - (getStartOfDay(new Date()) - dayFormat2Date(logDay).getTime());
            await this.DB.addItems([
                {
                    tableName: LOG_DAY_TABLE_NAME,
                    item: updatedDayInfo,
                    itemDuration: durationBeforeExpired
                }
            ]);
            // Delete logs of reported pages by iterating reportedPageIndexes.
            for (const pageIndex of reportedPageIndexes) {
                await this.DB.deleteItemsInRange([
                    {
                        tableName: LOG_DETAIL_TABLE_NAME,
                        indexRange: {
                            indexName: LOG_DETAIL_REPORTNAME_INDEX,
                            onlyIndex: this.logReportNameFormatter(logDay, pageIndex)
                        }
                    }
                ]);
            }
        }
    }
}
