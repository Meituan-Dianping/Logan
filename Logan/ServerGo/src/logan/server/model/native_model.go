package model

import "time"

type NativeTask struct {
	TaskId       int64  `json:"taskId" gorm:"column:id;primary_key"`
	Amount       string `json:"amount" gorm:"column:amount"`
	AppId        string `json:"appId" gorm:"column:app_id"`
	UnionId      string `json:"unionId" gorm:"column:union_id"`
	Platform     int    `json:"platform" gorm:"column:platform"`
	BuildVersion string `json:"buildVersion" gorm:"column:build_version"`
	AppVersion   string `json:"appVersion" gorm:"column:app_version"`
	DeviceId     string `json:"deviceId" gorm:"column:device_id"`
	/**
	 * 日志所属天
	 */
	LogDate int64 `json:"logDate" gorm:"column:log_date"`
	/**
	 * 文件名
	 */
	LogFileName string `json:"logFileName" gorm:"column:log_file_name"`
	/**
	 * 日志上报时间
	 */
	AddTime int64 `json:"addTime" gorm:"column:add_time"`
	/**
	 * 0 : 未分析过，1 : 已分析过
	 */
	Status int `json:"status" gorm:"column:status"`

	UpdateTime time.Time `json:"update_time" gorm:"column:update_time"`
}

func (*NativeTask) TableName() string {
	return "logan_task"
}

type NativeDetailLog struct {
	Id            int64  `json:"id" gorm:"column:id;primary_key"`
	TaskId        int64  `json:"taskId" gorm:"column:task_id"`
	LogType       int    `json:"logType" gorm:"column:log_type"`
	Content       string `json:"content" gorm:"column:content"`
	SimpleContent string `json:"simpleContent" gorm:"-"`
	FormatContent string `json:"formatContent" gorm:"-"`
	LogTime       int64  `json:"logTime" gorm:"column:log_time"`
}

func (*NativeDetailLog) TableName() string {
	return "logan_log_detail"
}

func (l *NativeDetailLog) ToSimple() NativeSimpleLog {
	return NativeSimpleLog{
		Id:      l.Id,
		LogType: l.LogType,
		LogTime: l.LogTime,
	}
}

type NativeDetailLogSlice []NativeDetailLog

func (s NativeDetailLogSlice) Len() int { return len(s) }

func (s NativeDetailLogSlice) Swap(i, j int) { s[i], s[j] = s[j], s[i] }

func (s NativeDetailLogSlice) Less(i, j int) bool { return s[i].LogTime < s[j].LogTime }

type NativeSimpleLog struct {
	Id      int64 `json:"id"`
	LogType int   `json:"logType"`
	LogTime int64 `json:"logTime"`
}

type NativeLogItem struct {
	Content    string `json:"c"` //content
	LogType    int    `json:"f"` //logType
	LogTime    int64  `json:"l"` //logTime
	ThreadName string `json:"n"` //threadName
	ThreadId   int    `json:"i"` //threadid
	IsMain     bool   `json:"m"` //是否是主线程
}

func (item *NativeLogItem) TransferToDetail(taskId int64) *NativeDetailLog {
	detail := &NativeDetailLog{}
	detail.TaskId = taskId
	detail.LogType = ValueOfLogType(item.LogType).logType
	detail.Content = item.Content
	detail.LogTime = item.LogTime
	return detail
}
