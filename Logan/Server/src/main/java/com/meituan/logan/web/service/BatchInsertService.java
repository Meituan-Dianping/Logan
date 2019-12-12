package com.meituan.logan.web.service;

import java.util.List;

/**
 * 功能描述:  <p></p>
 *
 *
 * @version 1.0 2019-10-31
 * @since logan-admin-server 1.0
 */
public interface BatchInsertService<T> {

    void saveLogDetail(T data);

    void saveLogDetails(List<T> list);
}
