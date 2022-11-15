#!/usr/bin/env bash

# db config
sed -i "s/host/db/" ./Server/src/main/resources/db.properties
sed -i "s/port/3306/" ./Server/src/main/resources/db.properties
sed -i "s/database/logan/" ./Server/src/main/resources/db.properties
sed -i "s/=username/=logan/" ./Server/src/main/resources/db.properties
sed -i "s/=password/=logan/" ./Server/src/main/resources/db.properties

# front
cp ./LoganSite/.env.development.example ./LoganSite/.env.development

docker-compose up -d --build