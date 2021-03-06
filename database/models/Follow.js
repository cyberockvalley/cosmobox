const Sequelize = require("sequelize")

module.exports = Follow = db => {
    var follows = db.define(
        "follows", 
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                field: "id"
            },

            follower: {
                type: Sequelize.INTEGER,
            },

            followed: {
                type: Sequelize.INTEGER,
            },

            createdAt: {
                type: Sequelize.DataTypes.DATE,
                field: 'created_at'
            }
        }, 
        {
            timestamps: false
        }
    )
    return follows
}