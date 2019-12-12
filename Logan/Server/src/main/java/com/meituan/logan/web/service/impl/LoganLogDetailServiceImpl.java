package com.meituan.logan.web.service.impl;

import com.alibaba.fastjson.JSON;
import com.google.common.collect.Lists;
import com.meituan.logan.web.dto.LoganLogDetailDTO;
import com.meituan.logan.web.dto.LoganTaskDTO;
import com.meituan.logan.web.enums.LogTypeEnum;
import com.meituan.logan.web.enums.TaskStatusEnum;
import com.meituan.logan.web.mapper.LoganLogDetailMapper;
import com.meituan.logan.web.mapper.LoganTaskMapper;
import com.meituan.logan.web.model.LoganLogDetailModel;
import com.meituan.logan.web.model.LoganLogItem;
import com.meituan.logan.web.model.LoganLogSimpleModel;
import com.meituan.logan.web.service.HandlerDispatcher;
import com.meituan.logan.web.service.LoganLogDetailService;
import com.meituan.logan.web.util.FileUtil;
import com.meituan.logan.web.util.OrderUtil;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import javax.annotation.Resource;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 客户端上报日志详情处理服务
 *
 * @since 2019-10-12 17:10
 */
@Service("loganLogDetailService")
public class LoganLogDetailServiceImpl extends AbstractBatchInsertService<LoganLogDetailDTO> implements LoganLogDetailService {
    private static final Logger LOGGER = Logger.getLogger(LoganLogDetailServiceImpl.class);
    private static final int SIZE = 20;
    private static final Map<String, Object> keyLocks = new ConcurrentHashMap<>();

    @Resource
    private LoganLogDetailMapper detailMapper;
    @Resource
    private LoganTaskMapper taskMapper;
    @Resource
    private HandlerDispatcher handlerDispatcher;

    @Override
    @Transactional
    public List<List<LoganLogSimpleModel>> listByTaskIdTypeKeyword(long taskId, List<Integer> type, String keyword) {
        try {
            LoganTaskDTO task = taskMapper.selectById(taskId);
            if (task == null) {
                return Collections.emptyList();
            }
            tryAnalyze(task);
            List<LoganLogDetailDTO> logDetails = detailMapper.queryByTaskIdTypeKeyword(taskId, type, keyword);
            if (CollectionUtils.isEmpty(logDetails)) {
                return Collections.emptyList();
            }
            Collections.sort(logDetails);
            return Lists.partition(Lists.newArrayList(Lists.transform(logDetails, LoganLogDetailDTO::transformToSimple)), SIZE);
        } catch (Exception e) {
            LOGGER.error(e);
            return Collections.emptyList();
        }
    }

    private void tryAnalyze(LoganTaskDTO task) {
        if (TaskStatusEnum.NORMAL.getStatus() == task.getStatus()) {
            String key = task.getLogFileName();
            synchronized (keyLocks.computeIfAbsent(key, k -> new Object())) {
                if (TaskStatusEnum.NORMAL.getStatus() == task.getStatus()) {
                    File file = FileUtil.getFile(task.getLogFileName());
                    if (file == null || !file.exists()) {
                        return;
                    }
                    try (InputStream in = new FileInputStream(file);
                         BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8))) {
                        String str;
                        while ((str = bufferedReader.readLine()) != null) {
                            saveLogDetail(JSON.parseObject(str, LoganLogItem.class).transferToDetail(task.getId()));
                        }
                        Thread.sleep(50);
                        task.setStatus(TaskStatusEnum.ANALYZED.getStatus());
                        analyzed(task);
                    } catch (Exception e) {
                        LOGGER.error(e);
                    } finally {
                        keyLocks.remove(key);
                    }
                }
            }
        }
    }

    private void analyzed(LoganTaskDTO task) {
        taskMapper.updateStatus(task.getId(), TaskStatusEnum.ANALYZED.getStatus());
    }

    @Override
    public List<LoganLogDetailModel> listByDetailIds(List<Long> detailIds) {
        try {
            List<LoganLogDetailDTO> logDetails = detailMapper.queryByIds(detailIds);
            if (CollectionUtils.isEmpty(logDetails)) {
                return Collections.emptyList();
            }
            List<LoganLogDetailDTO> result = OrderUtil.order(logDetails, detailIds, LoganLogDetailDTO::getId);
            return Lists.newArrayList(Lists.transform(result, dto -> {
                if (dto == null) {
                    return null;
                }
                LoganLogDetailModel model = dto.transformToModel();
                model.setSimpleContent(
                        handlerDispatcher.getHandler(LogTypeEnum.valueOfLogType(dto.getLogType()))
                                .getSimpleContent(dto.getContent()));
                return model;
            }));
        } catch (Exception e) {
            LOGGER.error(e);
            return Collections.emptyList();
        }
    }

    @Override
    public LoganLogDetailModel getByDetailId(long detailId) {
        try {
            LoganLogDetailDTO dto = detailMapper.selectById(detailId);
            if (dto == null) {
                return null;
            }
            LoganLogDetailModel model = dto.transformToModel();
            model.setFormatContent(
                    handlerDispatcher.getHandler(LogTypeEnum.valueOfLogType(dto.getLogType()))
                            .getFormatContent(dto.getContent()));
            return model;
        } catch (Exception e) {
            LOGGER.error(e);
        }
        return null;
    }

    @Override
    protected void execute(List<LoganLogDetailDTO> list) {
        try {
            detailMapper.batchInsert(list);
        } catch (Exception e) {
            LOGGER.error(e);
        }
    }
}
