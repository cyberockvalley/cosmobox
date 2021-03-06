const Sequelize = require("sequelize");

module.exports = getDb = (dbInfo) => {
    return new Sequelize(dbInfo.name, dbInfo.user, dbInfo.pass, {
        host: dbInfo.host,
        dialect: "mysql",
        operatorsAliases: false,
    
        define: {
            //prevent sequelize from pluralizing table names
            freezeTableName: true
        },
    
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    })
}