const Sequelize = require("sequelize")

module.exports = City = (db) => {
    var cities = db.define(
        "cities", 
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                field: "id"
            },

            state_id: {
                type: Sequelize.INTEGER
            },
    
            name: {
                type: Sequelize.STRING
            }
        }, 
        {
            timestamps: false
        }
    )
    return cities
}