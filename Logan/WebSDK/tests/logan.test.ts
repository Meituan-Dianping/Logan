/**
 * @file Tests for logan-web-opensource
 */
const fakeDB = require('fake-indexeddb');
const fakeDBIndex = require('fake-indexeddb/lib/FDBIndex');
const fakeDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');
const fakeDBDataBase = require('fake-indexeddb/lib/FDBDatabase');
const fakeObjectStore = require('fake-indexeddb/lib/FDBObjectStore');
const fakeDBTransaction = require('fake-indexeddb/lib/FDBTransaction');
const fakeIDBCursor = require('fake-indexeddb/lib/FDBCursor');
const fakeIDBRequest = require('fake-indexeddb/lib/FDBRequest');
import {
    dateFormat2Day,
    ONE_DAY_TIME_SPAN,
    M_BYTE,
    sizeOf
} from '../src/lib/utils';
import LogManager from '../src/log-manager';
import LoganInstance from '../src/index';
import { ResultMsg, LogSuccHandler } from '../src/interface';
const NodeIndex = require('../src/node-index');
const DBName = 'testLogan';
const ReportUrl = 'testUrl';
const PublicK =
    '-----BEGIN PUBLIC KEY-----\n' +
    'MIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgG2m5VVtZ4mHml3FB9foDRpDW7Pw\n' +
    'Foa+1eYN777rNmIdnmezQqHWIRVcnTRVjrgGt2ndP2cYT7MgmWpvr8IjgN0PZ6ng\n' +
    'MmKYGpapMqkxsnS/6Q8UZO4PQNlnsK2hSPoIDeJcHxDvo6Nelg+mRHEpD6K+1FIq\n' +
    'zvdwVPCcgK7UbZElAgMBAAE=\n' +
    '-----END PUBLIC KEY-----';

function setDBInWindow (): void {
    // @ts-ignore
    window.indexedDB = fakeDB;
    // @ts-ignore
    window.IDBIndex = fakeDBIndex;
    // @ts-ignore
    window.IDBKeyRange = fakeDBKeyRange;
    // @ts-ignore
    window.IDBDatabase = fakeDBDataBase;
    // @ts-ignore
    window.IDBObjectStore = fakeObjectStore;
    // @ts-ignore
    window.IDBTransaction = fakeDBTransaction;
    // @ts-ignore
    window.IDBCursor = fakeIDBCursor;
    // @ts-ignore
    window.IDBRequest = fakeIDBRequest;
}
// Ready for faked IndexedDB environment, before IDBM is imported.
setDBInWindow();
import IDBM from 'idb-managed';
import { ReportResult } from '../build/interface';
const errorH = (): void => { /* Noop */ };
const succH = (): void => { /* Noop */ };

