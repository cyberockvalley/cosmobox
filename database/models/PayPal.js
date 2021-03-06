const Sequelize = require("sequelize")

module.exports = PayPal = db => {
    var paypal = db.define(
        "paypal", 
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                field: "id"
            },

            captureId: {
                type: Sequelize.STRING,
                primaryKey: true,
                field: 'capture_id'
            },

            productId: {
                type: Sequelize.INTEGER,
                field: 'product_id'
            },

            amountValue: {
                type: Sequelize.STRING,
                field: 'amount_value'
            },

            amountCurrency: {
                type: Sequelize.STRING,
                field: 'amount_currency'
            },

            capturedAt: {
                type: Sequelize.DataTypes.DATE,
                field: 'captured_at'
            },

            consumed: {
                type: Sequelize.DataTypes.BOOLEAN
            },

            fromWebhook: {
                type: Sequelize.DataTypes.BOOLEAN,
                field: 'from_webhook'
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
    return paypal
}