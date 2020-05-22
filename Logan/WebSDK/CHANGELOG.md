# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.1.0](https://github.com/Meituan-Dianping/Logan/compare/v1.1.0-beta.6...v1.1.0) (2020-05-22)

## [1.1.0-beta.6](https://github.com/Meituan-Dianping/Logan/compare/v1.1.0-beta.5...v1.1.0-beta.6) (2020-05-21)


### Bug Fixes

* :bug: fix idb transaction problems by updating idb-managed ([b1336b6](https://github.com/Meituan-Dianping/Logan/commit/b1336b690d3af67cee4d3614547088b47a9ca5b4))
* :bug: to be compatible with es5 env ([c13c13c](https://github.com/Meituan-Dianping/Logan/commit/c13c13c94e6d4c042f5a5effa27b0fbaa772d64b))

## [1.1.0-beta.5](https://github.com/Meituan-Dianping/Logan/compare/v1.1.0-beta.4...v1.1.0-beta.5) (2020-05-19)

## [1.1.0-beta.4](https://github.com/Meituan-Dianping/Logan/compare/v1.1.0-beta.3...v1.1.0-beta.4) (2020-05-19)

## [1.1.0-beta.3](https://github.com/Meituan-Dianping/Logan/compare/v1.1.0-beta.2...v1.1.0-beta.3) (2020-05-11)


### Bug Fixes

* :bug: fix logan operations race condition problem ([be34293](https://github.com/Meituan-Dianping/Logan/commit/be34293220932ec6cb0a8c3d6cebdad763956921))

## [1.1.0-beta.2](https://github.com/Meituan-Dianping/Logan/compare/v1.1.0-beta.1...v1.1.0-beta.2) (2020-05-08)


### Bug Fixes

* :bug: no need to add a new page if current page is new in the incremental deletion operation ([33dffc7](https://github.com/Meituan-Dianping/Logan/commit/33dffc783b2f7422b6dd16f985fb0c99acd033b2))

## [1.1.0-beta.1](https://github.com/Meituan-Dianping/Logan/compare/v1.1.0-beta.0...v1.1.0-beta.1) (2020-05-08)


### Features

* :art: support responseDealer in xhrOptsFormatter ([768a6bb](https://github.com/Meituan-Dianping/Logan/commit/768a6bb2417c5f55d3455b78619c11ff1d1afca4))
* :sparkles: support incremental report ([b3dcd49](https://github.com/Meituan-Dianping/Logan/commit/b3dcd491d7c5165ace2ef39cd5e9a62be04c0421))

## [1.1.0-beta.0](https://github.com/Meituan-Dianping/Logan/compare/v1.0.5...v1.1.0-beta.0) (2020-04-02)


### Features

* :sparkles: add customLog && custom xhrOptsFormatter for report ([9a76674](https://github.com/Meituan-Dianping/Logan/commit/9a766742bd1bc81a855f25b0b5890516488b2b13))


### Bug Fixes

* :bug:  replace const/let in js-encrypt.js ([7283502](https://github.com/Meituan-Dianping/Logan/commit/72835024c53c44b1d56dd7fa6fe36fdf13c9ea36))

## 1.0.5 (2020-03-20)


### Bug Fixes

* add linter, fix dayFormat, change log function to sync ([fa390a0](https://github.com/Meituan-Dianping/Logan/commit/fa390a0f2d1dcbb251d014af5231481c21d99657)), closes [#217](https://github.com/Meituan-Dianping/Logan/issues/217).
* add node_index for node env ([da67c31](https://github.com/Meituan-Dianping/Logan/commit/da67c31217149548099a2cb205a59c1891c00223))
* when dayInfo object has no reportPagesInfo ([70c8e1a](https://github.com/Meituan-Dianping/Logan/commit/70c8e1aa1f590c67114935d0008e141aa8e6d6dd))


## 1.0.4 (2019-12-23)


### Bug Fixes

* Update serialize-javascript to 2.1.1+

## 1.0.3 (2019-11-26)

### Bug Fixes

* Fix duration for log items


## 1.0.2 (2019-11-21)

### Bug Fixes

* Log parallel
* Shift during saveRecursion


## 1.0.1 (2019-11-20)

### Features

* Add es6 polyfill
* Add report
* Add saveLog
* Add tests
* Report error catch
