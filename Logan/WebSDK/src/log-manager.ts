import Config from './global';
let logTryQuota: number = Config.get('logTryTimes') as number;
function errorTrigger() {
    if (logTryQuota > 0) {
        logTryQuota--;
    }
}

function canSave() {
    return logTryQuota > 0;
}

function resetQuota() {
    logTryQuota = Config.get('logTryTimes') as number;
}

export default {
    errorTrigger,
    canSave,
    resetQuota
};
