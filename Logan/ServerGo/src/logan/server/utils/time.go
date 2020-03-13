package utils

import (
	"fmt"
	"strconv"
	"strings"
	"time"
)

func ParseDate(date string) int64 {
	if t, e := time.Parse("2006-01-02", date); e == nil {
		return t.UnixNano() / 1e6
	}
	return 0
}

type TrimFieldEnum string

const (
	Trim_Hour   TrimFieldEnum = "2006-01-02 00:00:00"
	Trim_Minute TrimFieldEnum = "2006-01-02 15:00:00"
	Trim_Second TrimFieldEnum = "2006-01-02 15:04:00"
)

const Layout = "2006-01-02 15:04:05"
const Layout_DAY = "2006-01-02"

func TrimAfter(t time.Time, field TrimFieldEnum) (time.Time, error) {
	return time.Parse(Layout, t.Format(string(field)))
}

func PlusDay(t time.Time, days int) time.Time {
	d, _ := time.ParseDuration(fmt.Sprintf("%d%s", days, "d"))
	return t.Add(d)
}

func GetDayOffset(t time.Time) int {
	t1, _ := TrimAfter(t, Trim_Hour)
	return int((t.Unix() - t1.Unix()) / 60)
}

func GetOffset(hourAndMinute string, defaultOffset int) int {
	if hourAndMinute == "" {
		return defaultOffset
	}
	arr := strings.Split(hourAndMinute, ":")
	if len(arr) != 2 {
		return defaultOffset
	}
	hour, _ := strconv.Atoi(arr[0])
	minute, _ := strconv.Atoi(arr[1])
	return hour*60 + minute
}
func ParseDateDay(date string) (time.Time, error) {
	return Parse(date, Layout_DAY)
}

func Parse(date, layout string) (time.Time, error) {
	return time.Parse(layout, date)
}
