package utils

import (
	"logan/server/env"
	"os"
	"path"
)

func FilePath(fileName string) string {
	return path.Join(env.LogPath, fileName)
}

func CreateLogFile(fileName string) (f *os.File, e error) {
	p := FilePath(fileName)
	return os.Create(p)
}

func OpenLogFile(fileName string) (f *os.File, e error) {
	p := FilePath(fileName)
	return os.Open(p)
}
