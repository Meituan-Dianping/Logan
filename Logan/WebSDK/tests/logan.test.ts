/**
 * @file Tests for logan-web-opensource
 */
var fakeDB = require('fake-indexeddb');
var fakeDBIndex = require('fake-indexeddb/lib/FDBIndex');
var fakeDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');
var fakeDBDataBase = require('fake-indexeddb/lib/FDBDatabase');
var fakeObjectStore = require('fake-indexeddb/lib/FDBObjectStore');
var fakeDBTransaction = require('fake-indexeddb/lib/FDBTransaction');
var fakeIDBCursor = require('fake-indexeddb/lib/FDBCursor');
var fakeIDBRequest = require('fake-indexeddb/lib/FDBRequest');
import {
    dateFormat2Day,
    ONE_DAY_TIME_SPAN,
    M_BYTE,
    sizeOf
} from '../src/lib/utils';
import LogManager from '../src/log-manager';
import LoganInstance from '../src/index';
const DBName = 'testLogan';
const ReportUrl = 'testUrl';
const PublicK =
    '-----BEGIN PUBLIC KEY-----\n' +
    'MIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgG2m5VVtZ4mHml3FB9foDRpDW7Pw\n' +
    'Foa+1eYN777rNmIdnmezQqHWIRVcnTRVjrgGt2ndP2cYT7MgmWpvr8IjgN0PZ6ng\n' +
    'MmKYGpapMqkxsnS/6Q8UZO4PQNlnsK2hSPoIDeJcHxDvo6Nelg+mRHEpD6K+1FIq\n' +
    'zvdwVPCcgK7UbZElAgMBAAE=\n' +
    '-----END PUBLIC KEY-----';

// Ready for faked IndexedDB environment
setDBInWindow();
import IDBM from 'idb-managed';
import { ResultMsg } from '../src/interface';
function setDBInWindow() {
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
function clearDBFromWindow() {
    // @ts-ignore
    window.indexedDB = null;
}
function mockXHR(status: number, responseText: string, statusText: string) {
    (window as any).XMLHttpRequest = class {
        status = 200;
        responseText = '';
        statusText = '';
        readyState = 4;
        open() {}
        onreadystatechange() {}
        setRequestHeader() {}
        send() {
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
    beforeAll(() => {
        LoganInstance.initConfig({
            reportUrl: ReportUrl,
            publicKey: PublicK,
            dbName: DBName
        });
    });
    afterEach(() => {
        IDBM.deleteDB(DBName);
        LogManager.resetQuota();
    });
    test('log', async () => {
        expect.assertions(1);
        const logResult = await LoganInstance.log('aaa', 1);
        expect(logResult).toBe(undefined);
    });
    test('logWithEncryption', async () => {
        expect.assertions(1);
        const logResult = await LoganInstance.logWithEncryption('aaa', 1);
        expect(logResult).toBe(undefined);
    });
    test('log with large size', async () => {
        expect.assertions(2);
        const logNum = 40;
        for (var i = 0; i < logNum; i++) {
            var plaintext = '';
            // 200,000B
            for (var j = 0; j < 25000; j++) {
                plaintext += Math.random()
                    .toString(36)
                    .substr(2, 8);
            }
            var logString = 'log' + i + ':' + plaintext;
            await LoganInstance.log(logString, 1);
            if (i === logNum - 1) {
                const dayResult = await IDBM.getItemsInRangeFromDB(DBName, {
                    tableName: 'log_day_table'
                });
                expect(dayResult[0].reportPagesInfo.pageSizes.length).toBe(9);
                expect(dayResult[0].totalSize).toBeLessThanOrEqual(7 * M_BYTE);
            }
        }
    });
    test('log with special char', async () => {
        const specialString =
            String.fromCharCode(200) + String.fromCharCode(3000);
        expect(sizeOf(specialString)).toBe(5);
        await LoganInstance.log(specialString, 1);
        await LoganInstance.logWithEncryption(specialString, 1);
        const logItems = await IDBM.getItemsInRangeFromDB(DBName, {
            tableName: 'logan_detail_table'
        });
        expect(logItems.length).toBe(2);
    });
    test('report', async () => {
        expect.assertions(2);
        const today = dateFormat2Day(new Date());
        const yesterday = dateFormat2Day(
            new Date(+new Date() - ONE_DAY_TIME_SPAN)
        );
        mockXHR(200, JSON.stringify({ code: 200 }), '');
        await LoganInstance.log('aaa', 1);
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
    });
});

describe('Logan Param Invalid Tests', () => {
    test('logType is not set', async () => {
        expect.assertions(1);
        try {
            // @ts-ignore
            await LoganInstance.log('aaa');
        } catch (e) {
            expect(e.message).toBe('logType needs to be set');
        }
    });
    test('publicKey is not set', async () => {
        expect.assertions(1);
        LoganInstance.initConfig({
            reportUrl: ReportUrl,
            dbName: DBName
        });
        LoganInstance.logWithEncryption('aaa', 1).catch(e => {
            expect(e.message).toBe(
                'publicKey needs to be set before logWithEncryption'
            );
        });
    });
    test('reportConfig is not valid', async () => {
        expect.assertions(3);
        const fromDay = dateFormat2Day(
            new Date(+new Date() - ONE_DAY_TIME_SPAN * 2)
        );
        const toDay = dateFormat2Day(new Date());
        // @ts-ignore
        LoganInstance.report({}).catch(e => {
            expect(e.message).toBe('deviceId is needed');
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
    afterEach(() => {
        IDBM.deleteDB(DBName);
        LogManager.resetQuota();
    });
    test('report fail if xhr status is not 200', async () => {
        expect.assertions(1);
        const today = dateFormat2Day(new Date());
        mockXHR(100, '', '');
        await LoganInstance.log('aaa', 1);
        const reportResult = await LoganInstance.report({
            deviceId: 'aaa',
            fromDayString: today,
            toDayString: today
        });
        expect(reportResult[today].msg).toBe(
            LoganInstance.ResultMsg.REPORT_LOG_FAIL
        );
    });
    test('report fail if server code is not 200', async () => {
        expect.assertions(1);
        const today = dateFormat2Day(new Date());
        mockXHR(200, JSON.stringify({ code: 400 }), '');
        await LoganInstance.log('aaa', 1);
        const reportResult = await LoganInstance.report({
            deviceId: 'aaa',
            fromDayString: today,
            toDayString: today
        });
        expect(reportResult[today].msg).toBe(
            LoganInstance.ResultMsg.REPORT_LOG_FAIL
        );
    });
    test('When IndexedDB is not supported', async () => {
        expect.assertions(1);
        clearDBFromWindow();
        LoganInstance.initConfig({
            reportUrl: ReportUrl,
            publicKey: PublicK,
            dbName: DBName,
            errorHandler: (e: Error) => {
                expect(e.message).toBe(ResultMsg.DB_NOT_SUPPORT);
            }
        });
        await LoganInstance.log('aaa', 1);
        setDBInWindow();
    });
    test('When exceeds log limit', async () => {
        expect.assertions(3);
        const LOG_TRY_TIMES = 4;
        let errorArr: Error[] = [];
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
            await LoganInstance.log('aaa', 1);
        }
        setDBInWindow();
        const logItems = await IDBM.getItemsInRangeFromDB(DBName, {
            tableName: 'logan_detail_table'
        });
        expect(logItems.length).toBe(0);
        expect(errorArr[0].message).toBe(ResultMsg.DB_NOT_SUPPORT);
        expect(errorArr[LOG_TRY_TIMES].message).toBe(
            ResultMsg.EXCEED_TRY_TIMES
        );
    });
});
