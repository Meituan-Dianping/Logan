package com.meituan.logan.web.controller;

import com.meituan.logan.web.model.WebLogTaskModel;
import com.meituan.logan.web.model.response.LoganResponse;
import com.meituan.logan.web.parser.WebLogParser;
import com.meituan.logan.web.service.WebTaskService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

/**
 * 功能描述:  <p>负责接受H5端上报的日志</p>
 *
 * @version 1.0 2019-10-31
 * @since logan-web 1.0
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@Controller
@RequestMapping("/logan/web")
public class WebLogUploadController {

    @Resource
    private WebTaskService webTaskService;

    /**
     * 接收并存储H5端上报的日志
     *
     * @param taskModel H5上报
     * @return LoganResponse<Boolean>
     */
    @PostMapping("/upload.json")
    @ResponseBody
    public LoganResponse<Boolean> receiveWebLog(@RequestBody WebLogTaskModel taskModel) {
        if (taskModel == null || !taskModel.isValid()) {
            return LoganResponse.badParam("invalid params");
        }
        taskModel.setContent(WebLogParser.parse(taskModel.getLogArray()));
        if (webTaskService.saveTask(taskModel)) {
            return LoganResponse.success(true);
        }
        return LoganResponse.exception("save log error");
    }
}
