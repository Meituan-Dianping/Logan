package com.meituan.logan.web.service;

import com.meituan.logan.web.dto.WebLogDetailDTO;

import java.util.List;

/**
 * 功能描述:  <p></p>
 *
 *
 * @version 1.0 2019-10-31
 * @since logan-admin-server 1.0
 */
public interface WebLogDetailService {

    WebLogDetailDTO queryById(long detailId);

    void deleteByRange(long lowerBound, long upperBound);

    List<WebLogDetailDTO> queryByIds(List<Long> detailIds);

    List<WebLogDetailDTO> match(long taskId, int beginTimeOffset, int endTimeOffset,
            List<Integer> logTypes, String keyword);
}
