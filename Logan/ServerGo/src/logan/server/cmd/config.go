package main

import (
	"os"

	toml "github.com/pelletier/go-toml"
)

type Config struct {
	Addr  string `toml:"addr"`
	Mysql struct {
		Addr     string `toml:"addr"`
		Db       string `toml:"db"`
		User     string `toml:"user"`
		Password string `toml:"password"`
	} `toml:"mysql"`

	LogPath        string   `toml:"log_path"`
	SecretKey      string   `toml:"secret_key"`
	SecretIv       string   `toml:"secret_iv"`
	RsaPrivateKey  string   `toml:"rsa_key"`
	AllowedOrigins []string `toml:"origins"`
}

func loadConfig(filePath string) (*Config, error) {
	f, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	d := toml.NewDecoder(f)
	var c Config
	err = d.Decode(&c)
	return &c, err
}
