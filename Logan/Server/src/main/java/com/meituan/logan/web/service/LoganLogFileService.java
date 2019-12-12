package com.meituan.logan.web.service;

import java.io.InputStream;

/**
 * @since 2019-11-08 16:01
 */
public interface LoganLogFileService {

    boolean write(InputStream inputStream, String fileName);
}
