const Sequelize = require("sequelize")
const { getLocaleColName } = require("..")

module.exports = SubCat = (db, locale) => {
    var subcats = db.define(
        "subcats", 
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                field: "id"
            },

            text_id: {
                type: Sequelize.STRING,
                primaryKey: true,
                field: "text_id"
            },

            cat_id: {
                type: Sequelize.INTEGER
            },
    
            name: {
                type: Sequelize.STRING,
                field: getLocaleColName("name", locale)
            },

            weight: {
                type: Sequelize.INTEGER
            }
        }, 
        {
            timestamps: false
        }
    )
    return subcats
}