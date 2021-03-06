const Sequelize = require("sequelize")

module.exports = UserList = db => {
    var user_lists = db.define(
        "user_lists", 
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                field: "id"
            },

            product_id: {
                type: Sequelize.INTEGER
            },
    
            user_id: {
                type: Sequelize.INTEGER
            },

            removed: {
                type: Sequelize.BOOLEAN
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
    return user_lists
}