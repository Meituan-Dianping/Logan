package com.meituan.logan.web.enums;

import lombok.Getter;

/**
 * 功能描述:  <p>日志任务状态</p>
 *
 * @version 1.0 2019-10-07
 * @since logan-web 1.0
 */
public enum TaskStatusEnum {

    NORMAL(0, "未经分析"), ANALYZED(1, "已经被分析过");

    @Getter
    private int status;

    @Getter
    private String desc;

    TaskStatusEnum(int status, String desc) {
        this.desc = desc;
        this.status = status;
    }
}
