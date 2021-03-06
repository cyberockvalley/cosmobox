const { create } = require("./webhooks")

const webhookJson = {
    "url": `${process.env.SITE_URL}/api/v1/json-paypal-payment`,
    "event_types": [
        {
            name: 'PAYMENT.CAPTURE.COMPLETED'
        },
        {
            name: 'PAYMENT.CAPTURE.DENIED'
        }
    ]
}
create(webhookJson, (error, webhook) => {
    if (error) {
        console.log("PAYPAL_WEBHOOK_CREATE", "error", JSON.stringify(error.response))
    } else {
        console.log("PAYPAL_WEBHOOK_CREATE", "ok", webhook)
    }
})