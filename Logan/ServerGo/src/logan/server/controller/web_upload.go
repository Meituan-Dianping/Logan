package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"logan/server/env"
	"logan/server/model"
	"logan/server/service"
)

func WebLogUpload(c *gin.Context) {
	l := model.NewWebTaskFromJson(c.Request.Body)
	d := service.WebProtocolDecoder{RsaPrivateKey: env.RsaPrivateKey}
	var err error
	l.Content, err = d.Decode(l.LogArray)
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	_, err = model.WebTasks.SaveTask(l)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}
	ok(c, true)
}
