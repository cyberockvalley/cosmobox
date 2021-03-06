const Sequelize = require("sequelize")

module.exports = Product = (db, locale) => {
    var products = db.define(
        "products", 
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                field: "id"
            },
    
            seller_id: {
                type: Sequelize.INTEGER,
            },
    
            cat: {
                type: Sequelize.INTEGER,
            },
    
            subcat: {
                type: Sequelize.INTEGER,
            },

            country: {
                type: Sequelize.INTEGER,
            },

            city: {
                type: Sequelize.INTEGER,
            },

            booster: {
                type: Sequelize.STRING,
            },
    
            title: {
                type: Sequelize.STRING,
            },
    
            description: {
                type: Sequelize.STRING,
            },
    
            currency_code: {
                type: Sequelize.STRING,
            },
    
            price: {
                type: Sequelize.INTEGER,
            },
    
            photos: {
                type: Sequelize.STRING,
            },

            reviewed: {
                type: Sequelize.BOOLEAN
            },

            sold_out: {
                type: Sequelize.BOOLEAN
            },

            is_flash: {
                type: Sequelize.BOOLEAN
            },

            flash_last_update: {
                type: Sequelize.BOOLEAN
            },

            createdAt: {
                type: Sequelize.DataTypes.DATE,
                field: 'created_at'
            },

            updatedAt: {
                type: Sequelize.DataTypes.DATE,
                field: 'updated_at'
            },

            boosterExpiry: {
                type: Sequelize.DataTypes.DATE,
                field: 'booster_expiry'
            }
        }, 
        {
            timestamps: false
        }
    )
    return products
}