package com.meituan.logan.web.mapper;

import com.meituan.logan.web.dto.WebLogTaskDTO;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface WebLogTaskMapper {

    void insert(@Param("task") WebLogTaskDTO taskDTO);

    void updateContent(@Param("taskId") long taskId, @Param("content") String content);

    WebLogTaskDTO exist(@Param("logDate") long logDate, @Param("deviceId") String deviceId,
            @Param("pageNum") int pageNum);

    List<WebLogTaskDTO> query(@Param("beginTime") long beginTime, @Param("endTime") long endTime,
            @Param("deviceId") String deviceId);

    void deleteByAddTime(@Param("addTime") long addTime);

    List<WebLogTaskDTO> queryByIds(@Param("tasks") List<Long> taskIds);

    void updateStatus(@Param("taskId") long taskId, @Param("status") int status);

    long maxId();

    List<WebLogTaskDTO> queryByRange(@Param("minId") long minId, @Param("maxId")long maxId);
}
