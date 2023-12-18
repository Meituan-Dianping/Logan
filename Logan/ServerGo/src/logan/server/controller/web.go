package controller

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"sync"

	"github.com/gin-gonic/gin"

	"logan/server/model"
	"logan/server/service"
	"logan/server/utils"
)

const ONE_DAY = 24 * 60 * 60 * 1000
const REGEX = ","
const PAGE_SIZE = 20

func WebLatest(c *gin.Context) {
	list, err := model.WebTasks.QueryLatest(200)
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}
	var arr []model.WebTask
	logTaskMap := groupByLogDate(list)
	for _, tasks := range logTaskMap {
		webLogTaskModelSlice := reduceByStringKey(groupByDeviceId(tasks))
		arr = append(arr, webLogTaskModelSlice...)
	}
	sort.Slice(arr, func(i, j int) bool {
		if arr[i].LogDate == arr[j].LogDate {
			return arr[j].UpdateTime.After(arr[i].UpdateTime)
		} else {
			return arr[j].LogDate > arr[i].LogDate
		}
	})
	if len(arr) > PAGE_SIZE {
		arr = arr[1:PAGE_SIZE]
	}
	ok(c, arr)
}

func WebSearch(c *gin.Context) {
	beginTime, err := strconv.ParseInt(c.Query("beginTime"), 0, 64)
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}
	endTime, err := strconv.ParseInt(c.Query("endTime"), 0, 64)
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}
	deviceId := c.Query("deviceId")
	if beginTime <= 0 || deviceId == "" {
		c.String(http.StatusBadRequest, "invalid param")
		return
	}
	endTime = endTime + ONE_DAY
	list, err := model.WebTasks.Search(beginTime, endTime, deviceId)
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}
	webLogTaskModelSlice := reduceByIntKey(groupByLogDate(list))
	ok(c, webLogTaskModelSlice)
}

func WebDetailIndex(c *gin.Context) {
	taskIdList := utils.ParseInt64List(c.Query("tasks"), REGEX)
	taskIdList = utils.IgnoreInt64(taskIdList, 0)
	logTypeList := utils.ParseIntList(c.Query("logTypes"), REGEX)
	beginTime := c.Query("beginTime")
	endTime := c.Query("endTime")
	keyword := c.Query("keyword")

	list, err := model.WebTasks.QueryByTaskIds(taskIdList)
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}
	if len(list) == 0 {
		c.String(http.StatusBadRequest, "no tasks")
		return
	}

	doAnalyzeIfNotAnalyzed(list)
	beginTimeOffSet := utils.GetOffset(beginTime, 0)
	endTimeOffSet := utils.GetOffset(endTime, 23*60+59)

	var cachedList []model.DetailWebLog
	var wg sync.WaitGroup
	wg.Add(len(taskIdList))
	for _, taskId := range taskIdList {
		go func() {
			list, _ := match(taskId, logTypeList, beginTimeOffSet, endTimeOffSet, keyword)
			if list != nil && len(list) > 0 {
				cachedList = append(cachedList, list...)
			}
			defer wg.Done()
		}()
	}
	wg.Wait()
	pages := getDetailIdPages(cachedList)
	ok(c, pages)
}

func WebTaskDetail(c *gin.Context) {
	taskIds := c.Query("tasks")
	taskIdList := utils.ParseInt64List(taskIds, REGEX)
	taskIdList = utils.IgnoreInt64(taskIdList, 0)
	if len(taskIdList) == 0 {
		c.String(http.StatusBadRequest, "not found tasks")
		return
	}
	list, err := model.WebTasks.QueryByTaskIds(taskIdList)
	sort.Stable(list)
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}
	ok(c, list[0])
}

func WebLogDetail(c *gin.Context) {
	detailId, err := strconv.ParseInt(c.Query("detailId"), 0, 64)
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	webDetail, err := model.DetailWebLogs.QueryDetailById(detailId)
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}
	ok(c, webDetail)
}

func WebDetailList(c *gin.Context) {
	detailIds := c.Query("detailIds")
	detailIdList := utils.ParseInt64List(detailIds, ",")
	if len(detailIdList) > 0 {
		list, err := model.DetailWebLogs.QueryDetailByIds(detailIdList)
		if err != nil {
			c.String(http.StatusBadRequest, err.Error())
			return
		}
		ok(c, list)
		return
	}
	c.String(http.StatusBadRequest, errors.New("not details for "+detailIds).Error())
}

func WebException(c *gin.Context) {

}

func WebDownloadUrl(c *gin.Context) {
	tasks := c.Query("tasks")
	ok(c, "/logan/web/download.json?tasks=" + tasks)
}

