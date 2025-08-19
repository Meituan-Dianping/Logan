package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"strings"

	"logan/server/controller"
)

var allowedOrigins map[string]int

func initAllowedOrigins(origins []string) {
	allowedOrigins = make(map[string]int)
	for _, v := range origins {
		allowedOrigins[v] = 1
	}
}

func isAllowed(origin string) bool {
	_, b := allowedOrigins[origin]
	return b
}

func cors(c *gin.Context) {
	origin := c.Request.Header.Get("Origin")
	s := ""
	if isAllowed(origin) {
		s = origin
	}

	c.Header("Access-Control-Allow-Origin", s)
	c.Header("Vary", "Origin")
	c.Header("Access-Control-Max-Age", "3600")
	c.Header("Access-Control-Allow-Credentials", "true")
	c.Header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE")
	c.Header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, "+"X-CSRF-TOKEN")
}

func Router() *gin.Engine {
	router := gin.Default()
	router.Use(cors)
	//logan download log
	router.GET("/logan/latest.json", controller.Latest)

	router.NoRoute(func(context *gin.Context) {
		path := context.Request.URL.Path
		pathItems := strings.Split(path, "/")
		l := len(pathItems)
		taskId := pathItems[l-2]
		switch pathItems[l-1] {
		case "search.json":
			controller.Search(context)
		case "info.json":
			controller.Info(context, taskId)
		case "brief.json":
			controller.Brief(context, taskId)
		case "details.json":
			controller.DetailList(context)
		case "detail.json":
			controller.Detail(context, taskId)
		case "download.json":
			controller.DownloadUrl(context, taskId)
		default:
			context.String(http.StatusNotFound, "bad request")
		}
	})

	router.GET("/logan/meta/logtypes.json", controller.LogTypes)
	router.GET("/logan/downing", controller.Download)

	//logan upload log
	router.POST("/logan/upload.json", controller.Upload)

	//logan  download web log
	web := router.Group("/logan/web")
	web.GET("/search.json", controller.WebSearch)
	web.GET("/latest.json", controller.WebLatest)
	web.GET("/detailIndex.json", controller.WebDetailIndex)
	web.GET("/taskDetail.json", controller.WebTaskDetail)
	web.GET("/details.json", controller.WebDetailList)
	web.GET("/logDetail.json", controller.WebLogDetail)
	web.GET("/exception.json", controller.WebException)
	web.GET("/getDownLoadUrl.json", controller.WebDownloadUrl)
	web.GET("/download.json", controller.WebDownload)

	//logan upload web log
	web.POST("/upload.json", controller.WebLogUpload)
	web.OPTIONS("/upload.json", func(context *gin.Context) {
		context.String(http.StatusOK, "")
	})
	return router
}