function clearDBFromWindow (): void {
    // @ts-ignore
    window.indexedDB = null;
}
function mockXHR (status: number, responseText: string, statusText: string): void {
    (window as any).XMLHttpRequest = class {
        status = 200;
        responseText = '';
        statusText = '';
        readyState = 4;
        open (): void { /* Noop */ }
        onreadystatechange (): void { /* Noop */ }
        setRequestHeader (): void { /* Noop */ }
        send (): void {
            setTimeout(() => {
                this.readyState = 4;
                this.status = status;
                this.responseText = responseText;
                this.statusText = statusText;
                this.onreadystatechange();
            }, 1000);
        }
    };
}
describe('Logan API Tests', () => {
    afterEach(async () => {
        await IDBM.deleteDB(DBName);
        LogManager.resetQuota();
    });
    test('log', async (done) => {
        LoganInstance.initConfig({
            reportUrl: ReportUrl,
            publicKey: PublicK,
            dbName: DBName,
            errorHandler: errorH,
            succHandler: succH
        });
        LoganInstance.log('aaa', 1);
        setTimeout(() => {
            expect(succH).toBeCalled;
            expect(errorH).not.toBeCalled;
            done();
        }, 1000);
    });
    test('logWithEncryption', async (done) => {
        LoganInstance.initConfig({
            reportUrl: ReportUrl,
            publicKey: PublicK,
            dbName: DBName,
            errorHandler: errorH,
            succHandler: succH
        });
        LoganInstance.logWithEncryption('aaa', 1);
        setTimeout(() => {
            expect(succH).toBeCalled;
            expect(errorH).not.toBeCalled;
            done();
        }, 1000);
    });
    test('customLog', async (done) => {
        const customLogContent = JSON.stringify({
            content: 'aaa',
            type: 100
        });
        let expectLogContent: string, expectEncryptVersion: number;
        const succHandler: LogSuccHandler = (logConfig): void => {
            expectLogContent = logConfig.logContent;
            expectEncryptVersion = logConfig.encryptVersion;
        };
        LoganInstance.initConfig({
            reportUrl: ReportUrl,
            publicKey: PublicK,
            dbName: DBName,
            errorHandler: errorH,
            succHandler: succHandler
        });
        LoganInstance.customLog({
            logContent: customLogContent,
            encryptVersion: 1
        });
        setTimeout(async () => {
            expect(errorH).not.toBeCalled;
            expect(expectLogContent).toBe(customLogContent);
            expect(expectEncryptVersion).toBe(1);
            const logDetails = await IDBM.getItemsInRangeFromDB(DBName, {
                tableName: 'logan_detail_table'
            });
            expect(logDetails.length).toBe(1);
            done();
        }, 1000);
    });
    test('log with large size', async (done) => {
        LoganInstance.initConfig({
            reportUrl: ReportUrl,
            publicKey: PublicK,
            dbName: DBName
        });
        const logNum = 40;
        for (let i = 0; i < logNum; i++) {
            let plaintext = '';
            // 200,000B
            for (let j = 0; j < 25000; j++) {
                plaintext += Math.random()
                    .toString(36)
                    .substr(2, 8);
            }
            const logString = 'log' + i + ':' + plaintext;
            LoganInstance.log(logString, 1);
        }
        setTimeout(async () => {
            expect.assertions(2);
            const dayResult = await IDBM.getItemsInRangeFromDB(DBName, {
                tableName: 'log_day_table'
            });
            expect(dayResult[0].reportPagesInfo.pageSizes.length).toBe(9);
            expect(dayResult[0].totalSize).toBeLessThanOrEqual(7 * M_BYTE);
            done();
        }, 2000);
    });
    test('log with special char', async (done) => {
        LoganInstance.initConfig({
            reportUrl: ReportUrl,
            publicKey: PublicK,
            dbName: DBName
        });
        const specialString =
            String.fromCharCode(200) + String.fromCharCode(3000);
        expect(sizeOf(specialString)).toBe(5);
        LoganInstance.log(specialString, 1);
        LoganInstance.logWithEncryption(specialString, 1);
        setTimeout(async () => {
            const logItems = await IDBM.getItemsInRangeFromDB(DBName, {
                tableName: 'logan_detail_table'
            });
            expect(logItems.length).toBe(2);
            done();
        }, 1000);
    });
    test('report', async (done) => {
        LoganInstance.initConfig({
            reportUrl: ReportUrl,
            publicKey: PublicK,
            dbName: DBName
        });
        expect.assertions(2);
        const today = dateFormat2Day(new Date());
        const yesterday = dateFormat2Day(
            new Date(+new Date() - ONE_DAY_TIME_SPAN)
        );
        mockXHR(200, JSON.stringify({ code: 200 }), '');
        LoganInstance.log('aaa', 1);
        setTimeout(async () => {
            const reportResult = await LoganInstance.report({
                deviceId: 'aaa',
                fromDayString: yesterday,
                toDayString: today
            });
            expect(reportResult[today].msg).toBe(
                LoganInstance.ResultMsg.REPORT_LOG_SUCC
            );
            expect(reportResult[yesterday].msg).toBe(
                LoganInstance.ResultMsg.NO_LOG
            );
            done();
        }, 1000);
    });
    test('customReport', async (done) => {
        LoganInstance.initConfig({
            publicKey: PublicK,
            dbName: DBName
        });
        const today = dateFormat2Day(new Date());
        mockXHR(200, JSON.stringify({ code: 200 }), '');
        LoganInstance.log('aaa', 1);
        setTimeout(async () => {
            const reportResult = await LoganInstance.report({
                fromDayString: today,
                toDayString: today,
                xhrOptsFormatter: () => {
                    return {
                        reportUrl: ReportUrl
                    };
                }
            });
            expect.assertions(1);
            expect(reportResult[today].msg).toBe(
                LoganInstance.ResultMsg.REPORT_LOG_SUCC
            );
            done();
        }, 1000);
    });
});

