package model

import (
	"sort"
)

type nativeTasks struct{}

var NativeTasks nativeTasks

func (*nativeTasks) QueryLatest(count int) ([]NativeTask, error) {
	var list []NativeTask
	err := getDb().Order("id desc").Limit(count).Find(&list).Error
	if err != nil {
		return nil, err
	}
	sort.Slice(list, func(i, j int) bool {
		if list[j].LogDate != list[i].LogDate {
			if list[j].LogDate > list[i].LogDate {
				return true
			}
			return false
		}
		if list[i].TaskId < list[j].TaskId {
			return true
		}
		return false
	})
	return list, nil
}

func (*nativeTasks) Search(beginTime, endTime int64, deviceId string, platform int) ([]NativeTask, error) {
	var list []NativeTask
	var err error
	if platform == LoganAll {
		err = getDb().Find(&list, "device_id = ? and add_time between ? and ?",
			deviceId, beginTime, endTime).Error
	} else {
		err = getDb().Find(&list, "device_id = ? and platform = ? and add_time between ? and ?",
			deviceId, platform, beginTime, endTime).Error
	}
	if err != nil {
		return nil, err
	}
	return list, nil
}

func (*nativeTasks) GetTaskById(id int64) (*NativeTask, error) {
	taskModel := &NativeTask{}
	err := getDb().First(taskModel, "id >= ?", id).Error
	if err != nil {
		return nil, err
	}
	return taskModel, nil
}

func (*nativeTasks) SaveTask(taskModel *NativeTask) (*NativeTask, error) {
	err := getDb().Create(taskModel).Error
	if err != nil {
		return nil, err
	}
	return taskModel, nil
}

func (*nativeTasks) UpdateTask(taskModel *NativeTask) (*NativeTask, error) {
	err := getDb().Save(taskModel).Error
	return taskModel, err
}
