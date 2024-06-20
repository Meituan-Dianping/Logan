package model

import (
	"io"
	"time"

	jsoniter "github.com/json-iterator/go"

	"logan/server/utils"
)

type WebTask struct {
	ID       int64  `json:"taskId" gorm:"primary_key column:id"`
	DeviceId string `json:"deviceId" gorm:"column:device_id"`

	LogPageNo int `json:"logPageNo" gorm:"column:page_num"`

	WebSource   string `json:"webSource" gorm:"column:web_source"`
	Environment string `json:"environment" gorm:"column:environment"`

	LogArray string `json:"logArray" gorm:"-"`

	Content string `json:"content" gorm:"column:content"`

	LogDate int64 `json:"logDate" gorm:"column:log_date"`

	AddTime int64 `json:"add_time" gorm:"column:add_time"`

	FileDate string `json:"fileDate" gorm:"-"`

	Client string `json:"client" gorm:"-"`

	CustomInfo string `json:"customInfo" gorm:"column:custom_report_info"`

	Status int `json:"-" gorm:"column:status"`

	Tasks string `json:"tasks" gorm:"-"`

	UpdateTime time.Time `json:"update_time" gorm:"column:update_time"`
}


func (WebTask) TableName() string {
	return "web_task"
}

type WebTaskSlice []WebTask

func (s WebTaskSlice) Len() int { return len(s) }

func (s WebTaskSlice) Swap(i, j int) { s[i], s[j] = s[j], s[i] }

func (s WebTaskSlice) Less(i, j int) bool { return s[i].LogPageNo < s[j].LogPageNo }

func NewWebTaskFromJson(r io.Reader) *WebTask {
	l := WebTask{}
	d := jsoniter.NewDecoder(r)
	e := d.Decode(&l)
	if e != nil {
		return nil
	}
	if l.DeviceId == "" || l.LogPageNo <= 0 || l.LogArray == "" || l.FileDate == "" {
		return nil
	}
	l.LogDate = utils.ParseDate(l.FileDate)

	return &l
}

type DetailWebLog struct {
	ID           int64      `json:"id" gorm:"column:id;primary_key"`
	TaskId       int64      `json:"taskId" gorm:"column:task_id"`
	LogType      int        `json:"logType" gorm:"column:log_type"`
	Content      string     `json:"content" gorm:"column:content"`
	LogTime      int64      `json:"logTime" gorm:"column:log_time"`
	AddTime      int64      `json:"addTime" gorm:"column:add_time"`
	LogLevel     int        `json:"logLevel" gorm:"column:log_level"`
	MinuteOffset int        `json:"minuteOffset" gorm:"column:minute_offset"`
}

func (w *DetailWebLog) ToSimple() SimpleWebLog {
	return SimpleWebLog{
		Id:      w.ID,
		LogType: w.LogType,
		LogTime: w.LogTime,
	}
}

type SimpleWebLog struct {
	Id      int64 `json:"detailId"`
	LogType int   `json:"logType"`
	LogTime int64 `json:"logTime"`
}

func (DetailWebLog) TableName() string {
	return "web_detail"
}

type DetailWebLogSlice []DetailWebLog

func (s DetailWebLogSlice) Len() int { return len(s) }

func (s DetailWebLogSlice) Swap(i, j int) { s[i], s[j] = s[j], s[i] }

func (s DetailWebLogSlice) Less(i, j int) bool { return s[i].LogTime < s[j].LogTime }
