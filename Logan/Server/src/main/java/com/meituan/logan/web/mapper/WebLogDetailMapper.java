package com.meituan.logan.web.mapper;

import com.meituan.logan.web.dto.WebLogDetailDTO;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface WebLogDetailMapper {
    void batchInsert(@Param("details") List<WebLogDetailDTO> webLogDetailDTO);

    WebLogDetailDTO queryById(@Param("id") long id);

    void deleteByRange(@Param("lowerBound") long lowerBound, @Param("upperBound") long upperBound);

    List<WebLogDetailDTO> queryByIds(@Param("ids") List<Long> ids);

    List<WebLogDetailDTO> match(@Param("taskId") long taskId,
            @Param("beginTimeOffset") int beginTimeOffset,
            @Param("endTimeOffset") int endTimeOffset, @Param("logTypes") List<Integer> logTypes);
}
