/** 
 * @file Run in node env for isomorphic projects. logan-web will do nothing if its function is called in node env.
 */
/* eslint-disable */
var NOOP = function () { /* Noop */ };
module.exports = {
    initConfig: NOOP,
    log: NOOP,
    logWithEncryption: NOOP,
    report: NOOP,
    customLog: NOOP,
    ResultMsg: {}
};