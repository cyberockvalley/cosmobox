const Sequelize = require("sequelize")
const { getLocaleColName } = require("..")

module.exports = Message = (db, locale) => {
    var messages = db.define(
        "messages", 
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                field: "id"
            },

            from_id: {
                type: Sequelize.INTEGER,
            },

            to_id: {
                type: Sequelize.INTEGER,
            },

            chat_id: {
                type: Sequelize.STRING,
            },

            product_id: {
                type: Sequelize.INTEGER,
            },
    
            text: {
                type: Sequelize.STRING,
                field: getLocaleColName("text", locale)
            },

            delivered: {
                type: Sequelize.BOOLEAN,
            },

            msg_read: {
                type: Sequelize.BOOLEAN,
            },

            is_general: {
                type: Sequelize.BOOLEAN,
            },

            createdAt: {
                type: Sequelize.DataTypes.DATE,
                field: 'created_at'
            },

            updatedAt: {
                type: Sequelize.DataTypes.DATE,
                field: 'updated_at'
            }
        }, 
        {
            timestamps: false
        }
    )
    return messages
}