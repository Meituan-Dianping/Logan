package model

import (
	"fmt"
)

type detailWebLogs struct{}

var DetailWebLogs detailWebLogs

func (*detailWebLogs) QueryDetailById(detailId int64) (*DetailWebLog, error) {
	detail := &DetailWebLog{}
	var err error
	db := getDb().First(detail, "id = ?", detailId)
	if db.RecordNotFound() {
		detail = nil
	} else {
		err = db.Error
	}
	return detail, err
}

func (*detailWebLogs) QueryDetailByIds(ids []int64) ([]DetailWebLog, error) {
	var list []DetailWebLog
	err := getDb().Find(&list, "id in (?)", ids).Error
	return list, err
}

func (*detailWebLogs) DeleteByRange(lowerBound, upperBound int64) error {
	return getDb().Where("id between ? and ?", lowerBound, upperBound).Delete(DetailWebLog{}).Error
}

func (*detailWebLogs) SaveDetail(webLogDetail *DetailWebLog) (*DetailWebLog, error) {
	err := getDb().Create(webLogDetail).Error
	if err != nil {
		return nil, err
	}
	return webLogDetail, nil
}

func (*detailWebLogs) Match(taskId int64, beginTimeOffset, endTimeOffset int, logTypes []int) ([]DetailWebLog, error) {
	fmt.Println("taskId", taskId, beginTimeOffset, endTimeOffset, logTypes)
	var list []DetailWebLog
	if len(logTypes) > 0 {
		err := getDb().Find(&list, "task_id = ? and minute_offset between ? and ? and log_type in (?)", taskId, beginTimeOffset, endTimeOffset, logTypes).Error
		return list, err
	} else {
		err := getDb().Find(&list, "task_id = ? and minute_offset between ? and ?", taskId, beginTimeOffset, endTimeOffset).Error
		return list, err
	}
}

func (*detailWebLogs) DoBatchInsert(details []DetailWebLog) error {
	sql := "INSERT INTO `web_log_detail` (`task_id`,`log_type`,`content`,`log_time`,`log_level`,`add_time`,`minute_offset`) VALUES "
	for key, detail := range details {
		if len(details)-1 == key {
			sql += fmt.Sprintf(`(%d,%d,"%s",%d,%d,%d,%d);`, detail.TaskId, detail.LogType, detail.Content, detail.LogTime, detail.LogLevel, detail.AddTime, detail.MinuteOffset)
		} else {
			sql += fmt.Sprintf(`(%d,%d,"%s",%d,%d,%d, %d),`, detail.TaskId, detail.LogType, detail.Content, detail.LogTime, detail.LogLevel, detail.AddTime, detail.MinuteOffset)
		}
	}
	fmt.Println("sql=", sql)
	err := getDb().Exec(sql).Error
	return err
}
