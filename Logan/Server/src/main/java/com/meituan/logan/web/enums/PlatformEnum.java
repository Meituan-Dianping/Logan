package com.meituan.logan.web.enums;

import lombok.Getter;

/**
 * 功能描述:  <p>客户端平台枚举类</p>
 *
 * @version 1.0 2019-10-07
 * @since logan-web 1.0
 */
public enum PlatformEnum {
    UNKNOWN(-1, "unknown"), ALL(0, "all"), ANDROID(1, "android"), IOS(2, "iOS");

    @Getter
    private int platform;

    @Getter
    private String desc;

    PlatformEnum(int platform, String desc) {
        this.desc = desc;
        this.platform = platform;
    }

    public static PlatformEnum valueOfPlatform(Integer platform) {
        for (PlatformEnum platformEnum : PlatformEnum.values()) {
            if (platformEnum.platform == platform) {
                return platformEnum;
            }
        }
        return UNKNOWN;
    }
}
