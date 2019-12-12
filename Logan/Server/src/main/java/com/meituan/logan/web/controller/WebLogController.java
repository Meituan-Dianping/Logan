package com.meituan.logan.web.controller;

import com.google.common.collect.ArrayListMultimap;
import com.meituan.logan.web.dto.WebLogDetailDTO;
import com.meituan.logan.web.dto.WebLogTaskDTO;
import com.meituan.logan.web.enums.TaskStatusEnum;
import com.meituan.logan.web.model.WebLogIndex;
import com.meituan.logan.web.model.response.LoganResponse;
import com.meituan.logan.web.parser.WebLogParser;
import com.meituan.logan.web.service.BatchInsertService;
import com.meituan.logan.web.service.WebLogDetailService;
import com.meituan.logan.web.service.WebTaskService;
import com.meituan.logan.web.util.DateTimeUtil;
import com.meituan.logan.web.util.Threads;
import com.meituan.logan.web.util.TypeSafeUtil;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.math.NumberUtils;
import org.apache.log4j.Logger;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.annotation.Resource;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executor;
import java.util.concurrent.TimeUnit;

/**
 * 功能描述:  <p>负责处理管理端对H5日志的查询</p>
 *
 * @version 1.0 2019-11-01
 * @since logan-web 1.0
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@Controller
@RequestMapping("/logan/web")
public class WebLogController {
    private static final Logger LOGGER = Logger.getLogger(WebLogController.class);

    private static final String REGEX = ",";

    private static final long ONE_DAY = 24 * 60 * 60 * 1000L;

    private static final int PAGE_SIZE = 20;

    private Executor executor = Threads.newFixedThreadPool(WebLogController.class.getSimpleName(),
            20);

    @Resource
    private WebTaskService webTaskService;

    @Resource
    private WebLogDetailService webLogDetailService;

    @Resource(name = "webLogDetailServiceImpl")
    private BatchInsertService<WebLogDetailDTO> batchInsertService;

    /**
     * 按天搜索某个deviceId的日志
     *
     * @param beginTime 时间戳类型（单位：毫秒），一天的起始时间，如: 2019-11-11 00:00:00，不能为空
     * @param endTime    时间戳类型（单位：毫秒），一天的起始时间，如: 2019-11-11 00:00:00，不能为空
     * @param deviceId  设备ID，不能为空
     * @return deviceId在一天内上报的列表
     */
    @GetMapping("/search.json")
    @ResponseBody
    public LoganResponse<List<WebLogTaskDTO>> search(long beginTime,long endTime, String deviceId) {
        endTime = endTime + ONE_DAY;
        if (beginTime <= 0 || StringUtils.isEmpty(deviceId)) {
            return LoganResponse.badParam("invalid param");
        }
        List<WebLogTaskDTO> list = webTaskService.search(beginTime, endTime, deviceId);
        List<WebLogTaskDTO> result = reduce(groupByLogDate(list));
        return LoganResponse.success(result);
    }

    /**
     * 获取最近的一组日志上报
     * @return
     */
    @GetMapping("/latest.json")
    @ResponseBody
    public LoganResponse<List<WebLogTaskDTO>> latestReport() {
        List<WebLogTaskDTO> taskDTOS = webTaskService.latest(200);
        ArrayListMultimap<Long, WebLogTaskDTO> multimap = groupByLogDate(taskDTOS);
        List<WebLogTaskDTO> result = new ArrayList<>();
        for (Long logDate : multimap.keySet()) {
            result.addAll(reduce(groupByDeviceId(multimap.get(logDate))));
        }
        result.sort((o1, o2) -> {
            if (o1.getLogDate() == o2.getLogDate()) {
                return (int) (o2.getAddTime() - o1.getAddTime());
            } else {
                return (int) (o2.getLogDate() - o1.getLogDate());
            }
        });
        if (result.size() > PAGE_SIZE) {
            result = result.subList(0, PAGE_SIZE);
        }
        return LoganResponse.success(result);
    }

    /**
     * 获取一个H5日志详情的索引信息
     *
     * @param tasks     一次H5上报的任务标识，不能为空
     * @param logTypes  期望查看的日志类型，为空时默认查看全部类型的日志
     * @param keyword   关键字，可为空
     * @param beginTime 日志在一天内的起始分钟偏移量, 如 12:05，可为空，默认00:00
     * @param endTime   日志在一天内的结束分钟偏移量, 如 22:30，可为空，默认23:59
     * @return 返回日志详情的索引信息
     */
    @GetMapping("/detailIndex.json")
    @ResponseBody
    public LoganResponse<List<List<WebLogIndex>>> detailIndex(String tasks, String logTypes,
                                                              String keyword, String beginTime, String endTime) {
        List<Long> taskIds = TypeSafeUtil.parseLongList(tasks, REGEX);
        taskIds = TypeSafeUtil.ignore(taskIds, 0L);
        List<Integer> logTypeList = TypeSafeUtil.parseIntList(logTypes, REGEX);
        List<WebLogTaskDTO> list = webTaskService.queryByTaskIds(taskIds);
        if (CollectionUtils.isNotEmpty(list)) {
            doAnalyzeIfNotAnalyzed(list);
            List<WebLogDetailDTO> cachedList = new CopyOnWriteArrayList<>();
            CountDownLatch countDownLatch = new CountDownLatch(taskIds.size());
            int beginTimeOffSet = DateTimeUtil.getOffset(beginTime, 0);
            int endTimeOffSet = DateTimeUtil.getOffset(endTime, 23 * 60 + 59);
            for (Long taskId : taskIds) {
                executor.execute(
                        () -> match(cachedList, taskId, logTypeList, beginTimeOffSet, endTimeOffSet,
                                keyword, countDownLatch));
            }
            safeWait(5, countDownLatch);
            List<List<WebLogIndex>> pages = getDetailIdPages(cachedList);
            return LoganResponse.success(pages);
        } else {
            return LoganResponse.badParam("empty tasks");
        }
    }

    /**
     * 查询一次H5上报的信息
     *
     * @param tasks 上报标识，不能为空
     * @return 一次上报的详细信息
     */
    @GetMapping("/taskDetail.json")
    @ResponseBody
    public LoganResponse<WebLogTaskDTO> taskDetail(String tasks) {
        List<Long> taskIds = TypeSafeUtil.parseLongList(tasks, REGEX);
        taskIds = TypeSafeUtil.ignore(taskIds, 0L);
        if (CollectionUtils.isNotEmpty(taskIds)) {
            List<WebLogTaskDTO> list = webTaskService.queryByTaskIds(taskIds);
            if (CollectionUtils.isNotEmpty(list)) {
                Collections.sort(list);
                return LoganResponse.success(list.get(0));
            }
        }
        return LoganResponse.badParam("task not found");
    }

    /**
     * 根据ID查询一组日志详情
     *
     * @param detailIds 逗号分割的日志详情ID，必填
     * @return 一组日志详情
     */
    @GetMapping("/details.json")
    @ResponseBody
    public LoganResponse<List<WebLogDetailDTO>> details(String detailIds) {
        List<Long> detailIdList = TypeSafeUtil.parseLongList(detailIds, REGEX);
        detailIdList = TypeSafeUtil.ignore(detailIdList, 0L);
        if (CollectionUtils.isNotEmpty(detailIdList)) {
            List<WebLogDetailDTO> list = webLogDetailService.queryByIds(detailIdList);
            if (CollectionUtils.isNotEmpty(list)) {
                return LoganResponse.success(list);
            }
        }
        return LoganResponse.badParam("not details for " + detailIds);
    }

    /**
     * 根据详情ID查询单条日志详情
     *
     * @param detailId 详情ID，必填
     * @return 单条日志详情
     */
    @GetMapping("/logDetail.json")
    @ResponseBody
    public LoganResponse<WebLogDetailDTO> logDetail(String detailId) {
        long longDetailId = NumberUtils.toLong(detailId);
        WebLogDetailDTO detailDTO = webLogDetailService.queryById(longDetailId);
        if (detailDTO != null) {
            return LoganResponse.success(detailDTO);
        } else {
            return LoganResponse.badParam("log detail not found");
        }
    }

    @GetMapping("/exception.json")
    @ResponseBody
    public LoganResponse<String> exception() {
        LOGGER.error(new Exception("exception"));
        return LoganResponse.success("exception");
    }

    /**
     * 获取日志下载地址
     *
     * @param tasks
     * @return
     */
    @GetMapping("/getDownLoadUrl.json")
    @ResponseBody
    public LoganResponse<String> getDownLoadUrl(String tasks) {
        return LoganResponse.success(String.format("/logan/web/download.json?tasks=%s", tasks));
    }

    /**
     * 以文件的方式下载原始日志
     *
     * @param tasks
     * @return
     */
    @GetMapping("/download.json")
    public ResponseEntity<byte[]> downLoadLog(String tasks){
        List<Long> taskIds = TypeSafeUtil.parseLongList(tasks, REGEX);
        taskIds = TypeSafeUtil.ignore(taskIds, 0L);
        List<WebLogTaskDTO> taskDTOS = webTaskService.queryByTaskIds(taskIds);
        byte[] contents = getContentAsBytes(taskDTOS);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", tasks);
        return new ResponseEntity<>(contents, headers, HttpStatus.CREATED);
    }

    private byte[] getContentAsBytes(List<WebLogTaskDTO> taskDTOS){
        Collections.sort(taskDTOS);
        List<byte[]> bytesList = new LinkedList<>();
        int totalLength = 0;
        for (WebLogTaskDTO taskDTO : taskDTOS) {
            byte[] bytes = taskDTO.getContent().getBytes();
            bytesList.add(bytes);
            totalLength += bytes.length;
        }
        int index = 0;
        byte[] contents = new byte[totalLength];
        for (byte[] bytes : bytesList) {
            System.arraycopy(bytes, 0, contents, index, bytes.length);
            index += bytes.length;
        }
        return contents;
    }

    /**
     * 由于H5日志采取分页上报，因此需要根据日志做聚合
     */
    private ArrayListMultimap<Long, WebLogTaskDTO> groupByLogDate(List<WebLogTaskDTO> list) {
        ArrayListMultimap<Long, WebLogTaskDTO> multimap = ArrayListMultimap.create();
        if (CollectionUtils.isNotEmpty(list)) {
            for (WebLogTaskDTO dto : list) {
                multimap.put(dto.getLogDate(), dto);
            }
        }
        return multimap;
    }

    private ArrayListMultimap<String, WebLogTaskDTO> groupByDeviceId(
            Collection<WebLogTaskDTO> collection) {
        ArrayListMultimap<String, WebLogTaskDTO> multimap = ArrayListMultimap.create();
        if (CollectionUtils.isNotEmpty(collection)) {
            for (WebLogTaskDTO taskDTO : collection) {
                multimap.put(taskDTO.getDeviceId(), taskDTO);
            }
        }
        return multimap;
    }

    /**
     * 将多个taskId合并为一个tasks
     */
    private <T> List<WebLogTaskDTO> reduce(ArrayListMultimap<T, WebLogTaskDTO> multimap) {
        List<WebLogTaskDTO> list = new LinkedList<>();
        for (T key : multimap.keySet()) {
            List<WebLogTaskDTO> tempList = multimap.get(key);
            Collections.sort(tempList);
            List<Long> taskIds = new LinkedList<>();
            for (WebLogTaskDTO taskDTO : tempList) {
                taskIds.add(taskDTO.getTaskId());
            }
            tempList.get(0).setTasks(StringUtils.join(taskIds, REGEX));
            list.add(tempList.get(0));
        }
        return list;
    }

    /**
     * 如果日志未经过分析，则进行分析与存储
     */
    private void doAnalyzeIfNotAnalyzed(List<WebLogTaskDTO> list) {
        Collections.sort(list);
        for (WebLogTaskDTO taskDTO : list) {
            if (taskDTO.getStatus() == TaskStatusEnum.NORMAL.getStatus()) {
                List<WebLogDetailDTO> detailDTOS = WebLogParser.parseWebLogDetail(
                        taskDTO.getContent(), taskDTO.getTaskId());
                batchInsertService.saveLogDetails(detailDTOS);
                webTaskService.updateStatus(taskDTO.getTaskId(), TaskStatusEnum.ANALYZED);
            }
        }
    }

    /**
     * 根据页面检索条件匹配需要查看的日志
     */
    private void match(List<WebLogDetailDTO> cachedList, long taskId, List<Integer> logTypes,
                       int beginTimeOffset, int endTimeOffset, String keyword, CountDownLatch countDownLatch) {
        try {
            List<WebLogDetailDTO> list = webLogDetailService.match(taskId, beginTimeOffset,
                    endTimeOffset, logTypes, keyword);
            if (CollectionUtils.isNotEmpty(list)) {
                cachedList.addAll(list);
            }
        } catch (Exception e) {
            LOGGER.error(e);
        } finally {
            countDownLatch.countDown();
        }
    }

    private void safeWait(int seconds, CountDownLatch countDownLatch) {
        try {
            countDownLatch.await(seconds, TimeUnit.SECONDS);
        } catch (Exception e) {
            LOGGER.error(e);
        }
    }

    /**
     * 对匹配到的H5日志详情构建索引信息并进行分页
     */
    private List<List<WebLogIndex>> getDetailIdPages(List<WebLogDetailDTO> cachedList) {
        Collections.sort(cachedList);
        List<List<WebLogIndex>> pages = new LinkedList<>();
        List<WebLogIndex> page = new LinkedList<>();
        for (WebLogDetailDTO dto : cachedList) {
            page.add(new WebLogIndex(dto.getId(), dto.getLogType(), dto.getLogTime()));
            if (page.size() == PAGE_SIZE) {
                pages.add(page);
                page = new LinkedList<>();
            }
        }
        if (!page.isEmpty()) {
            pages.add(page);
        }
        return pages;
    }
}
