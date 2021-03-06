const paypal = require("./paypal")

//get webhook event with event id
const get = (webhookEventId, handler) => {
    paypal.notification.webhookEvent.get(webhookEventId, handler)
}

//get and verify webhook event body
const getAndVerify = (webhookEventBody, handler) => {
    paypal.notification.webhookEvent.getAndVerify(webhookEventBody, handler)
}

const verify = (webhookEventHeaders, webhookEventBody, webhookId, handler, hasPromise) => {
    if(hasPromise) {
        return new Promise((resolve, reject) => {
            paypal.notification.webhookEvent.verify(webhookEventHeaders, webhookEventBody, webhookId, function (error, response) {
                if (error) {
                    reject(error)
        
                } else {
                    // Verification status must be SUCCESS
                    if (response.verification_status === "SUCCESS") {
                        resolve(true)
        
                    } else {
                        resolve(false)
                    }
                }
            })
        })

    } else {
        paypal.notification.webhookEvent.verify(webhookEventHeaders, webhookEventBody, webhookId, function (error, response) {
            if (error) {
                handler(error, false)
    
            } else {
                // Verification status must be SUCCESS
                if (response.verification_status === "SUCCESS") {
                    handler(false, true)
    
                } else {
                    handler(false, false)
                }
            }
        })
    }
}

module.exports = {
    get, getAndVerify, verify
}