describe('Logan Param Invalid Tests', () => {
    test('logType is not set', async () => {
        expect.assertions(1);
        LoganInstance.initConfig({
            reportUrl: ReportUrl,
            dbName: DBName,
            errorHandler: (e: Error) => {
                expect(e.message).toBe('logType needs to be set');
            }
        });
        // @ts-ignore
        LoganInstance.log('aaa');
    });
    test('publicKey is not set', async () => {
        LoganInstance.initConfig({
            reportUrl: ReportUrl,
            dbName: DBName,
            errorHandler: (e: Error) => {
                expect(e.message).toBe('publicKey needs to be set before logWithEncryption');
                expect.assertions(1);
            }
        });
        LoganInstance.logWithEncryption('aaa', 1);
    });
    test('reportConfig is not valid', async () => {
        expect.assertions(3);
        const fromDay = dateFormat2Day(
            new Date(+new Date() - ONE_DAY_TIME_SPAN * 2)
        );
        const toDay = dateFormat2Day(new Date());
        // @ts-ignore
        LoganInstance.report({}).catch(e => {
            expect(e.message).toBe('fromDayString is not valid, needs to be YYYY-MM-DD format');
        });
        // @ts-ignore
        LoganInstance.report({
            deviceId: 'aaa',
            fromDayString: toDay,
            toDayString: fromDay
        }).catch(e => {
            expect(e.message).toBe(
                'fromDayString needs to be no bigger than toDayString'
            );
        });
        // @ts-ignore
        LoganInstance.report({
            deviceId: 'aaa',
            fromDayString: fromDay,
            toDayString: `${+new Date()}`
        }).catch(e => {
            expect(e.message).toContain('toDayString is not valid');
        });
    });
});

