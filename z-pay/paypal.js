const fs = require("fs")
const path = require("path")

const getConfig = require('next/config').default

const projectRoot = () => {
    return getConfig().serverRuntimeConfig.PROJECT_ROOT
}
const isProduction = process.env.NODE_ENV === 'production'
var logFile = path.join(projectRoot(), `../logs/cosmobox/paypal-payment${isProduction? "" : "-dev"}.txt`)

var today = new Date();
var day = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()
var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()

console.log("LOG_FILE:", projectRoot(), logFile)

const dotenv = require('dotenv')
const result = dotenv.config({ path: '.env.local' })
//console.log("PROCESS_ENV_DATA", result.parsed)
const paypal = require('paypal-rest-sdk')

const options = {
    mode: process.env.NODE_ENV === 'production'? 'sandbox' : 'sandbox', // Sandbox or live
    client_id: process.env.NODE_ENV === 'production'? process.env.NEXT_PUBLIC_PAYPAL_LIVE_CLIENT_ID : process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID,
    client_secret: process.env.NODE_ENV === 'production'? process.env.PAYPAL_LIVE_SECRET : process.env.PAYPAL_SANDBOX_SECRET
}

paypal.configure(options)

console.log("OPTIONS:", options, process.env.NODE_ENV)

fs.appendFileSync(logFile, `
PAYPAL_NODE_ENV: ${process.env.NODE_ENV}\n
PAYPAL_OPTIONS: ${JSON.stringify(options)}\n
`)

module.exports = paypal