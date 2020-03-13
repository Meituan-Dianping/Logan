package service

import (
	"bytes"
	"compress/gzip"
	"crypto/aes"
	"crypto/cipher"
	"encoding/binary"
	"errors"
	"io"
	"io/ioutil"
	"log"
)

const encryptContentStart = '\u0001'

type NativeProtocolDecoder struct {
	input     io.Reader
	output    io.Writer
	secretKey string
	secretIv  string
}

func NewNativeProtocolDecoder(input io.Reader, output io.Writer, secretKey string, secretIv string) *NativeProtocolDecoder {
	return &NativeProtocolDecoder{input, output, secretKey, secretIv}
}

func (d *NativeProtocolDecoder) Decode() error {
	data, e := ioutil.ReadAll(d.input)
	if e != nil {
		return e
	}

	position := 0
	length := len(data)
	for position <= length-1 {
		if data[position] != encryptContentStart {
			position++
		} else {
			position++
			b := data[position:(position + 4)]
			l := int(binary.BigEndian.Uint32(b))
			start := position + 4
			endIndex := start + l
			newArr := data[start:endIndex]
			data, err := d.decrypt(newArr)
			if err != nil {
				return err
			}
			x, err := io.Copy(d.output, data)
			log.Println(x, err)

			data.Close()
			if err != nil && err != io.EOF && err != io.ErrUnexpectedEOF && err != gzip.ErrHeader {
				return err
			}
			position = endIndex
		}
	}
	return nil
}

func (d *NativeProtocolDecoder) decrypt(content []byte) (io.ReadCloser, error) {
	key := []byte(d.secretKey)
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}
	iv := []byte(d.secretIv)
	if len(content)%aes.BlockSize != 0 {
		return nil, errors.New("content is not a multiple of the block size")
	}
	mode := cipher.NewCBCDecrypter(block, iv)
	mode.CryptBlocks(content, content)
	return d.decompress(content)
}

func (d *NativeProtocolDecoder) decompress(data []byte) (io.ReadCloser, error) {
	return gzip.NewReader(bytes.NewReader(data))
}
