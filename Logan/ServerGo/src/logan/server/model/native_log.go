package model

import (
	"bufio"
	"fmt"
	"io"
	"logan/server/utils"
	"sync"

	jsoniter "github.com/json-iterator/go"
)

type detailLogs struct{}

var DetailLogs detailLogs

func (*detailLogs) ListByTaskIdTypeKeyword(taskId int64, logTypes []int, keyword string) (NativeDetailLogSlice, error) {
	var list NativeDetailLogSlice
	var err error
	if len(logTypes) > 0 && keyword == "" {
		err = getDb().Find(&list, "task_id = ? and log_type in (?)", taskId, logTypes).Error
	} else if len(logTypes) > 0 && keyword != "" {
		k := "%" + keyword + "%"
		err = getDb().Find(&list, "task_id = ? and log_type in (?) and content like ?", taskId, logTypes, k).Error
	} else if len(logTypes) == 0 && keyword == "" {
		err = getDb().Find(&list, "task_id = ?", taskId).Error
	} else if len(logTypes) == 0 && keyword != "" {
		k := "%" + keyword + "%"
		err = getDb().Find(&list, "task_id = ? and content like ?", taskId, keyword, k).Error
	}
	return list, err
}

func (*detailLogs) DetailByTaskId(taskId int64) (*NativeDetailLog, error) {
	logDetailModel := &NativeDetailLog{}
	err := getDb().First(logDetailModel, "task_id >= ?", taskId).Error
	if err != nil {
		return nil, err
	}
	return logDetailModel, nil
}

func (*detailLogs) ListByDetailIds(ids []int64) ([]NativeDetailLog, error) {
	var list []NativeDetailLog
	err := getDb().Find(&list, "id in (?)", ids).Error
	if err != nil {
		return nil, err
	}
	if len(list) > 0 {
		// 先sort
		for _, detail := range list {
			detail.SimpleContent = detail.Content
		}
	}
	return list, nil
}

func (*detailLogs) GetByDetailId(id int64) (*NativeDetailLog, error) {
	logDetailModel := &NativeDetailLog{}
	err := getDb().First(logDetailModel, "id >= ?", id).Error
	if err != nil {
		return nil, err
	}
	logDetailModel.FormatContent = logDetailModel.Content
	return logDetailModel, nil
}

func (*detailLogs) SaveDetail(detailLog *NativeDetailLog) (*NativeDetailLog, error) {
	err := getDb().Create(detailLog).Error
	return detailLog, err
}

func (*detailLogs) DoBatchInsert(details []NativeDetailLog) error {
	sql := "INSERT INTO `native_log_detail` (`task_id`,`log_type`,`content`,`log_time`,`log_level`) VALUES "
	for key, detail := range details {
		if len(details)-1 == key {
			sql += fmt.Sprintf("(%d,%d,`%s`,%d);", detail.TaskId, detail.LogType, detail.Content, detail.LogTime)
		} else {
			sql += fmt.Sprintf("(%d,%d,`%s`,%d),", detail.TaskId, detail.LogType, detail.Content, detail.LogTime)
		}
	}
	err := getDb().Exec(sql).Error
	return err
}

func TryAnalyze(taskModel *NativeTask) error {
	if TaskStatusNormal.Status == taskModel.Status {
		key := taskModel.LogFileName
		var rwLock sync.Mutex
		rwLock.Lock()
		if TaskStatusNormal.Status == taskModel.Status {
			f, err := utils.OpenLogFile(key)
			if err != nil {
				return err
			}
			defer f.Close()
			br := bufio.NewReader(f)
			for {
				line, _, c := br.ReadLine()
				if c == io.EOF {
					break
				}
				var nativeLogItem = NativeLogItem{}
				err := jsoniter.Unmarshal(line, &nativeLogItem)
				if err != nil {
					return err
				}
				nativeLogDetailModel := nativeLogItem.TransferToDetail(taskModel.TaskId)
				_, err = DetailLogs.SaveDetail(nativeLogDetailModel)
				if err != nil {
					return err
				}
			}
			taskModel.Status = TaskStatusAnalyzed.Status
			_, err = NativeTasks.UpdateTask(taskModel)
			if err != nil {
				return err
			}
		}
		rwLock.Unlock()
	}
	return nil
}