describe('Logan Exception Tests', () => {
    beforeEach(() => {
        LoganInstance.initConfig({
            reportUrl: ReportUrl,
            publicKey: PublicK,
            dbName: DBName
        });
    });
    afterEach(async () => {
        await IDBM.deleteDB(DBName);
        LogManager.resetQuota();
    });
    test('report fail if xhr status is not 200', async (done) => {
        const today = dateFormat2Day(new Date());
        mockXHR(100, '', '');
        LoganInstance.log('aaa', 1);
        setTimeout(async () => {
            const reportResult = await LoganInstance.report({
                deviceId: 'aaa',
                fromDayString: today,
                toDayString: today
            });
            expect.assertions(2);
            expect(reportResult[today].msg).toBe(
                LoganInstance.ResultMsg.REPORT_LOG_FAIL
            );
            expect(reportResult[today].desc).toBe(
                'Request failed, status: 100, responseText: '
            );
            done();
        }, 1000);
    });
    test('report fail if server code is not 200', async (done) => {
        const today = dateFormat2Day(new Date());
        mockXHR(200, JSON.stringify({ code: 400 }), '');
        LoganInstance.log('aaa', 1);
        setTimeout(async () => {
            const reportResult = await LoganInstance.report({
                deviceId: 'aaa',
                fromDayString: today,
                toDayString: today
            });
            expect.assertions(1);
            expect(reportResult[today].msg).toBe(
                LoganInstance.ResultMsg.REPORT_LOG_FAIL
            );
            done();
        }, 1000);
    });
    test('report with custom response', async (done) => {
        const today = dateFormat2Day(new Date());
        LoganInstance.log('aaa', 1);
        const report = async (): Promise<ReportResult> => {
            return await LoganInstance.report({
                deviceId: 'aaa',
                fromDayString: today,
                toDayString: today,
                xhrOptsFormatter: () => {
                    return {
                        responseDealer: (xhrResponseText: any): any => {
                            const responseOb = JSON.parse(xhrResponseText);
                            if (responseOb.code === 10000) {
                                return {
                                    resultMsg: ResultMsg.REPORT_LOG_SUCC
                                };
                            } else {
                                return {
                                    resultMsg: ResultMsg.REPORT_LOG_FAIL,
                                    desc: `responseOb.code:${responseOb.code}`
                                };
                            }
                        }
                    };
                }
            });
        };
        setTimeout(async () => {
            mockXHR(200, JSON.stringify({ code: 10000 }), '');
            const reportResult1 = await report();
            expect(reportResult1[today].msg).toBe(
                LoganInstance.ResultMsg.REPORT_LOG_SUCC
            );
            mockXHR(200, JSON.stringify({ code: 10001 }), '');
            const reportResult2 = await report();
            expect(reportResult2[today].msg).toBe(
                LoganInstance.ResultMsg.REPORT_LOG_FAIL
            );
            expect.assertions(2);
            done();
        }, 1000);
    });
    test('When IndexedDB is not supported', async (done) => {
        clearDBFromWindow();
        LoganInstance.initConfig({
            reportUrl: ReportUrl,
            publicKey: PublicK,
            dbName: DBName,
            errorHandler: (e: Error) => {
                expect(e.message).toBe(ResultMsg.DB_NOT_SUPPORT);
            }
        });
        LoganInstance.log('aaa', 1);
        setTimeout(() => {
            expect.assertions(1);
            setDBInWindow();
            done();
        }, 1000);
    });
    test('When exceeds log limit', async (done) => {
        const LOG_TRY_TIMES = 4;
        const errorArr: Error[] = [];
        clearDBFromWindow();
        LoganInstance.initConfig({
            logTryTimes: LOG_TRY_TIMES,
            reportUrl: ReportUrl,
            publicKey: PublicK,
            dbName: DBName,
            errorHandler: (e: Error) => {
                errorArr.push(e);
            }
        });
        for (let i = 0; i < LOG_TRY_TIMES + 1; i++) {
            LoganInstance.log('aaa', 1);
        }
        setTimeout(async () => {
            setDBInWindow();
            const logItems = await IDBM.getItemsInRangeFromDB(DBName, {
                tableName: 'logan_detail_table'
            });
            expect.assertions(4);
            expect(logItems.length).toBe(0);
            expect(errorArr[0].message).toBe(ResultMsg.DB_NOT_SUPPORT);
            // 测试save-log内部对tryTime的限制判断
            expect(errorArr[LOG_TRY_TIMES].message).toBe(
                ResultMsg.EXCEED_TRY_TIMES
            );
            LoganInstance.log('bbb', 1);
            // 测试index中logAsync对tryTime的限制判断
            expect(errorArr[LOG_TRY_TIMES + 1].message).toBe(
                ResultMsg.EXCEED_TRY_TIMES
            );
            done();
        }, 2000);
    });
});
describe('Test node-index', () => {
    test('node-index contains all property of logan-web', () => {
        for (const property in LoganInstance) {
            expect(NodeIndex[property]).toBeDefined();
            if (typeof (LoganInstance as any)[property] === 'function') {
                expect(() => {
                    NodeIndex[property]();
                }).not.toThrow();
            }
        }
    });
});
