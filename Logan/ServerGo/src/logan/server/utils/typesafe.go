package utils

import (
	"strconv"
	"strings"
)

const SEVEN_DAY = 7 * 24 * 60 * 60 * 1000

//const REGEX = ","
const ONE_DAY = 1 * 24 * 60 * 60 * 1000

func NullToDefault(value, defaultValue interface{}) interface{} {
	if value == nil {
		return defaultValue
	}
	return value
}

func ParseIntList(str, regex string) []int {
	return ParseList(str, regex)
}

func ParseList(str, regex string) []int {
	var result []int
	if str == "" {
		return result
	}
	arr := strings.Split(str, regex)
	for _, item := range arr {
		v, _ := strconv.Atoi(item)
		result = append(result, v)
	}
	return result
}

func ParseInt64List(str, regex string) []int64 {
	var result []int64
	arr := strings.Split(str, regex)
	for _, item := range arr {
		v, _ := strconv.ParseInt(item, 10, 64)
		result = append(result, v)
	}
	return result
}

func IgnoreInt64(source []int64, ignored int64) []int64 {
	var arr []int64
	if len(source) != 0 {
		for _, item := range source {
			if item != ignored {
				arr = append(arr, item)
			}
		}
		return arr
	}
	return source
}
