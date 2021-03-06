const dotenv = require('dotenv')
const result = dotenv.config({ path: '.env.local' })
//console.log("PROCESS_ENV_DATA", result.parsed)
const paypal = require('paypal-rest-sdk')

const options = {
    mode: process.env.NODE_ENV === 'production'? 'live' : 'sandbox', // Sandbox or live
    client_id: process.env.NODE_ENV === 'production'? process.env.NEXT_PUBLIC_PAYPAL_LIVE_CLIENT_ID : process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID,
    client_secret: process.env.NODE_ENV === 'production'? process.env.PAYPAL_LIVE_SECRET : process.env.PAYPAL_SANDBOX_SECRET
}

paypal.configure(options)

console.log("OPTIONS:", options, process.env.NODE_ENV)

module.exports = paypal