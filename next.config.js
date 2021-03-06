const withPlugins = require('next-compose-plugins')
const nextTranslate = require('next-translate')

const path = require('path')

// next.js configuration
const nextConfig = {
    env: {
    },
    serverRuntimeConfig: {
        STATIC_PATH: path.join(__dirname, "public"),
        PROJECT_ROOT: __dirname
    },
    publicRuntimeConfig: {
        
    },
    images: {
        deviceSizes: [400, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        domains: [
            'localhost:3000', 
            'dev.domain.com:3000', 
            "lh5.googleusercontent.com",
            "via.placeholder.com",
            "static.fivebazar.com"
        ],
    },
}

module.exports = withPlugins([
    nextTranslate()
], nextConfig)