export interface IReportLog {
    client: string;
    webSource?: string;
    deviceId: string;
    environment?: string;
    customInfo: string;
    logPageNo: number;
    fileDate: string;
    logArray: string;
}

export const isValid = (reportLog: IReportLog): boolean => {
    if (!reportLog || !reportLog.deviceId || reportLog.logPageNo <= 0 || !reportLog.logArray || isNaN(new Date(reportLog.fileDate).getTime())) {
        return false;
    }
    return true;
};