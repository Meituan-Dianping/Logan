import { Router } from "express";
import createHttpError from "http-errors";

import { decryptLog } from "../utils/decrypt-log";
import { ILogItem } from "../dao/interface/log-item";
import { IReportLog, isValid } from "../dao/interface/report-log";
import { ILogContent } from "../dao/interface/log-content";
import { WebTask } from "../dao/entity/web-task";
import { decryptLogArrayString } from "../utils/decrypt-log";

const router = Router();

router.post('/', async (req, res, next) => {
    const log: IReportLog = req.body;
    const logArray: Array<ILogItem> = log.logArray.split(',').map(it => JSON.parse(decodeURIComponent(it))) as Array<ILogItem>;

    const logContents: Array<ILogContent> = logArray.map(it => decryptLog(it));

    res.status(200).json(logContents);
});

router.post('/upload', async (req, res, next) => {
    const reportLog: IReportLog = req.body;

    if (!isValid(reportLog)) {
        return next(createHttpError(406, 'invalid params'));
    }

    let webTask = new WebTask();

    webTask.device_id = reportLog.deviceId;
    webTask.web_source = reportLog.webSource;
    webTask.environment = reportLog.environment;
    webTask.page_num = reportLog.logPageNo;
    webTask.content = JSON.stringify(decryptLogArrayString(reportLog.logArray));
    webTask.add_time = Date.now();
    webTask.log_date = new Date(reportLog.fileDate).getTime();

    try {
        await WebTask.insert(webTask);

        res.json({ success: true });
    } catch (error) {
        return next(createHttpError(500, 'save log error'));
    }
});

export default router;