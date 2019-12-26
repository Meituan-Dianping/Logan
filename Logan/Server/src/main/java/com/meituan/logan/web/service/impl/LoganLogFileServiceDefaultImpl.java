package com.meituan.logan.web.service.impl;

import com.meituan.logan.web.enums.ResultEnum;
import com.meituan.logan.web.parser.LoganProtocol;
import com.meituan.logan.web.service.LoganLogFileService;
import com.meituan.logan.web.util.FileUtil;
import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.InputStream;

@Service
public class LoganLogFileServiceDefaultImpl implements LoganLogFileService {

    private static final Logger LOGGER = Logger.getLogger(LoganLogFileServiceDefaultImpl.class);

    @Override
    public ResultEnum write(InputStream inputStream, String fileName) {
        if (inputStream == null|| StringUtils.isEmpty(fileName)) {
            return ResultEnum.ERROR_PARAM;
        }
        try {
            File file = FileUtil.createNewFile(fileName);
            if (file == null) {
                return ResultEnum.ERROR_LOG_PATH;
            }
            return new LoganProtocol(inputStream, file).process();
        } catch (Exception e) {
            LOGGER.error(e);
        }
        return ResultEnum.EXCEPTION;
    }
}
