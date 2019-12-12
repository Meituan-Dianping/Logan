package com.meituan.logan.web.mapper;

import com.meituan.logan.web.dto.LoganLogDetailDTO;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface LoganLogDetailMapper {

    void insert(@Param("dto") LoganLogDetailDTO dto);

    void batchInsert(@Param("list") List<LoganLogDetailDTO> list);

    LoganLogDetailDTO selectById(@Param("id") long id);

    List<LoganLogDetailDTO> queryByTaskIdTypeKeyword(@Param("taskId") long taskId,
            @Param("types") List<Integer> types, @Param("keyword") String keyword);

    List<LoganLogDetailDTO> queryByIds(@Param("ids") List<Long> detailIds);
}
