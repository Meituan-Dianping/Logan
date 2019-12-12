# 🐺 Logan Web SDK
Web SDK for Logan, supports logging in the H5 and browser environment.

[中文文档](https://github.com/Meituan-Dianping/Logan/tree/master/Logan/WebSDK/README.ch.md)

## Logan Workflow

![Logan Web Workflow](https://raw.githubusercontent.com/Meituan-Dianping/Logan/master/Logan/WebSDK/img/logan_web_workflow_en.png)

## Getting Started
Install logan-web using `npm`:

```
npm install --save logan-web
```

Or `yarn`:

```
yarn add logan-web
```

## Environment Required
logan-web uses dynamic import() syntax to split codes for smaller entry and chunks. Thus you may need [webpack](https://webpack.js.org/) to bundle your application if you imports logan-web. If you are not familiar with webpack, you can check [Logan Web SDK Example](https://github.com/Meituan-Dianping/Logan/tree/master/Example/Logan-WebSDK) for reference.


## Beginner Demo 
### 🎒 To Log

When you need to log something locally, you can call log() method and the log content will be saved locally in the browser. Logan Web is based on IndexedDB for log storage, and DB operations are asynchronous. So you don't have to wait for this method to return.

Just enjoy logging! 😁

```js
import Logan from 'logan-web';
let logContent = 'Your log content';
let logType = 1;

Logan.log(logContent, logType);
```

### 📤 To Report

When you need to upload local logs to the server, you can use report() method and Logan Web will do the rest for you.

```js
import Logan from 'logan-web';
const reportResult = await Logan.report({
    reportUrl: 'https://yourServerAddressToAcceptLogs',
    deviceId: 'LocalDeviceIdOrUnionId',
    fromDayString: '2019-11-06',
    toDayString: '2019-11-07'
});

console.log(reportResult);
/* e.g.
{ 
	2019-11-06: {msg: "No log exists"},
	2019-11-07: {msg: "Report succ"}
}
*/
```

## API

### 📚 initConfig(globalConfig)
This method is used to set global configs for the single Logan instance. Usually you only need to call this once after Logan is imported. Each time this method is called, all previous global configs will be overwritten by current settings.

* globalConfig: Global config settings for Logan Web.
	* reportUrl(Optional): The server address to accept logs. The reportUrl set in report() method will overide this.
	
	* publicKey(Optional): A 1024 bit public key used for RSA encryption. This key is needed if you will use logWithEncryption() method to make local logs encrypted. You can set your own key matched with the private key on your remote server.
	
	* logTryTimes(Optional): The failure times Logan Web allows for logging. Default to be 3. No further logs will be saved if times exhaust.
	
	* dbName(Optional): Name of the database in IndexedDB. You can set your own dbName. Default to be "logan\_web\_db".
	
	* errorHandler(Optional): This method will collect unhandled Promise rejections may caused by log() and logWithEncryption() method. Generally speaking, log method will not bother you with async exceptions explicitly. But if you want to know the exceptions, you can use this handler.

```js
import Logan from 'logan-web';
Logan.initConfig({
	reportUrl: 'https://yourServerAddressToAcceptLogs',
	publicKey: '-----BEGIN PUBLIC KEY-----\n'+
        'MIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgG2m5VVtZ4mHml3FB9foDRpDW7Pw\n'+
        'Foa+1eYN777rNmIdnmezQqHWIRVcnTRVjrgGt2ndP2cYT7MgmWpvr8IjgN0PZ6ng\n'+
        'MmKYGpapMqkxsnS/6Q8UZO4PQNlnsK2hSPoIDeJcHxDvo6Nelg+mRHEpD6K+1FIq\n'+
        'zvdwVPCcgK7UbZElAgMBAAE=\n'+
        '-----END PUBLIC KEY-----',
    errorHandler: function(e) {}
});
Logan.logWithEncryption('confidentialLogContent', 1);

```

### 📚 log(content, logType)

* content: What you want to log locally.

* logType: Type of the content, to make uploaded content organized by group. You can set your own logType numbers.

### 📚 logWithEncryption(content, logType)
When you have some confidential content to log and you don't want it saved as plaintext in user's local browser, you can use this method. The content will be encrypted by Advanced Encryption Standard(AES) and the key will be encrypted by RSA and saved with the cipher content together. 

Note: This encryption process makes saved logs very difficult to be cracked, but log content can still be eavesdropped before it is saved. And encryption on the client and decryption on the server both take time and may cause performance influence. Thus it is recommended that you use this method only when the log content is confidential.

### 📚 report(reportConfig)
Locally saved logs are indexed and organized by log day, thus logs will be uploaded by days too. This method will resolve a map of results grouped by the day.

* reportConfig: Configs related to this report operation.
	* reportUrl(Optional): The server address that can accept logs. It is not necessary if global reportUrl is already set by initConfig() method.
	
	* deviceId: Unique local deviceId that represents current environment or user on this device. This id is used for later log retrieval from the server.
	
	* fromDayString: Logs that saved from this day (this day is not exclusive) will be uploaded. YYYY-MM-DD format.
	
	* toDayString: Logs that saved until this day (this day is not exclusive) will be uploaded. YYYY-MM-DD format.
	
	* webSource(Optional): Extra report source information. Like browser, WeChat etc.
	
	* environment(Optional): Extra current environment information.
	
	* customInfo(Optional): Extra information of current biz, user etc.

Example:

```js
import Logan from 'logan-web';
const reportResult = await Logan.report({
    reportUrl: 'https://yourServerAddressToAcceptLogs',
    deviceId: 'LocalDeviceIdOrUnionId',
    fromDayString: '2019-11-06',
    toDayString: '2019-11-08',
    webSource: 'Chrome',
    environment: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36',
    customInfo: JSON.stringify({userId: 123456, biz: 'Live Better'})
});

console.log(reportResult);
/* e.g.
{ 
	2019-11-06: {msg: "No log exists"},
	2019-11-07: {msg: "Report succ"},
	2019-11-08: {msg: "Report fail", desc: "Server error: 500"}
}
*/
```

## Limits
Although IndexedDB is well known to have large storage quota, it still has limits. Usually you can use it up to 50MB each origin without user granting permission popped. Thus Logan Web allows up to 7 log days and each day has up to 7MB log limits. Expired logs will be deleted during every log operation.

Each day's report many be splitted into many smaller requests, sent parallel. Each request carrys 1 page (about 1MB) logs and all pages will be joined together on the server side. 


## Logan Web SDK Structure
logan-web is based on the [idb-managed](https://github.com/sylvia1106/idb-managed) package to manage IndexedDB operations, which is also opensourced. Here is the structure map of Logan Web:

![Logan Web Structure](https://raw.githubusercontent.com/Meituan-Dianping/Logan/master/Logan/WebSDK/img/logan_web_structure_en.png)


## License
Contributions to Logan Web SDK will be licensed under [MIT license](https://github.com/Meituan-Dianping/Logan/blob/master/LICENSE).
	
	
