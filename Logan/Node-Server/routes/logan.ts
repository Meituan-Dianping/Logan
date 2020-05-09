import { Router } from "express";

import { decryptLog } from "../utils/decrypt-log";

import { IReportLog } from "../dao/interface/report-log";
import { ILogItem } from "../dao/interface/log-item";
import { ILogContent } from "../dao/interface/log-content";

const router = Router();

router.post('/', async (req, res, next) => {
    const log: IReportLog = req.body;
    const logArray: Array<ILogItem> = log.logArray.split(',').map(it => JSON.parse(decodeURIComponent(it))) as Array<ILogItem>;

    const logContents: Array<ILogContent> = logArray.map(it => decryptLog(it));

    res.status(200).json(logContents);
});

export default router;