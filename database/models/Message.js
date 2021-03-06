const Sequelize = require("sequelize")
const { getLocaleColName } = require("..")
const i18n = require("../../i18n")

var info = {
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
        type: Sequelize.STRING
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
}

const { locales, defaultLocale } = i18n
const get = () => {
    var tableInfo = {...info}
    locales.forEach(locale => {
        if(locale != defaultLocale) {
            tableInfo[`text_${locale}`] = {
                type: Sequelize.STRING
            }
        }
    });
    return tableInfo
}

module.exports = Message = (db) => {
    var messages = db.define(
        "messages", 
        get(), 
        {
            timestamps: false
        }
    )
    return messages
}