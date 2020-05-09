import { Router } from "express";
import { Between, In, Like } from "typeorm";
import createHttpError from "http-errors";

import { IReportLog, isValid } from "../dao/interface/report-log";
import { ILogContent } from "../dao/interface/log-content";
import { WebTask } from "../dao/entity/web-task";
import { WebDetail } from "../dao/entity/web-detail";
import { decryptLogArrayString } from "../utils/decrypt-log";
import { getDayOffset, getTimeOffset } from "../utils/datetime-util";

const router = Router();

router.get('/', async (req, res, next) => {

});

router.get('/search', async (req, res, next) => {
    const { beginTime, endTime, deviceId } = req.query;

    const _beginTime = parseInt(beginTime.toString());
    const _endTime = parseInt(endTime.toString()) + 24 * 60 * 60 * 1000;
    const _deviceId = deviceId.toString();

    if (_beginTime <= 0 || !_deviceId) {
        return next(createHttpError(406, 'invalid params'));
    }

    const result = await WebTask.find({
        where: { device_id: _deviceId, log_date: Between(_beginTime, _endTime) }
    });

    const logDates = new Set(result.map(it => it.log_date));

    const _result = Array.from(logDates).map(it => {
        const sameDateLog = result.filter(_it => _it.log_date === it);
        const first = sameDateLog.sort()[0];
        return ({
            taskId: first.id,
            deviceId: first.device_id,
            webSource: first.web_source,
            environment: first.environment,
            pageNum: first.page_num,
            addTime: Date.now(),
            logDate: first.log_date,
            status: first.status,
            customReportInfo: first.custom_report_info,
            tasks: sameDateLog.map(_it => _it.id).join(','),
            updateTime: first.update_time
        })
    });

    return res.json(_result);
});

router.get('/latestReport', async (req, res, next) => {
    const lastTasks = await WebTask.find({
        order: { id: 'DESC' },
        take: 200
    });

    const logDates = new Set(lastTasks.map(it => it.log_date));

    const result = Array.from(logDates).map(it => {
        const sameDateLog = lastTasks.filter(_it => _it.log_date === it);
        const logDeviceIds = new Set(sameDateLog.map(_it => _it.device_id));

        return sameDateLog.map(_it => {
            const sameDeviceIdLog = sameDateLog.filter(__it => __it.device_id === _it.device_id);
            const first = sameDeviceIdLog.sort()[0];
            return {
                taskId: first.id,
                deviceId: first.device_id,
                webSource: first.web_source,
                environment: first.environment,
                pageNum: first.page_num,
                addTime: Date.now(),
                logDate: first.log_date,
                status: first.status,
                customReportInfo: first.custom_report_info,
                tasks: sameDateLog.map(_it => _it.id).join(','),
                updateTime: first.update_time
            };
        });
    }).reduce((a, b) => a.concat(b), []);

    res.json(result);
});

router.get('/detailIndex', async (req, res, next) => {
    const { tasks, logTypes, keyword, beginTime, endTime } = req.query;

    const _taskIds = tasks.toString();
    const _logTypes = logTypes.toString();
    const _keyword = keyword.toString();
    const _beginTime = beginTime.toString();
    const _endTime = endTime.toString();

    const taskIdList = _taskIds.split(',').map(it => parseInt(it)).filter(it => it);
    const logTypeList = _logTypes.split(',').map(it => parseInt(it)).filter(it => it);

    const taskList = await WebTask.find({
        where: { id: In(taskIdList) }
    });

    if (!taskList || !taskList.length) {
        return res.json([]);
    }

    taskList.filter(it => !it.status).forEach(it => {
        const logDetail: Array<ILogContent> = JSON.parse(it.content);
        const webDetails = logDetail.map(_it => {
            let webDetail = new WebDetail();
            webDetail.task_id = it.id;
            webDetail.content = _it.c;
            webDetail.log_type = _it.t;
            webDetail.log_time = parseInt(_it.d);
            webDetail.add_time = Date.now();
            webDetail.minute_offset = getDayOffset(new Date(parseInt(_it.d)));
            return webDetail;
        });
        if (webDetails && webDetails.length) {
            WebDetail.insert(webDetails);
        }
    });

    const beginTimeOfffset = getTimeOffset(_beginTime);
    const endTimeOffset = getTimeOffset(_endTime);

    const webLogDetails = await WebDetail.find({
        where: {
            task_id: In(taskIdList),
            minute_offset: Between(beginTimeOfffset, endTimeOffset),
            log_type: In(logTypeList),
            content: Like(`%${_keyword}%`)
        },
        take: 5
    });

    const result = webLogDetails.map(it => ({
        detailId: it.id,
        logType: it.log_type,
        logTime: it.log_time
    }));

    res.json(result);
});

