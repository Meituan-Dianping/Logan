# Logan

[![license](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat)](https://raw.githubusercontent.com/Meituan-Dianping/Logan/master/LICENSE)
[![Release Version](https://img.shields.io/github/release/Meituan-Dianping/Logan.svg?maxAge=2592000?style=flat-square)](https://github.com/Meituan-Dianping/Logan/releases)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Meituan-Dianping/Logan/pulls)
[![Platform Support](https://img.shields.io/badge/Platform-%20iOS%20%7C%20Android%20-brightgreen.svg)](https://github.com/Meituan-Dianping/Logan/wiki)

Logan 是美团点评集团推出的大前端日志系统。名称是 Log 和 An 的组合，代表个体日志服务，同时也是金刚狼大叔的大名。

# 总览

Logan 开源的是一整套日志体系，包括日志的收集存储，上报分析以及可视化展示。我们提供了五个组件，包括端上日志收集存储 、[iOS SDK](https://github.com/Meituan-Dianping/Logan/tree/master/Logan/iOS)、[Android SDK](https://github.com/Meituan-Dianping/Logan/tree/master/Example/Logan-Android)、[Web SDK](https://github.com/Meituan-Dianping/Logan/tree/master/Logan/WebSDK)，后端日志存储分析 [Server](https://github.com/Meituan-Dianping/Logan/tree/master/Logan/Server)，日志分析平台 [LoganSite](https://github.com/Meituan-Dianping/Logan/tree/master/Logan/LoganSite)。并且提供了一个 Flutter 插件[Flutter 插件](https://github.com/Meituan-Dianping/Logan/tree/master/Flutter)

**整体架构**

![Logan](https://mss-shon.sankuai.com/v1/mss_7d6cd84b52d543248bbb734abd392e9a/logan-open-source/logan_arch.png)

# 效果演示

**日志筛选**

![Logan](https://mss-shon.sankuai.com/v1/mss_7d6cd84b52d543248bbb734abd392e9a/logan-open-source/logan_list_filter.gif)

**日志详情**

![Logan](https://mss-shon.sankuai.com/v1/mss_7d6cd84b52d543248bbb734abd392e9a/logan-open-source/logan_detail.gif)

# 快速开始

## iOS

### 环境要求
以下是可以稳定跑起来的iOS配置，系统和xcode版本略大于或小于下面的版本理论上也是可以跑起来的。

```

macOS: 10.15.8

Xcode: 11.2

Cocoapods: 1.8.4

iOS: >= 8.0

```

### 安装 SDK

在你的Xcode工程根目录新建Podfile文件，并在文件中添加如下配置

```
source 'https://github.com/CocoaPods/Specs.git'

platform :ios, '8.0'

target 'TargetName' do

pod 'Logan', '~> 1.2.5'

end

```

最后在项目根目录运行以下命令：
```
pod install 

```

### iOS SDK 接入文档

[iOS SDK](https://github.com/Meituan-Dianping/Logan/tree/master/Logan/iOS)

## Android
```
NDK: r16b

CMake: >= 3.4.1

Jdk: 1.7 或 1.8（推荐）

```

### Android SDK 接入文档
[Android SDK](https://github.com/Meituan-Dianping/Logan/tree/master/Example/Logan-Android)


## Web SDK
可在 Web 平台（ H5 或 PC 环境）上运行的 Logan 组件，实现前端日志的本地存储与上报功能。

### 接入方式
下载 npm 包

```
npm install --save logan-web
```
或者

```
yarn add logan-web
```

### 简单上手

#### 日志存储

```js
import Logan from 'logan-web';
let logContent = 'Your log content';
let logType = 1;

Logan.log(logContent, logType);
```

#### 日志上报

```js
import Logan from 'logan-web';
const reportResult = await Logan.report({
    reportUrl: 'https://yourServerAddressToAcceptLogs',
    deviceId: 'LocalDeviceIdOrUnionId',
    fromDayString: '2019-11-06',
    toDayString: '2019-11-07'
});
```

### Web SDK 接入文档

[Web SDK](https://github.com/Meituan-Dianping/Logan/tree/master/Logan/WebSDK)


## Server

### Server 接入文档

[Server](https://github.com/Meituan-Dianping/Logan/tree/master/Logan/Server)


## LoganSite

### 环境要求
```
Node: ^10.15.3
yarn: ^1.15.2 或 npm ^6.12.0
```

### 安装

#### 本地运行

首先，clone仓库到本地。

在LoganSite根目录下创建文件`.env.development`，并在其中指定`API_BASE_URL`环境变量指向：

```bash
API_BASE_URL=http://location/to/your/server:port
```

然后执行以下命令：

```
$ cd $LOGAN_SITE
$ npm install
$ npm run start
```

或

```
$ cd $LOGAN_SITE
$ yarn
$ yarn start
```

#### 构建

首先，clone仓库到本地。

将 LoganSite/src/common/api.js 中第四行

```javascript
const BASE_URL = process.defineEnv.API_BASE_URL;
```

中 BASE_URL 指向的部分替换成后端服务部署的地址：

```javascript
const BASE_URL = "http://location/to/your/server:port"
```

然后执行以下命令：

```
$ cd $LOGAN_SITE
$ npm install
$ npm run build
```

或

```
$ cd $LOGAN_SITE
$ yarn
$ yarn build
```
### LoganSite 接入文档

[LoganSite](https://github.com/Meituan-Dianping/Logan/tree/master/Logan/LoganSite)


# 最佳实践

在Logan面世之前，日志系统是相对分散的。

![Before_Logan](https://mss-shon.sankuai.com/v1/mss_7d6cd84b52d543248bbb734abd392e9a/logan-open-source/before_logan.png)

不同业务团队各自记录自己的日志，分析问题时再分别收集不同业务团队的日志进行整合，不同团队日志实现方式不同，获取日志的时间周期也不同，使得问题排查效率缓慢。Logan的思路是所有端上日志集中处理，按照不同的type进行区分，分析问题时可以随意聚合，有效提高日志分析效率。

Logan核心体系由四大模块构成：

- 日志输入

- 日志存储

- 后端系统

- 前端系统

![Logan_Process](https://mss-shon.sankuai.com/v1/mss_7d6cd84b52d543248bbb734abd392e9a/logan-open-source/logan_process.png)

新的日志分析流程如下：

![Logan_Case](https://mss-shon.sankuai.com/v1/mss_7d6cd84b52d543248bbb734abd392e9a/logan-open-source/logan_case.png)

# 未来

未来我们会提供基于Logan大数据的数据平台，包含机器学习、疑难日志解决方案、大数据特征分析等高级功能。

最后，我们希望提供更加完整的一体化个案分析生态系统。

![Logan_System](https://mss-shon.sankuai.com/v1/mss_7d6cd84b52d543248bbb734abd392e9a/logan-open-source/logan_system.png)

| Module | Open Source | Processing | Planning |

| :------: | :--: | :-----: | :-: |

| iOS & macOS  |   √  |        |    |

| Android | √ |  |  |

| Web | √ |  |  |

| Back End | √ |  |  |

| Front End | √ |  |  |

| Mini Programs |  | √ |  |

# 贡献

**关于贡献PRs和issue的更多信息，请参考[贡献指南](./CONTRIBUTING.md)**

# 作者

## 客户端

* **白帆** - [baitian0521](https://github.com/baitian0521)

* **曹立成** - [Richard-Cao](https://github.com/Richard-Cao)

* **姜腾** - [jiangteng](https://github.com/jiangteng)

* **杨向南** - [yangxiangnan](https://github.com/yangxiangnan)

* **马小军** - [Mr-xiaojun](https://github.com/Mr-xiaojun)

* **罗恒** - [luoheng158](https://github.com/luoheng158)

## Web端

* **孙懿** - [sylvia1106](https://github.com/sylvia1106)

* **余若晟** - [Retrospection](https://github.com/Retrospection)

## 服务端

* **贺院超** - [he-yuanchao](https://github.com/he-yuanchao)

* **罗志林** - [zlLuo](https://github.com/zlLuo)

[贡献者列表](https://github.com/Meituan-Dianping/Logan/graphs/contributors)

# License

Logan项目采用MIT许可协议 - 详细内容请查看[LICENSE](https://github.com/Meituan-Dianping/Logan/blob/master/LICENSE)。

# 相关文章

[美团点评移动端基础日志库 — Logan](https://tech.meituan.com/Logan.html)

[Logan：美团点评的开源移动端基础日志库](https://tech.meituan.com/logan_open_source.html)


# 相关知识

- [mbedtls](https://github.com/ARMmbed/mbedtls)

- [cJSON](https://github.com/DaveGamble/cJSON)