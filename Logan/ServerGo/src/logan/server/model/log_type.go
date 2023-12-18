package model

type LogTypeEnum struct {
	logType int
	logDesc string
}

type Tuple struct {
	First  interface{} `json:"first"`
	Second interface{} `json:"second"`
}

var UNKNOWN = &LogTypeEnum{0, "unknown"}
var ONE = &LogTypeEnum{1, "日志类型1"}
var TWO = &LogTypeEnum{2, "日志类型2"}
var THREE = &LogTypeEnum{3, "日志类型3"}

func ValueOfLogType(logType int) *LogTypeEnum {
	switch logType {
	case 0:
		return UNKNOWN
	case 1:
		return ONE
	case 2:
		return TWO
	case 3:
		return THREE
	default:
		return UNKNOWN
	}
}

func AllLogTypes() []Tuple {
	var arr []Tuple
	arr = append(arr, Tuple{0, "unknown"})
	arr = append(arr, Tuple{1, "日志类型1"})
	arr = append(arr, Tuple{2, "日志类型2"})
	arr = append(arr, Tuple{3, "日志类型3"})
	return arr
}

type Platform int

const (
	LoganUNKNOWN = -1
	LoganAll     = 0
	LoganAndroid = 1
	LoganIOS     = 2
)

func (i Platform) Value() int {
	if i < LoganAll || i > LoganIOS {
		return LoganUNKNOWN
	}
	return int(i)
}

func (i Platform) String() string {
	switch i {
	case LoganIOS:
		return "iOS"
	case LoganAndroid:
		return "Android"
	case LoganAll:
		return "All"
	default:
		return "Unknown"
	}
}

type TaskStatusEnum struct {
	Status int
	Desc   string
}

var TaskStatusNormal = &TaskStatusEnum{0, "未经分析"}
var TaskStatusAnalyzed = &TaskStatusEnum{1, "已经被分析过"}

type PlatformEnum struct {
	Platform int
	Desc     string
}
