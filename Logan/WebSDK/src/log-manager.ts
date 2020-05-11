import Config from './global-config';
let logTryQuota: number = Config.get('logTryTimes') as number;
function errorTrigger (): void {
    if (logTryQuota > 0) {
        logTryQuota--;
    }
}

function canSave (): boolean {
    return logTryQuota > 0;
}

function resetQuota (): void {
    logTryQuota = Config.get('logTryTimes') as number;
}

export default {
    errorTrigger,
    canSave,
    resetQuota
};
