const Sequelize = require("sequelize")

module.exports = Bell = db => {
    var users = db.define(
        "nextauth_users", 
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                field: "id"
            },

            email: {
                type: Sequelize.STRING,
                primaryKey: true
            },
    
            name: {
                type: Sequelize.STRING
            },

            username: {
                type: Sequelize.STRING
            },

            image: {
                type: Sequelize.STRING
            },

            bio: {
                type: Sequelize.STRING
            },

            telephone: {
                type: Sequelize.STRING
            },

            email_verified: {
                type: 'TIMESTAMP'
            },

            createdAt: {
                type: Sequelize.DataTypes.DATE,
                field: 'created_at'
            },

            updatedAt: {
                type: Sequelize.DataTypes.DATE,
                field: 'updated_at'
            },

            rank: {
                type: Sequelize.INTEGER
            }
        }, 
        {
            timestamps: false
        }
    )
    return users
}