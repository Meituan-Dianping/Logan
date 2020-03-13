package controller

import (
	"fmt"
	"net/http"
	"sort"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"logan/server/model"
	"logan/server/utils"
)

const defaultLimit = 20

const SIZE = 20

func Latest(c *gin.Context) {
	list, err := model.NativeTasks.QueryLatest(defaultLimit)
	if err != nil {
		c.Data(http.StatusBadRequest, "", nil)
		return
	}
	ok(c, list)
}

func Search(c *gin.Context) {
	beginTime, err := strconv.ParseInt(c.Query("beginTime"), 0, 64)
	if err != nil {
		c.Data(http.StatusBadRequest, "", nil)
		return
	}
	endTime, err := strconv.ParseInt(c.Query("endTime"), 0, 64)
	if err != nil {
		c.Data(http.StatusBadRequest, "", nil)
		return
	}
	platform, err := strconv.Atoi(c.Query("platform"))
	if err != nil {
		c.Data(http.StatusBadRequest, "", nil)
		return
	}
	deviceId := c.Query("deviceId")
	if beginTime <= 0 || deviceId == "" {
		c.Data(http.StatusBadRequest, "", nil)
		return
	}
	platform = model.Platform(platform).Value()
	endTime = utils.NullToDefault(endTime+utils.ONE_DAY, time.Now().Unix()).(int64)
	beginTime = utils.NullToDefault(beginTime, endTime-utils.SEVEN_DAY).(int64)

	list, err := model.NativeTasks.Search(beginTime, endTime, deviceId, platform)
	if err != nil {
		c.Data(http.StatusBadRequest, "", nil)
		return
	}
	ok(c, list)
}

func Info(c *gin.Context, taskIdStr string) {
	taskId, err := strconv.ParseInt(taskIdStr, 0, 64)
	if err != nil {
		c.Data(http.StatusBadRequest, "", nil)
		return
	}
	if taskId <= 0 {
		c.Data(http.StatusBadRequest, "", nil)
		return
	}

	taskInfo, err := model.NativeTasks.GetTaskById(taskId)
	if err != nil {
		c.Data(http.StatusBadRequest, "", nil)
		return
	}
	ok(c, taskInfo)
}

func LogTypes(c *gin.Context) {
	ok(c, model.AllLogTypes())
}

func Brief(c *gin.Context, tId string) {
	keyword := c.Query("keyword")
	taskId, err := strconv.ParseInt(tId, 0, 64)
	if err != nil || taskId <= 0 {
		c.Data(http.StatusBadRequest, "", nil)
		return
	}

	var logTypeList []int
	logTypes := c.Query("logTypes")
	if len(logTypes) > 0 {
		logTypeList = utils.ParseList(logTypes, ",")
	}

	list, err := listByTaskIdTypeKeyWord(taskId, logTypeList, keyword)
	if err != nil {
		c.Data(http.StatusBadRequest, "", nil)
		return
	}
	ok(c, list)
}

func DetailList(c *gin.Context) {
	detailIds := c.Query("detailIds")
	detailIdList := utils.ParseInt64List(detailIds, ",")
	list, err := model.DetailLogs.ListByDetailIds(detailIdList)
	if err != nil {
		c.Data(http.StatusBadRequest, "", nil)
		return
	}
	ok(c, list)
}

func Detail(c *gin.Context, dId string) {
	detailId, err := strconv.ParseInt(dId, 0, 64)
	if err != nil || detailId <= 0 {
		c.Data(http.StatusBadRequest, "", nil)
		return
	}
	detail, err := model.DetailLogs.GetByDetailId(detailId)
	if err != nil {
		c.Data(http.StatusBadRequest, "", nil)
		return
	}
	ok(c, detail)
}

func DownloadUrl(c *gin.Context, taskIdStr string) {
	taskId, err := strconv.ParseInt(taskIdStr, 0, 64)
	if err != nil || taskId <= 0 {
		c.String(http.StatusBadRequest, "bad arg")
		return
	}
	task, err := model.NativeTasks.GetTaskById(taskId)
	if err != nil {
		c.Data(http.StatusBadRequest, "", nil)
		return
	}
	ok(c, buildUrl(task.LogFileName))
}

func Download(c *gin.Context) {
	name := c.Query("name")
	c.Writer.Header().Add("Content-Disposition", fmt.Sprintf("attachment; filename=%s", name))
	c.Writer.Header().Add("Content-Type", "application/octet-stream")
	c.File(utils.FilePath(name))
}

func listByTaskIdTypeKeyWord(taskId int64, logTypeList []int, keyword string) ([][]model.NativeSimpleLog, error) {
	task, err := model.NativeTasks.GetTaskById(taskId)
	if err != nil {
		return nil, err
	}
	err = model.TryAnalyze(task)
	if err != nil {
		return nil, err
	}
	list, err := model.DetailLogs.ListByTaskIdTypeKeyword(taskId, logTypeList, keyword)
	if err != nil {
		return nil, err
	}
	sort.Stable(list)
	var simpleModelList []model.NativeSimpleLog
	for _, detail := range list {
		simpleModelList = append(simpleModelList, detail.ToSimple())
	}
	var result [][]model.NativeSimpleLog
	var newList []model.NativeSimpleLog
	for _, simpleModel := range simpleModelList {
		if len(newList) >= SIZE {
			result = append(result, newList)
			newList = []model.NativeSimpleLog{}
			newList = append(newList, simpleModel)
		} else {
			newList = append(newList, simpleModel)
		}
	}
	if len(newList) > 0 {
		result = append(result, newList)
	}
	return result, nil
}
