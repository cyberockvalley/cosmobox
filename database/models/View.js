const Sequelize = require("sequelize")

module.exports = View = db => {
    var views = db.define(
        "views", 
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
    
            viewer_id: {
                type: Sequelize.INTEGER
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
    return views
}