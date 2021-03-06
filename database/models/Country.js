const Sequelize = require("sequelize")

module.exports = Country = db => {
    var countries = db.define(
        "states", 
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                field: "id"
            },

            sortname: {
                type: Sequelize.STRING
            },
    
            name: {
                type: Sequelize.STRING
            },/*

            phonecode: {
                type: Sequelize.STRING
            },

            currency_code: {
                type: Sequelize.STRING
            },

            currency_symbol: {
                type: Sequelize.STRING
            },*/
        }, 
        {
            timestamps: false
        }
    )
    return countries
}