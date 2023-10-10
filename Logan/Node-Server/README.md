### Logan-Web nodejs sevrer端



##### 部署步骤

1. `yarn install`

2. `yarn run start`



> 注意：
>
> 1. `ORM`框架生成的表，缺少相应的`key`（参照原建表语句），需要手动添加
>
> 2. 因代码逻辑较为简单，暂未提取`service`层，有需要的可自行提取`dao`的逻辑到`service`



##### 测试

```javascript
import Logan from "logan-web";
import Axios from "axios";

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

    let res;

    res = await Axios.get(`${baseUrl}/search?beginTime=1588291200000&endTime=1590796800000&deviceId=LocalDeviceIdOrUnionId`);
    console.log(res.data);

    res = await Axios.get(`${baseUrl}/latestReport`);
    console.log(res.data);

    res = await Axios.get(`${baseUrl}/detailIndex?tasks=1&logTypes=1&keyword=content&beginTime=00:00&endTime=23:59`);
    console.log(res.data);

    res = await Axios.get(`${baseUrl}/taskDetail?tasks=1&logTypes=1&keyword=content&beginTime=00:00&endTime=23:59`);
    console.log(res.data);

    res = await Axios.get(`${baseUrl}/details?detailIds=1`);
    console.log(res.data);

    res = await Axios.get(`${baseUrl}/logDetail?detailId=1`);
    console.log(res.data);

    res = await Axios.get(`${baseUrl}/exception`);
    console.log(res.data);

    res = await Axios.get(`${baseUrl}/getDownLoadUrl?tasks=1`);
    console.log(res.data);

    res = await Axios.get(`${baseUrl}/downLoadLog?tasks=1`);
    console.log(res.data);
})();

```
