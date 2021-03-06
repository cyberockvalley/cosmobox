const Sequelize = require("sequelize")

module.exports = Review = db => {
    var reviews = db.define(
        "reviews", 
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

            writer_id: {
                type: Sequelize.INTEGER
            },

            text: {
                type: Sequelize.STRING
            },

            has_text: {
                type: Sequelize.BOOLEAN
            },

            rating: {
                type: Sequelize.INTEGER
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
    return reviews
}