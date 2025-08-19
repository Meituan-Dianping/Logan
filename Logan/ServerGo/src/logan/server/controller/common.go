package controller

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func ok(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "",
		"data": data,
	})
}
