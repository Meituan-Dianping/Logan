# Logan Website

Logan 网站为开发者提供了 App 上报日志与 Web 上报日志的浏览、检索等功能，帮助开发者以直观的方式查看日志。

关于 Logan 想知道更多？[Logan：美团点评的开源移动端基础日志库](https://tech.meituan.com/2018/10/11/logan-open-source.html)

## Getting Started

### Prerequest
- Node: ^10.15.3
- yarn: ^1.15.2 或 npm ^6.12.0


### Installation

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
or
```
$ cd $LOGAN_SITE
$ yarn
$ yarn start
```
#### 截图

![Index.html](./docs/list-page.png)
![Index.html](./docs/detail-page.png)

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
or
```
$ cd $LOGAN_SITE
$ yarn
$ yarn build
```

## 主要特性
Logan 网站为来自客户端（Android、iOS以及Web前端）的上报日志提供了基础的浏览检索功能，具体包括：
- 上报任务检索：根据日志上报时间、设备编号或用户标志等条件查找日志上报任务。
- 上报任务概览：概览单一任务中记录的所有日志条目。
- 日志类型筛选：根据客户端记录的日志类型对单一任务中记录的所有日志进行过滤筛选。
- 日志关键字筛选：根据关键字对单一任务中记录的所有日志条目进行筛选。
- 单条日志快速定位：提供MiniMap，可根据日志类型和记录时间快速定位到单条日志。
- 单条日志详情展示：展示某条日志原始记录。

### ⭐️**MiniMap控件**

由于端上存储的日志类型较多，数量较大，采取传统分页表格显示配合筛选条件查看的方式效率依旧很低。因此，Logan 特别在日志详情页设计了一种 MiniMap 控件。该控件具有以下特性：
- 直观地展示日志类型：用不同的颜色绘制刻度，代表不同类型的日志
- 便捷地查看日志概要：鼠标覆盖到任意刻度，会显示日志类型和日志记录时间信息
- 快速定位到目标日志：点击任意位置，能快速查看该条日志详情

![Minimap](./docs/minimap.png)



## 项目结构
```
LOGAN_SITE
├── src
│   ├── app.js
│   ├── app.scss
│   ├── app.test.js
│   ├── index.js
│   ├── store.js
│   ├── common          // common components and global functions
│   │   ├── components
│   │   ├── adapter.js
│   │   ├── api.js
│   │   ├── color.js
│   │   ├── time.js
│   │   └── util.js
│   ├── consts          // constants will use in this project
│   └── views
│       ├── components  // page level components to reuse
│       │   ├── list-page
│       │   │   ├── components  // block level components in page
│       │   │   ├── index.js
│       │   │   └── style.scss
│       │   └── log-detail-page
│       │       ├── components  // block level components in page
│       │       ├── index.js
│       │       └── style.scss
│       ├── native-list
│       │   ├── index.js
│       │   └── redux
│       ├── native-log-detail
│       │   ├── index.js
│       │   └── redux
│       ├── web-detail
│       │   ├── index.js
│       │   └── redux
│       └── web-list
│           ├── index.js
│           └── redux
├── config    // webpack configs
├── public
├── scripts   // npm scripts
├── package.json
├── README.md
└── yarn.lock
```

## License
Logan项目采用MIT许可协议 - 详细内容请查看[LICENSE](https://github.com/Meituan-Dianping/Logan/blob/master/LICENSE) 