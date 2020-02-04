package com.meituan.logan.web.controller;

import com.meituan.logan.web.enums.ResultEnum;
import com.meituan.logan.web.model.LoganTaskModel;
import com.meituan.logan.web.model.response.LoganResponse;
import com.meituan.logan.web.parser.RequestContextParser;
import com.meituan.logan.web.service.LoganLogFileService;
import com.meituan.logan.web.service.LoganTaskService;
import com.meituan.logan.web.util.FileUtil;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

/**
 * 客户端日志上报接口
 *
 * @since 2019-10-09 17:56
 * @since logan-web 1.0
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@Controller
@RequestMapping("/logan")
public class LoganUploadController {

    @Resource
    private LoganTaskService taskService;
    @Resource
    private LoganLogFileService fileService;

    /**
     * 一次上报一个任务一天日志
     */
    @PostMapping("/upload.json")
    @ResponseBody
    public LoganResponse<String> upload(HttpServletRequest request) throws IOException {
        LoganTaskModel model = RequestContextParser.parse(request);
        ResultEnum result = fileService.write(request.getInputStream(), model.getLogFileName());
        if (ResultEnum.SUCCESS != result) {
            return LoganResponse.exception(result.name());
        }
        return taskService.insertTask(model) > 0 ?
                LoganResponse.success(FileUtil.getDownloadUrl(request, model.getLogFileName()))
                : LoganResponse.exception(ResultEnum.ERROR_DATABASE.name());

    }
}