package com.meituan.logan.web.parser;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.meituan.logan.web.dto.WebLogDetailDTO;
import com.meituan.logan.web.enums.WebLogFieldEnum;
import com.meituan.logan.web.util.DateTimeUtil;
import com.meituan.logan.web.util.LocalStringUtils;
import org.apache.commons.codec.binary.Base64;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.math.NumberUtils;

import java.net.URLDecoder;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;

/**
 * 功能描述:  <p></p>
 *
 * @version 1.0 2019-10-31
 * @since logan-web 1.0
 */
public class WebLogParser {

    public static String parse(String logArray) {
        List<String> logs = new LinkedList<>();
        String[] logItems = logArray.split(",");
        for (String item : logItems) {
            String content = URLDecoder.decode(item);
            JSONObject jsonObject = JSON.parseObject(content);
            int version = (int) jsonObject.getOrDefault(WebLogFieldEnum.VERSION.key, 0);
            if (version == 0) {
                parseByVersion0(jsonObject, logs);
            } else if (version == 1) {
                parseByVersion1(jsonObject, logs);
            }
        }
        return JSON.toJSONString(logs);
    }

    private static void parseByVersion0(JSONObject jsonObject, List<String> logs) {
        String log = jsonObject.getString(WebLogFieldEnum.LOG.key);
        if (StringUtils.isNotEmpty(log)) {
            logs.add(new String(Base64.decodeBase64(log)));
        }
    }

    private static void parseByVersion1(JSONObject jsonObject, List<String> logs) {
        byte[] log = Base64.decodeBase64(jsonObject.getString(WebLogFieldEnum.LOG.key));
        String iv = jsonObject.getString(WebLogFieldEnum.IV.key);
        String secretKey = jsonObject.getString(WebLogFieldEnum.KEY.key);
        if (LocalStringUtils.isAllNotEmpty(iv, secretKey) && log != null) {
            String content = decryptContent(log, iv, secretKey);
            if (content != null) {
                logs.add(content);
            }
        }
    }

    private static String decryptContent(byte[] log, String iv, String secretKey) {
        return WebLogDecryptHelper.create(secretKey).doDecrypt(iv, log);
    }

    public static List<WebLogDetailDTO> parseWebLogDetail(String content, long taskId) {
        List<String> logs = JSON.parseArray(content, String.class);
        List<WebLogDetailDTO> result = new LinkedList<>();
        for (String log : logs) {
            WebLogDetailDTO detailDTO = parseOneLogItem(log, taskId);
            if (detailDTO != null) {
                result.add(detailDTO);
            }
        }
        return result;
    }

    private static WebLogDetailDTO parseOneLogItem(String logItem, long taskId) {
        JSONObject jsonObject = JSONObject.parseObject(logItem);
        String logType = jsonObject.getString(WebLogFieldEnum.LOG_TYPE.key);
        String content = jsonObject.getString(WebLogFieldEnum.CONTENT.key);
        String logTime = jsonObject.getString(WebLogFieldEnum.LOG_TIME.key);
        if (LocalStringUtils.isAllNotEmpty(logType, content, logTime)) {
            WebLogDetailDTO detailDTO = new WebLogDetailDTO();
            detailDTO.setTaskId(taskId);
            detailDTO.setContent(URLDecoder.decode(content));
            detailDTO.setLogType(NumberUtils.toInt(logType));
            detailDTO.setLogTime(NumberUtils.toLong(logTime));
            detailDTO.setMinuteOffset(DateTimeUtil.getDayOffset(new Date(detailDTO.getLogTime())));
            return detailDTO;
        } else {
            return null;
        }
    }


}
