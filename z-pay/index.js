const { create, del, eventTypes, list, replace } = require("./webhooks")
const { get, getAndVerify, verify } = require("./webhook-events")

const path = require("path")

const funcMap = {
    //npm run payhook-dev -- func=create data=z-pay/test-webhook.json
    create: args => {
        const webhookJson = require(path.join(process.cwd(), args.data))
        create(webhookJson, (error, webhook) => {
            if (error) {
                console.log("PAYPAL_WEBHOOK_CREATE", "error", JSON.stringify(error.response))
            } else {
                console.log("PAYPAL_WEBHOOK_CREATE", "ok", webhook)
            }
        })
    },
    //npm run payhook-dev -- func=ls
    ls: args => {
        list((error, webhooks) => {
            if (error) {
                console.log("PAYPAL_WEBHOOK_LIST", "error", JSON.stringify(error.response))
            } else {
                console.log("PAYPAL_WEBHOOK_LIST", "ok", webhooks)
            }
        })
    },
    //npm run payhook-dev -- func=del id=1HE69114N98887802
    del: args => {
        del(args.id, (error, response) => {
            if (error) {
                console.log("PAYPAL_WEBHOOK_DELETE", "error", JSON.stringify(error.response))
            } else {
                console.log("PAYPAL_WEBHOOK_DELETE", "ok", response)
            }
        })
    },
    //npm run payhook-dev -- func=replace id=1HE69114N98887802 data=z-pay/test-webhook-replacement.json
    replace: args => {
        const webhookReplacementsJson = require(path.join(process.cwd(), args.data))
        replace(args.id, webhookReplacementsJson, (error, webhook) => {
            if (error) {
                console.log("PAYPAL_WEBHOOK_REPLACE", "error", JSON.stringify(error.response))
            } else {
                console.log("PAYPAL_WEBHOOK_REPLACE", "ok", webhook)
            }
        })
    },
    //npm run payhook-dev -- func=get eid=WH-82L71649W50323023-5WC64761VS637831A
    get: args => {
        get(args.eid, (error, response) => {
            if (error) {
                console.log("PAYPAL_WEBHOOK_GET_EVENT", "error", JSON.stringify(error.response))
            } else {
                console.log("PAYPAL_WEBHOOK_GET_EVENT", "ok", response)
            }
        })
    },
}

const run = () => {
    const args = process.argv.slice(2)
    var func = ""
    var funcArgs = {}
    args.forEach(arg => {
        var keyValue = arg.split("=")
        console.log("kv", keyValue)
        if(keyValue[0].toLowerCase() == "func") {
            func = keyValue[1]

        } else {
            funcArgs[keyValue[0].toLowerCase()] = keyValue[1]
        }
    })
    console.log("ENV", args, func, funcArgs)
    if(Object.keys(funcMap).includes(func)) {
        funcMap[func](funcArgs)
    }
}

run()