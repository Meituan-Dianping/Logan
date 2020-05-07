### Logan-Web nodejs解码实践



##### 部署步骤

1. `yarn install`

2. `yarn run start`



##### 测试

```javascript
import Logan from "logan-web";

(async () => {
    Logan.initConfig({
        reportUrl: 'https://yourServerAddressToAcceptLogs',
        publicKey: '-----BEGIN PUBLIC KEY-----\n' +
            'MIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgG2m5VVtZ4mHml3FB9foDRpDW7Pw\n' +
            'Foa+1eYN777rNmIdnmezQqHWIRVcnTRVjrgGt2ndP2cYT7MgmWpvr8IjgN0PZ6ng\n' +
            'MmKYGpapMqkxsnS/6Q8UZO4PQNlnsK2hSPoIDeJcHxDvo6Nelg+mRHEpD6K+1FIq\n' +
            'zvdwVPCcgK7UbZElAgMBAAE=\n' +
            '-----END PUBLIC KEY-----',
        errorHandler(e: any) { console.error(e); }
    });
    const reportResult = await Logan.report({
        reportUrl: 'http://localhost:9002',
        deviceId: 'LocalDeviceIdOrUnionId',
        fromDayString: '2020-05-01',
        toDayString: '2020-05-10',
        webSource: '',
        environment: '',
        customInfo: ''
    });

    console.log(reportResult);
})();

```
