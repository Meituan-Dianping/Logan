# compile
```
cd ServerGo
export GOPATH=`pwd`
go mod vendor
CGO_ENABLED=0 GOARCH=amd64 go build  -o server logan/server/cmd
```

# run

```
mkdir logfile
./server -c src/logan/server/cmd/logan.toml
```
