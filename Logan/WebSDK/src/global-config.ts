import { GlobalConfig } from './interface';
const DEFAULT_TRY_TIMES = 3;
const Noop = (): void => { /* Noop */ };
let globalConfig: GlobalConfig = {
    logTryTimes: DEFAULT_TRY_TIMES,
    errorHandler: Noop,
    succHandler: Noop
};
function validOrBackup (
    param: any,
    type: 'string' | 'number' | 'function',
    backup: any
): any {
    return typeof param === type ? param : backup;
}
export default {
    set: (configOb: GlobalConfig): void => {
        globalConfig = {
            publicKey: validOrBackup(configOb.publicKey, 'string', undefined),
            logTryTimes: validOrBackup(
                configOb.logTryTimes,
                'number',
                DEFAULT_TRY_TIMES
            ),
            reportUrl: validOrBackup(configOb.reportUrl, 'string', undefined),
            dbName: validOrBackup(configOb.dbName, 'string', undefined),
            errorHandler: validOrBackup(
                configOb.errorHandler,
                'function',
                Noop
            ),
            succHandler: validOrBackup(
                configOb.succHandler,
                'function',
                Noop
            )
        };
    },
    get: (propertyKey: keyof GlobalConfig): any => {
        return globalConfig[propertyKey];
    }
};