router.get('/taskDetail', async (req, res, next) => {
    const { tasks } = req.query;

    const _taskIds = tasks.toString();

    const taskIdList = _taskIds.split(',').map(it => parseInt(it)).filter(it => it);

    if (taskIdList && taskIdList.length) {
        const webTasks = await WebTask.find({
            where: { id: In(taskIdList) }
        });

        if (webTasks && webTasks.length) {
            const first = webTasks.sort()[0];
            const result = {
                taskId: first.id,
                deviceId: first.device_id,
                webSource: first.web_source,
                environment: first.environment,
                pageNum: first.page_num,
                addTime: Date.now(),
                logDate: first.log_date,
                status: first.status,
                customReportInfo: first.custom_report_info,
                updateTime: first.update_time
            };
            return res.json(result);
        }
    }

    return res.json([]);
});

router.get('/details', async (req, res, next) => {
    const { detailIds } = req.query;

    const _detailIds = detailIds.toString();

    const detailIdList = _detailIds.split(',').map(it => parseInt(it)).filter(it => it);

    const webDetails = await WebDetail.find({
        where: { id: In(detailIdList) }
    });

    if (webDetails && webDetails.length) {
        const result = webDetails.map(it => ({
            id: it.id,
            taskId: it.task_id,
            logType: it.log_type,
            content: it.content,
            logTime: it.log_time,
            logLevel: it.log_level,
            minuteOffset: it.minute_offset,
            addTime: it.add_time
        }));
        return res.json(result);
    }

    return res.json([]);
});

router.get('/logDetail', async (req, res, next) => {
    const { detailId } = req.query;

    const _detailId = parseInt(detailId.toString());

    const webDetail = await WebDetail.findOne({
        where: { id: _detailId }
    });

    if (!webDetail) {
        return next(createHttpError(404, 'log detail not found'));
    }

    const result = {
        id: webDetail.id,
        taskId: webDetail.task_id,
        logType: webDetail.log_type,
        content: webDetail.content,
        logTime: webDetail.log_time,
        logLevel: webDetail.log_level,
        minuteOffset: webDetail.minute_offset,
        addTime: webDetail.add_time
    };

    return res.json(result);
});

router.get('/exception', async (req, res, next) => {
    console.error(new Error('exception'));
    return res.send('exception');
});

router.get('/getDownLoadUrl', async (req, res, next) => {
    const { tasks } = req.query;
    return res.send(`logan/web/download.json?tasks=${tasks}`);
});

router.get('/downLoadLog', async (req, res, next) => {
    const { tasks } = req.query;

    const _taskIds = tasks.toString();

    const taskIdList = _taskIds.split(',').map(it => parseInt(it)).filter(it => it);

    const webTasks = await WebTask.find({
        where: { id: In(taskIdList) }
    });

    if (webTasks && webTasks.length) {
        const result = webTasks.map(it => Array.from(Buffer.from(it.content))).reduce((a, b) => a.concat(b), []);
        return res.contentType('application/octet-stream').attachment(_taskIds).status(201).send(Buffer.from(result));
    }
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