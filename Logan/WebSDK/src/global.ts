import { GlobalConfig } from './interface';
const DEFAULT_TRY_TIMES = 3;
let globalConfig: GlobalConfig = {
    logTryTimes: DEFAULT_TRY_TIMES,
    errorHandler: () => {}
};
function validOrBackup(
    param: any,
    type: 'string' | 'number' | 'function',
    backup?: any
) {
    return typeof param === type ? param : backup;
}
export default {
    set: (configOb: GlobalConfig) => {
        globalConfig = {
            publicKey: validOrBackup(configOb.publicKey, 'string'),
            logTryTimes: validOrBackup(
                configOb.logTryTimes,
                'number',
                DEFAULT_TRY_TIMES
            ),
            reportUrl: validOrBackup(configOb.reportUrl, 'string'),
            dbName: validOrBackup(configOb.dbName, 'string'),
            errorHandler: validOrBackup(
                configOb.errorHandler,
                'function',
                () => {}
            )
        };
    },
    get: (propertyKey: keyof GlobalConfig) => {
        return globalConfig[propertyKey];
    }
};
