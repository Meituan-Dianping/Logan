package com.meituan.logan.web.model;

import com.meituan.logan.web.dto.LoganLogDetailDTO;
import com.meituan.logan.web.enums.LogTypeEnum;
import lombok.Data;
import org.apache.commons.lang3.math.NumberUtils;

/**
 *
 *
 *
 * @since 2019-11-12 17:13
 */
@Data
public class LoganLogItem {
    private String c;//content
    private String f;//logType
    private String l;//logTime
    private String n;//theadName
    private String i;//threadid
    private String m;//是否是主线程

    public LoganLogDetailDTO transferToDetail(long taskId) {
        LoganLogDetailDTO dto = new LoganLogDetailDTO();
        dto.setTaskId(taskId);
        dto.setLogType(LogTypeEnum.valueOfLogType(NumberUtils.toInt(f)).getLogType());
        dto.setContent(c);
        dto.setLogTime(NumberUtils.toLong(l));
        return dto;
    }

}
