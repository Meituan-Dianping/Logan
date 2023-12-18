package controller

import (
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"logan/server/env"
	"logan/server/model"
	"logan/server/service"
	"logan/server/utils"
)

func Upload(c *gin.Context) {
	r := parseRequest(c.Request)
	defer c.Request.Body.Close()
	f, e := utils.CreateLogFile(r.LogFileName)
	if e != nil {
		log.Println(e)
		c.String(http.StatusBadRequest, "file name error"+e.Error())
		return
	}
	defer f.Close()
	l := service.NewNativeProtocolDecoder(c.Request.Body, f, env.SecretKey, env.SecretIv)
	e = l.Decode()
	if e != nil {
		log.Println(e)
		c.String(http.StatusInternalServerError, "decrypt failed "+e.Error())
		return
	}
	r, e = model.NativeTasks.SaveTask(r)
	if e != nil {
		log.Println(e)
		c.String(http.StatusInternalServerError, "decrypt failed "+e.Error())
		return
	}
	c.String(http.StatusOK, buildUrl(r.LogFileName))
}

func parseRequest(r *http.Request) *model.NativeTask {
	l := model.NativeTask{}
	l.Amount = strconv.FormatInt(r.ContentLength, 10)
	h := r.Header
	l.AppId = h.Get("appId")
	l.UnionId = h.Get("unionId")
	platformStr := h.Get("platform")
	if i, e := strconv.ParseInt(platformStr, 10, 64); e == nil {
		l.Platform = model.Platform(i).Value()
	}
	l.BuildVersion = h.Get("buildVersion")
	l.AppVersion = h.Get("appVersion")
	l.DeviceId = h.Get("deviceId")
	dateStr := h.Get("fileDate")
	l.LogDate = utils.ParseDate(dateStr)
	l.LogFileName = createFileNameByAppDeviceDate(&l)
	l.AddTime = time.Now().UnixNano() / 1e6
	l.UpdateTime = time.Now()
	return &l
}

func buildUrl(name string) string {
	return "/logan/downing?name=" + name
}

func createFileNameByAppDeviceDate(l *model.NativeTask) string {
	return l.AppId + "_" + l.DeviceId + "_" + strconv.FormatInt(l.LogDate, 10) + "_" + uuid.New().String() + ".log"
}
