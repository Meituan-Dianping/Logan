#!/usr/bin/env bash

dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
# db config
sed -i "s/host/db/" $dir/Server/src/main/resources/db.properties
sed -i "s/port/3306/" $dir/Server/src/main/resources/db.properties
sed -i "s/database/logan/" $dir/Server/src/main/resources/db.properties
sed -i "s/=username/=logan/" $dir/Server/src/main/resources/db.properties
sed -i "s/=password/=logan/" $dir/Server/src/main/resources/db.properties

# front
sed -i "s/registry.npmjs.org/registry.npmmirror.com/" $dir/LoganSite/.npmrc
cp $dir/LoganSite/.env.development.example $dir/LoganSite/.env.development

docker-compose --file=$dir/docker-compose.yaml up -d --build