func WebDownload(c *gin.Context) {
	tasks := c.Param("tasks")
	taskIds := utils.ParseInt64List(tasks, REGEX)
	// 去除 0
	taskModels, err := model.WebTasks.QueryByTaskIds(taskIds)
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}
	contents := getContentAsBytes(taskModels)

	ok(c, contents)
}

func getContentAsBytes(taskModels model.WebTaskSlice) []byte {
	sort.Stable(taskModels)
	byteList := [][]byte{}
	totalLength := 0
	for _, taskModel := range taskModels {
		bytes := []byte(taskModel.Content)
		byteList = append(byteList, bytes)
		totalLength += len(bytes)
	}

	var contents []byte
	for _, bytes := range byteList {
		contents = append(contents, bytes...)
	}
	return contents
}

/* 如果日志未经过分析，则进行分析与存储 */
func doAnalyzeIfNotAnalyzed(slice model.WebTaskSlice) {
	sort.Stable(slice)
	for _, item := range slice {
		if item.Status == model.TaskStatusNormal.Status {
			logDetails := service.ParseDetailWebLog(item.Content, item.ID)
			err := model.DetailWebLogs.DoBatchInsert(logDetails)
			if err != nil {
				log.Println(err)
			}
			_, err = model.WebTasks.UpdateStatus(item.ID, model.TaskStatusAnalyzed.Status)
			if err != nil {
				log.Println(err)
			}
		}
	}
}

/* 根据页面检索条件匹配需要查看的日志 */
func match(taskId int64, logTypes []int, beginTimeOffset, endTimeOffset int, keyword string) ([]model.DetailWebLog, error) {
	list, err := model.DetailWebLogs.Match(taskId, beginTimeOffset, endTimeOffset, logTypes)
	if err != nil {
		return nil, err
	}
	var filteredList []model.DetailWebLog
	if len(list) > 0 && keyword != "" {
		for _, item := range list {
			if strings.Contains(item.Content, keyword) {
				filteredList = append(filteredList, item)
			}

		}
	} else {
		filteredList = list
	}
	return filteredList, nil
}

// 日志聚合
func groupByLogDate(tasks []model.WebTask) map[int64]model.WebTaskSlice {
	taskMap := make(map[int64]model.WebTaskSlice)
	if len(tasks) > 0 {
		for _, task := range tasks {
			key := task.LogDate
			if _, ok := taskMap[key]; ok {
				arr := taskMap[key]
				arr = append(arr, task)
				taskMap[key] = arr
			} else {
				var arr []model.WebTask
				arr = append(arr, task)
				taskMap[task.LogDate] = arr
			}
		}
	}
	return taskMap
}

func groupByDeviceId(tasks []model.WebTask) map[string]model.WebTaskSlice {
	taskMap := make(map[string]model.WebTaskSlice)
	if len(tasks) > 0 {
		for _, task := range tasks {
			key := task.DeviceId
			if _, ok := taskMap[key]; ok {
				arr := taskMap[key]
				arr = append(arr, task)
				taskMap[key] = arr
			} else {
				var arr []model.WebTask
				arr = append(arr, task)
				taskMap[task.DeviceId] = arr
			}
		}
	}
	return taskMap
}

// 将多个taskId合为一个tasks
func reduceByIntKey(taskmap map[int64]model.WebTaskSlice) model.WebTaskSlice {
	var arr model.WebTaskSlice
	for key := range taskmap {
		tempList := taskmap[key]
		// sort
		sort.Stable(tempList)
		var tasks string
		for _, task := range tempList {
			tasks += fmt.Sprintf("%s%d", REGEX, task.ID)
		}
		tasks = strings.TrimPrefix(tasks, REGEX)
		tempList[0].Tasks = tasks
		arr = append(arr, tempList[0])
	}
	return arr
}

func reduceByStringKey(taskMap map[string]model.WebTaskSlice) model.WebTaskSlice {
	var arr = model.WebTaskSlice{}
	for key := range taskMap {
		tempList := taskMap[key]
		// sort
		sort.Stable(tempList)
		var tasks string
		for _, task := range tempList {
			tasks += fmt.Sprintf("%s%d", REGEX, task.ID)
		}
		tasks = strings.TrimPrefix(tasks, REGEX)
		tempList[0].Tasks = tasks
		arr = append(arr, tempList[0])
	}
	return arr
}

//对匹配到的H5日志详情构建索引信息并进行分页
func getDetailIdPages(cacheList model.DetailWebLogSlice) [][]model.SimpleWebLog {
	sort.Stable(cacheList)
	var pages [][]model.SimpleWebLog
	var page []model.SimpleWebLog
	for _, detail := range cacheList {
		page = append(page, detail.ToSimple())
		if len(page) == PAGE_SIZE {
			pages = append(pages, page)
			page = []model.SimpleWebLog{}
		}
	}
	if len(page) > 0 {
		pages = append(pages, page)
	}
	return pages
}
