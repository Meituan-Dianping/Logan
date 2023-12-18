package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"logan/server/env"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"logan/server/model"
)

func main() {
	var c string
	flag.StringVar(&c, "c", "logan.toml", "config file")
	flag.Parse()

	config, err := loadConfig(c)
	if err != nil {
		log.Fatalf("logan server open config failed: %s\n", err)
	}
	err = model.OpenDb(config.Mysql.Addr, config.Mysql.Db, config.Mysql.User, config.Mysql.Password)
	if err != nil {
		log.Fatalf("logan server open mysql failed: %s\n", err)
	}
	fmt.Println("%v", config)

	env.RsaPrivateKey = config.RsaPrivateKey
	env.SecretKey = config.SecretKey
	env.SecretIv = config.SecretIv
	env.LogPath = config.LogPath

	initAllowedOrigins(config.AllowedOrigins)
	r := Router()
	server := &http.Server{
		Addr:    config.Addr,
		Handler: r,
	}

	go func() {
		// service connections
		if err = server.ListenAndServe(); err != nil {
			log.Fatalf("logan server failed: %s\n", err)
		}
	}()

	shutdown := make(chan os.Signal)
	signal.Notify(shutdown, os.Interrupt, os.Kill, syscall.SIGTERM)
	<-shutdown
	log.Println("shutting down logan server ...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := server.Shutdown(ctx); err != nil {
		log.Fatal("logan server shut down failed: ", err)
	}
	log.Println("logan server exiting")
}
