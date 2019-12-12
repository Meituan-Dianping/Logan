package com.meituan.logan.web.controller;

import com.meituan.logan.web.enums.LogTypeEnum;
import com.meituan.logan.web.model.LoganLogDetailModel;
import com.meituan.logan.web.model.LoganLogSimpleModel;
import com.meituan.logan.web.model.LoganTaskModel;
import com.meituan.logan.web.model.Tuple;
import com.meituan.logan.web.model.request.LoganTaskRequest;
import com.meituan.logan.web.model.response.LoganResponse;
import com.meituan.logan.web.service.LoganLogDetailService;
import com.meituan.logan.web.service.LoganTaskService;
import com.meituan.logan.web.util.FileUtil;
import com.meituan.logan.web.util.TypeSafeUtil;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.IOException;
import java.util.List;

/**
 * 功能描述:  <p>日志任务查询，日志详情查询，日志类型查询</p>
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@Controller
@RequestMapping("/logan")
public class LoganController {

    private static final String PARAM_ERROR = "param illegal";
    private static final int DEFAULT_LIMIT = 20;

    @Resource
    private LoganTaskService taskService;
    @Resource
    private LoganLogDetailService detailService;

    @GetMapping("/latest.json")
    @ResponseBody
    public LoganResponse<List<LoganTaskModel>> latestReport() {
        return LoganResponse.success(taskService.queryLatest(DEFAULT_LIMIT));
    }

    /**
     * 任务列表页的搜索
     */
    @GetMapping("/task/search.json")
    @ResponseBody
    public LoganResponse<List<LoganTaskModel>> search(String deviceId, Long beginTime, Long endTime, Integer platform) {
        if (StringUtils.isEmpty(deviceId)) {
            return LoganResponse.badParam(PARAM_ERROR);
        }
        LoganTaskRequest request = new LoganTaskRequest(deviceId, beginTime, endTime, platform);
        request.ready();
        return LoganResponse.success(taskService.search(request));
    }

    /**
     * 通过任务ID查询单个日志的上报信息
     */
    @GetMapping("/task/{taskId}/info.json")
    @ResponseBody
    public LoganResponse<LoganTaskModel> info(@PathVariable("taskId") long taskId) {
        if (taskId <= 0) {
            return LoganResponse.badParam(PARAM_ERROR);
        }
        return LoganResponse.success(taskService.getByTaskId(taskId));
    }

    /**
     * 获取全部日志类型列表
     */
    @GetMapping("/meta/logtypes.json")
    @ResponseBody
    public LoganResponse<List<Tuple<Integer, String>>> logTypes() {
        return LoganResponse.success(LogTypeEnum.allLogTypes());
    }

    /**
     * 通过任务ID和日志类型获取日志详情的索引信息
     */
    @GetMapping("/task/{taskId}/brief.json")
    @ResponseBody
    public LoganResponse<List<List<LoganLogSimpleModel>>> brief(@PathVariable("taskId") int taskId, String logTypes, String keyword) {
        if (taskId <= 0) {
            return LoganResponse.badParam(PARAM_ERROR);
        }
        return LoganResponse.success(detailService.listByTaskIdTypeKeyword(taskId, TypeSafeUtil.parseIntList(logTypes), keyword));
    }

    /**
     * 通过详情索引获取日志详情信息
     */
    @GetMapping("/task/query/details.json")
    @ResponseBody
    public LoganResponse<List<LoganLogDetailModel>> details(String detailIds) {
        if (StringUtils.isBlank(detailIds)) {
            return LoganResponse.badParam(PARAM_ERROR);
        }
        return LoganResponse.success(detailService.listByDetailIds(TypeSafeUtil.parseLongList(detailIds)));
    }

    /**
     * 通过一个详情ID获取该条日志的详情信息
     */
    @GetMapping("/task/{detailId}/detail.json")
    @ResponseBody
    public LoganResponse<LoganLogDetailModel> detail(@PathVariable("detailId") int detailId) {
        if (detailId <= 0) {
            return LoganResponse.badParam(PARAM_ERROR);
        }
        return LoganResponse.success(detailService.getByDetailId(detailId));
    }

    /**
     * 通过日志上报的任务ID获取原始日志文件的下载链接
     */
    @GetMapping("/task/{taskId}/download.json")
    @ResponseBody
    public LoganResponse<String> getLogDownloadUrl(HttpServletRequest request, @PathVariable("taskId") int taskId) {
        if (taskId <= 0) {
            return LoganResponse.badParam(PARAM_ERROR);
        }
        LoganTaskModel model = taskService.getByTaskId(taskId);
        if (model == null) {
            return LoganResponse.badParam(PARAM_ERROR);
        }
        return LoganResponse.success(FileUtil.getDownloadUrl(request, model.getLogFileName()));
    }

    /**
     * 下载
     */
    @GetMapping("/downing")
    public ResponseEntity<byte[]> downloadFile(String name) throws IOException {
        File file = FileUtil.getFile(name);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", name);
        if (file != null && file.exists()) {
            return new ResponseEntity<>(FileUtils.readFileToByteArray(file), headers, HttpStatus.CREATED);
        }
        return new ResponseEntity<>("fileNotFound".getBytes(), headers, HttpStatus.CREATED);
    }
}
