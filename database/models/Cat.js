const Sequelize = require("sequelize")
const { getLocaleColName } = require("..")

module.exports = Cat = (db, locale) => {
    var cats = db.define(
        "cats", 
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
    
            name: {
                type: Sequelize.STRING,
                field: getLocaleColName("name", locale)
            },

            description: {
                type: Sequelize.STRING,
                field: getLocaleColName("description", locale)
            },

            image: {
                type: Sequelize.STRING,
                field: getLocaleColName("image", locale)
            },

            weight: {
                type: Sequelize.INTEGER
            },

            is_custom: {
                type: Sequelize.BOOLEAN
            },

            no_subcat_placeholder: {
                type: Sequelize.INTEGER
            }
        }, 
        {
            timestamps: false
        }
    )
    return cats
}