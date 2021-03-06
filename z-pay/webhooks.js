const paypal = require("./paypal")

//create webhook from json
const create = (webhookJson, handler) => {
    paypal.notification.webhook.create(webhookJson, handler)
}

//delete webhook by webbhook id
const del = (webhookId, handler) => {
    paypal.notification.webhook.del(webhookId, handler)
}

//list event types
const eventTypes = (webhookId, handler) => {
    paypal.notification.webhook.eventTypes(webhookId, handler)
}

//list webhooks
const list = handler => {
    paypal.notification.webhook.list(handler)
}

//replace webhook url with path => /url, event types with path => event_types
const replace = (webhookId, webhookReplacementAttrs, handler) => {
    paypal.notification.webhook.replace(webhookId, webhookReplacementAttrs, handler)
}

module.exports = {
    create, del, eventTypes, list, replace
}