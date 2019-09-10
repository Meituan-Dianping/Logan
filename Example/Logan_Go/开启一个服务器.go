package main

import (
	"bytes"
	"compress/gzip"
	"crypto/aes"
	"crypto/cipher"
	"encoding/json"
	"fmt"
	"github.com/astaxie/beego/logs"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"strings"
)

type Success struct {
	Suc bool `json:"success"`
	Msg string `json:"msg"`
}
//日志model
type LogModel struct {
	C string `json:"c"`
	F int `json:"f"`
	L int64 `json:"l"`
	N string `json:"n"`
	I int `json:"i"`
	M bool `json:"m"`
}

const EncryptKey16  = "QMCOSJHUGLNCUSLA"//加密的key
const EncryptIv16  = "QMCOSJHUGLNCUSLA"//加密的IV
func main(){
	http.HandleFunc("/log/upload", func(writer http.ResponseWriter, request *http.Request) {
		fmt.Println("正在上传文件")
		encrytBytes, err := ioutil.ReadAll(request.Body)
		if err!=nil {
			panic(err)
			return
		}
		DecryptLogs(encrytBytes,"2019.txt")
		success:=&Success{
			Msg:"上传成功",
			Suc:true,
		}
		bytes, err := json.Marshal(success);
		if err!=nil {
			panic(err)
		}else{
			fmt.Println(string(bytes))
			writer.Write(bytes)
		}


		//writer.Write([]byte("上传成功"))
	})
	http.HandleFunc("/log/upload2", func(writer http.ResponseWriter, request *http.Request) {
		fmt.Println("正在上传文件")
		file, err := os.Create("./newFile.txt")
		if err!=nil {
			panic(err)
		}
		defer file.Close()
		_, err = io.Copy(file, request.Body)
		if err!=nil {
			panic(err)
		}
		success := new(Success)
		success.Msg = "上传成功"
		success.Suc = true
		bytes, err := json.Marshal(success);
		if err!=nil {
			panic(err)
		}else{
			fmt.Println(string(bytes))
			writer.Write(bytes)
		}


		//writer.Write([]byte("上传成功"))
	})
	http.HandleFunc("/hello", func(writer http.ResponseWriter, request *http.Request) {
		writer.Write([]byte("hello world"))
	})
	error := http.ListenAndServe(":8081", nil);
	if error!=nil {
		fmt.Println("当前服务端启动失败")
	}
}

//加密的数据
func DecryptLogs(encrypContent []byte,decryptLogName string)  {
	fileLength := len(encrypContent)
	//创建一个解析后的文件，用来保存解析后的文本，方便后面下载使用
	logFile, err := os.Create("./"+decryptLogName /*, os.O_RDWR, os.ModeAppend*/)
	if err!=nil {
		logs.Error(err)
		return
	}
	defer logFile.Close()
	for i := 0; i < fileLength; i++ {
		start := encrypContent[i]
		if start == 1 {
			i++
			length := int((encrypContent[i]&0xFF)<<24 | (encrypContent[i+1]&0xFF)<<16 | (encrypContent[i+2]&0xFF)<<8 | (encrypContent[i+3] & 0xFF))
			i += 3
			localType := 0
			if length > 0 {
				temp := i + length + 1
				if fileLength-i-1 == length { //异常
					localType = 0
				} else if fileLength-i-1 > length && 0 == encrypContent[temp] {
					localType = 1
				} else if fileLength-i-1 > length && 1 == encrypContent[temp] { //异常
					localType = 2
				} else {
					i -= 4
					continue
				}
				dest := make([]byte, length)
				copy(dest, encrypContent[i+1:]) //取出长度为length的数据，将当前区域的数据存储到dest中
				decrypt, err := AesDecryptSimple(dest, EncryptKey16, EncryptIv16)
				if err != nil {
					logs.Error(err)
				} else {
					if err != nil {
						logs.Error(err)
					} else {
						r1 := new(gzip.Reader)
						b := new(bytes.Buffer)
						in := bytes.NewReader(decrypt)
						err := r1.Reset(in)
						if err!=nil {
							logs.Error(err)
						}
						b.Reset()
						_, err = io.Copy(b, r1)
						if err!=nil {
							logs.Error(err)
						}else{
							////TODO 可以将结果存储到数据库中
							//_, err := logFile.Write(b.Bytes())//将结果写入到文件中
							//if err!=nil {
							//	logs.Error(err)
							//}
							//安换行符读取 https://blog.csdn.net/u010003835/article/details/51883069
							for {
								line, err := b.ReadString('\n')
								if err != nil {
									if err == io.EOF {
										break
									}
									logs.Error(err)
								}
								line = strings.TrimSpace(line)
								if line!="" && len(line)>0  {
									var logModel *LogModel = new(LogModel)
									json.Unmarshal([]byte(line),logModel)
									fmt.Println("logModel:",logModel)
								}
							}
						}
					}
				}
				i += length;
				if localType == 1 {
					i++
				}
			}
		}
	}
}
func AesDecryptSimple(crypted []byte, key string, iv string) ([]byte, error) {
	return AesDecryptPkcs5(crypted, []byte(key), []byte(iv))
}

func AesDecryptPkcs5(crypted []byte, key []byte, iv []byte) ([]byte, error) {
	return AesDecrypt(crypted, key, iv, PKCS5UnPadding)
}

func AesDecrypt(crypted, key []byte, iv []byte, unPaddingFunc func([]byte) []byte) ([]byte, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}
	blockMode := cipher.NewCBCDecrypter(block, iv)
	origData := make([]byte, len(crypted))
	blockMode.CryptBlocks(origData, crypted)
	origData = unPaddingFunc(origData)
	return origData, nil
}

func PKCS5Padding(ciphertext []byte, blockSize int) []byte {
	padding := blockSize - len(ciphertext)%blockSize
	padtext := bytes.Repeat([]byte{byte(padding)}, padding)
	return append(ciphertext, padtext...)
}

func PKCS5UnPadding(origData []byte) []byte {
	length := len(origData)
	unpadding := int(origData[length-1])
	if length < unpadding {
		return []byte("unpadding error")
	}
	return origData[:(length - unpadding)]
}
