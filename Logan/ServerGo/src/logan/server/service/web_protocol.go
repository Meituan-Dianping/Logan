package service

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/base64"
	"log"
	"strconv"
	"strings"
	"time"

	jsoniter "github.com/json-iterator/go"

	"logan/server/model"
	"logan/server/utils"
)

type WebProtocolDecoder struct {
	RsaPrivateKey string
}

type webLogField struct {
	Version int    `json:"v"`
	LogType int    `json:"t"`
	Content string `json:"c"`
	Log     string `json:"l"`
	IV      string `json:"iv"`
	AesKey  string `json:"k"`
	LogTime string `json:"d"`
}

func (d *WebProtocolDecoder) Decode(logArray string) (string, error) {
	var logs []string
	logItems := strings.Split(logArray, ",")
	for _, item := range logItems {
		content := utils.UrlDecode(item)
		w := webLogField{}
		err := jsoniter.Unmarshal([]byte(content), &w)
		if err != nil {
			return "", err
		}

		l := w.decode(d)
		logs = append(logs, l)
	}

	b, err := jsoniter.Marshal(logs)
	if err != nil {
		return "", err
	}
	return string(b), nil
}

func (w *webLogField) decode(d *WebProtocolDecoder) string {
	if w.Version == 0 {
		return w.decode0()
	} else if w.Version == 1 {
		return w.decode1(d)
	}
	return ""
}

func (w *webLogField) decode0() string {
	if w.Log != "" {
		decodeBytes, _ := base64.StdEncoding.DecodeString(w.Log)
		if string(decodeBytes) != "" {
			return string(decodeBytes)
		}
	}
	return ""
}

func (w *webLogField) decode1(d *WebProtocolDecoder) string {
	l, _ := base64.StdEncoding.DecodeString(w.Log)
	iv := w.IV
	secretKey := w.AesKey

	if utils.IsAllNotEmpty(iv, secretKey) && l != nil {
		content, err := w.decryptContent(l, iv, secretKey, d)
		if err == nil && len(content) > 0 {
			return string(content)
		}
	}
	return ""
}

func (w *webLogField) decryptContent(log []byte, iv, secretKey string, d *WebProtocolDecoder) ([]byte, error) {
	uploadKey, err := d.getPrivateKey(secretKey)
	block, err := aes.NewCipher(uploadKey)
	if err != nil {
		return nil, err
	}
	IV := []byte(iv)
	blockMode := cipher.NewCTR(block, IV)
	message := make([]byte, len(log))
	blockMode.XORKeyStream(message, log)
	return message, nil
}

func (d *WebProtocolDecoder) getPrivateKey(uploadKey string) ([]byte, error) {
	b, _ := base64.StdEncoding.DecodeString(d.RsaPrivateKey)
	priv, err := x509.ParsePKCS1PrivateKey(b)
	if err != nil {
		return nil, err
	}
	uploadKeys, err := base64.StdEncoding.DecodeString(uploadKey)
	if err != nil {
		return nil, err
	}
	return rsa.DecryptPKCS1v15(rand.Reader, priv, uploadKeys)
}

func ParseDetailWebLog(content string, taskId int64) []model.DetailWebLog {
	var logs []string
	err := jsoniter.Unmarshal([]byte(content), &logs)
	if err != nil {
		log.Println("decode weblog failed")
		return nil
	}
	var list []model.DetailWebLog
	for _, item := range logs {
		webLogDetail, _ := parseOneLogItem(item, taskId)
		if webLogDetail.Content != "" {
			list = append(list, webLogDetail)
		}
	}
	return list
}

func parseOneLogItem(logItem string, taskId int64) (model.DetailWebLog, error) {
	webLogField := webLogField{}
	err := jsoniter.Unmarshal([]byte(logItem), &webLogField)
	WebLogDetail := model.DetailWebLog{}
	if err != nil {
		return WebLogDetail, err
	}

	if utils.IsAllNotEmpty(webLogField.Content, webLogField.LogTime) {
		WebLogDetail.TaskId = taskId
		WebLogDetail.Content = utils.UrlDecode(webLogField.Content)
		WebLogDetail.LogType = webLogField.LogType
		logTime, _ := strconv.ParseInt(webLogField.LogTime, 10, 64)
		WebLogDetail.LogTime = logTime
		WebLogDetail.AddTime = time.Now().Unix() * 1000
		WebLogDetail.MinuteOffset = utils.GetDayOffset(time.Unix(logTime/1000, 0))
		return WebLogDetail, nil
	}
	return WebLogDetail, nil

}
