package model

import (
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"github.com/jinzhu/gorm"
)

var db *gorm.DB

func OpenDb(addr, dbName, user, pwd string) error {
	s := fmt.Sprintf("%s:%s@tcp(%s)/%s?charset=utf8&parseTime=True&loc=Local", user, pwd, addr, dbName)
	var err error
	db, err = gorm.Open("mysql", s)
	return err
}

func getDb() *gorm.DB {
	return db
}
