package model

import "time"

type webTasks struct{}

var WebTasks webTasks

// add
func (*webTasks) SaveTask(taskModel *WebTask) (*WebTask, error) {
	model, err := WebTasks.SearchByLogDataAndDeviceId(taskModel.LogDate, taskModel.DeviceId)
	if err != nil {
		return nil, err
	}
	if model != nil {
		model.Content = taskModel.Content
		err = getDb().Save(model).Error
		if err != nil {
			return nil, err
		}
		return model, nil
	}
	taskModel.UpdateTime = time.Now()
	err = getDb().Create(taskModel).Error
	if err != nil {
		return nil, err
	}
	return taskModel, nil
}

// update
func (*webTasks) UpdateStatus(id int64, status int) (*WebTask, error) {
	taskModel := &WebTask{}
	err := getDb().First(taskModel, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	//taskModel.Status = status
	err = WebTasks.Update(taskModel)
	return taskModel, err
}

func (*webTasks) Update(newTaskModel *WebTask) error {
	err := getDb().Save(newTaskModel).Error
	if err != nil {
		return err
	}
	return nil
}

// select
func (*webTasks) Search(beginTime, endTime int64, deviceId string) ([]WebTask, error) {
	var list []WebTask
	err := getDb().Find(&list, "add_time between ? and ? and device_id = ?", beginTime, endTime, deviceId).Error
	if err != nil {
		return nil, err
	}
	return list, nil
}

func (*webTasks) SearchByLogDataAndDeviceId(logDate int64, deviceId string) (*WebTask, error) {
	taskModel := &WebTask{}
	var err error
	db := getDb().First(taskModel, "add_time = ? and device_id = ?", logDate, deviceId)
	if db.RecordNotFound() {
		taskModel = nil
	} else {
		err = db.Error
	}
	return taskModel, err
}

func (*webTasks) QueryByTaskIds(ids []int64) (WebTaskSlice, error) {
	var list []WebTask
	err := getDb().Find(&list, "id in (?)", ids).Error
	if err != nil {
		return nil, err
	}
	return list, nil
}

func (*webTasks) QueryLatest(count int) (WebTaskSlice, error) {
	var list []WebTask
	err := getDb().Order("id asc").Limit(count).Find(&list).Error
	if err != nil {
		return nil, err
	}
	return list, nil
}

// delete
func (*webTasks) DeleteByAddTime(addTime int64) error {
	taskModel := &WebTask{}
	db := getDb().First(taskModel, "add_time = ?", addTime)
	if !db.RecordNotFound() && db.Error != nil {
		return db.Error
	}
	err := WebTasks.Delete(taskModel)
	if err != nil {
		return err
	}
	return nil
}

func (*webTasks) Delete(taskModel *WebTask) error {
	err := getDb().Delete(taskModel).Error
	if err != nil {
		return err
	}
	return nil
}
