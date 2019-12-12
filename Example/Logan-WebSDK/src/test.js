var Logan = require('logan-web');
Logan.initConfig({
    /* Demo Key */
    publicKey:
        '-----BEGIN PUBLIC KEY-----\n' +
        'MIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgG2m5VVtZ4mHml3FB9foDRpDW7Pw\n' +
        'Foa+1eYN777rNmIdnmezQqHWIRVcnTRVjrgGt2ndP2cYT7MgmWpvr8IjgN0PZ6ng\n' +
        'MmKYGpapMqkxsnS/6Q8UZO4PQNlnsK2hSPoIDeJcHxDvo6Nelg+mRHEpD6K+1FIq\n' +
        'zvdwVPCcgK7UbZElAgMBAAE=\n' +
        '-----END PUBLIC KEY-----'
});
function timeFormat2Day(date) {
    var Y = date.getFullYear();
    var M = date.getMonth() + 1;
    var D = date.getDate();
    return Y + '-' + (M < 10 ? '0' + M : M) + '-' + (D < 10 ? '0' + D : D);
}
document.getElementById('log').onclick = log;
document.getElementById('logWithEncryption').onclick = logWithEncryption;
document.getElementById('report').onclick = report;

function log() {
    Logan.log('Hello World!', 1);
}

function logWithEncryption() {
    Logan.logWithEncryption('Hello World!', 2);
}

function report() {
    var now = new Date();
    var sevenDaysAgo = new Date(+now - 6 * 24 * 3600 * 1000);
    Logan.report({
        reportUrl: 'https://yourServerAddressToAcceptLogs',
        deviceId: 'test-logan-web',
        fromDayString: timeFormat2Day(sevenDaysAgo),
        toDayString: timeFormat2Day(now),
        webSource: 'browser',
        environment: navigator.userAgent,
        customInfo: JSON.stringify({ userId: 123456, biz: 'Live Better' })
    });
}
