# 🐺 Logan Web SDK
可在 Web 平台（ H5 或 PC 环境）上运行的 Logan 组件，实现前端日志的本地存储与上报功能。

[English Readme](https://github.com/Meituan-Dianping/Logan/tree/master/Logan/WebSDK/README.md)

## 前端日志的工作流
很多时候，开发者本地难以复现或触达用户端的异常情况。这种时候，端上完整的日志流及上下文信息将帮助开发者更有效地还原问题现场，定位并解决这些疑难杂症。然而大体积日志流的实时上报将耗费巨大的用户及企业流量，真正能帮助开发者解决问题的却只有极少部分。因此 Logan 在实现前端日志流的存储与上报时，采用的是用户端日志本地存储结合问题反馈时触发上报的方式：

![Logan Web Workflow](https://raw.githubusercontent.com/Meituan-Dianping/Logan/master/Logan/WebSDK/img/logan_web_workflow.png)

## 接入方式
下载 npm 包

```
npm install --save logan-web
```
或者

```
yarn add logan-web
```

## 环境需要
logan-web 使用了动态导入 (dynamic imports) 来分割代码，目的是实现按需加载。因此你需要使用 [webpack](https://webpack.docschina.org/) 来打包你的项目。如果你对 webpack 还不太熟悉的话，可以参考 [Logan Web SDK Example](https://github.com/Meituan-Dianping/Logan/tree/master/Example/Logan-WebSDK) 该文件夹。


## 简单上手
### 🎒 日志存储
在脚本代码中你可以使用 log() 方法来记录日志内容。日志信息会被 Logan Web 按序保存在本地浏览器的 IndexedDB 库中。由于 IndexedDB API 都是异步执行的，因此你无需等待 log() 方法的返回，只要像你平时使用 console.log() 一样，尽管打日志即可~

```js
import Logan from 'logan-web';
let logContent = 'Your log content';
let logType = 1;

Logan.log(logContent, logType);
```

### 📤 日志上报
你可以在用户在页面点击反馈或者代码捕捉异常等时机，调用 report() 方法来触发 Logan 本地日志的上报。Logan 的本地日志是按照天存储的，因此你需要通过参数告诉 Logan 你想上报哪几天的日志内容。

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
该方法为 Logan 单例设定全局配置。一般情况下你只需在引入 Logan 后执行一次该方法，设定好全局参数即可。该方法每次被调用时，都会覆盖现有所有的 Logan 全局配置。该方法不是必要的，以下配置参数也都是可选的。

* globalConfig: 全局参数的配置对象。
	* reportUrl (可选): 用于接收上报日志的服务器地址。如果在调用 report 方法时也配置了 reportUrl，会优先采用那个地址进行上报。
	
	* publicKey (可选): 1024 位的 RSA 加密公钥. 如果你需要调用 logWithEncryption() 方法对本地日志进行加密操作，那么你必须事先配置该公钥。与该公钥配对的私钥存储于你的服务器上。
	
	* logTryTimes (可选): Logan 在遇到本地存储失败的情况下，会尝试的次数。默认为 3 次。如果 Logan 存储失败了 logTryTimes 次数后将不再进行后续日志的存储。
	
	* dbName (可选): 你可以配置该项来自定义本地 DB 库的名字。默认为 logan\_web\_db。不同DB 库之间的数据是隔离而不受影响。
	
	* errorHandler (可选): 你可以配置该项来接收 log() 和 logWithEncryption() 方法可能产生的 Promise rejection. Logan 希望你能轻松地调用 log 来存储日志，而不是在每个异步 log 方法后面都得追加一个 catch。但如果你确实想知道 Logan 在存储时是否报错了，你可以配置该方法来获取异常。

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

* content: 日志内容。

* logType: 日志类型。日志类型用于日志分类，便于你对已上报的日志内容进行分类查看。你可以自己定义需要的日志类型。

### 📚 logWithEncryption(content, logType)

使用 log() 方法落地的日志接近于明文存储，任何有办法触达该用户端的人都能够获取到本地日志。如果你期望一些日志内容加密后再落地，你可以调用该方法。Logan 使用对称加密结合非对称加密的方式来保障本地日志安全。日志内容会使用 AES 进行加密，同时 AES 加密时使用的对称密钥会使用 RSA 进行非对称加密，加密后的密钥密文会和日志密文一起落地下来。

需要注意的是：虽然使用该方法存储后的日志很难再被破解，但是不能保证你的日志内容在存储之前不被窃听。另外由于在用户端加密以及在服务端解密都更耗费时间且可能引起性能问题，所以建议你只在日志内容敏感的必要时候使用该方法。

### 📚 report(reportConfig)

该 report() 异步方法会从本地 DB 库中获取指定天的日志逐天进行上报。上报完成后会返回一个天为 key，上报结果为 value 的对象。

* reportConfig: 本次上报的参数对象。

	* reportUrl (可选): 用于接收本地上报日志内容的服务器地址。如果你已通过 initConfig() 设置了同样的 reportUrl 作为全局上报地址，该项可略。
	
	* deviceId: 该用户端环境的唯一标识符，用于区分其他设备环境上报的日志，你需要通过该标识符在服务端检索已上报的日志信息。
	
	* fromDayString: 上报该天及之后的日志，YYYY-MM-DD 格式。	
	* toDayString: 上报该天及之前的日志，YYYY-MM-DD 格式.
	
	* webSource (可选): 当前上报来源，如Chrome、微信、QQ等。
	
	* environment (可选): 当前环境信息，如当前UA信息等。
	
	* customInfo (可选): 当前用户或业务附加信息。

用法示例：

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

## 容量设限
尽管 IndexedDB 的数据容量较之于其他浏览器存储空间来说是很大了，但它也是有容量限制的。IndexedDB 的容量限制是域隔离的，有些浏览器会在当前域下 IndexedDB 超过 50MB 数据用量时弹出用户授权弹框来引导用户允许更大容量的本地存储使用空间。为了避免影响用户，Logan Web 将最多只存储 7 天日志，每天日志量限制在 7M。达到该日志量后，后续的当天日志将不再能存储成功。过期日志会在下一次 log 时被清除。

一天的上报可能会被拆分成多个小体积的分页并发发送。每页承载大约 1MB 体积的日志量，在服务端会将这些分页拼接成完整的当天日志。


## Logan Web SDK的整体架构
logan-web 是在同样开源的 [idb-managed](https://github.com/sylvia1106/idb-managed) 该包基础上搭建的。该包主要负责对 IndexedDB API 的封装与调用。以下是 logan-web 的整体架构示意图：

![Logan Web 架构](https://raw.githubusercontent.com/Meituan-Dianping/Logan/master/Logan/WebSDK/img/logan_web_structure.png)


## 软件许可协议
Logan Web 遵照 [MIT 许可协议](https://github.com/Meituan-Dianping/Logan/blob/master/LICENSE)
