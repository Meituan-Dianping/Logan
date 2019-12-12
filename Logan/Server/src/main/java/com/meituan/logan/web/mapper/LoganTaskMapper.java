package com.meituan.logan.web.mapper;

import com.meituan.logan.web.dto.LoganTaskDTO;
import com.meituan.logan.web.model.request.LoganTaskRequest;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface LoganTaskMapper {

    void insert(@Param("dto") LoganTaskDTO dto);

    void updateStatus(@Param("id") long id, @Param("status") int status);

    LoganTaskDTO selectById(@Param("id") long id);

    List<LoganTaskDTO> search(@Param("request") LoganTaskRequest request);

    List<LoganTaskDTO> queryLatest(@Param("limit") int limit);
}
