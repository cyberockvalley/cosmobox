const Sequelize = require("sequelize")

module.exports = Bell = db => {
    var bells = db.define(
        "bells", 
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                field: "id"
            },

            text_key: {
                type: Sequelize.STRING,
                primaryKey: true,
                field: "text_id"
            },
    
            text_vars: {
                type: Sequelize.STRING
            },

            receiver_id: {
                type: Sequelize.INTEGER,
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
    return bells
}