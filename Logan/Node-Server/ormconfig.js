module.exports = {
    "name": "default",
    "type": "mysql",
    "host": '127.0.0.1',
    "port": '3306',
    "username": "root",
    "password": "root",
    "database": "logan",
    "charset": "UTF8_GENERAL_CI",
    "synchronize": true,
    "logging": false,
    "autoSchemaSync": false,
    "supportBigNumbers": true,
    "bigNumberStrings": false,
    "entities": [
        "dao/entity/**/*.ts"
    ],
    "migrations": [
        "dao/migration/**/*.ts"
    ],
    "subscribers": [
        "dao/subscriber/**/*.ts"
    ],
    "cli": {
        "entitiesDir": "dao/entity",
        "migrationsDir": "dao/migration",
        "subscribersDir": "dao/subscriber"
    }
}