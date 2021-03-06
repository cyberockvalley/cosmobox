import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'
import getTables from '../../../database/get-tables'
import getPageLinks from '../../../hooks/page-links'
import { API_OPTIONS } from '../[...v1]'

const { signInPageLink, signUpPageLink } = getPageLinks()
const emailOption = {/*
  // SMTP connection string or nodemailer configuration object https://nodemailer.com/
  server: process.env.NEXTAUTH_EMAIL_SERVER,
  // Email services often only allow sending email from a valid/verified address
  from: process.env.NEXTAUTH_EMAIL_FROM,*/
  server: {
    host: process.env.MAILER_HOST,
    port: process.env.MAILER_PORT,
    auth: {
        user: process.env.MAILER_USER,
        pass: process.env.MAILER_PASS
    }
  },
  from: process.env.NEXTAUTH_EMAIL_FROM
}

const options = {
  // @link https://next-auth.js.org/configuration/providers
  providers: [
    Providers.Email(emailOption),
    // When configuring oAuth providers make sure you enabling requesting
    // permission to get the users email address (required to sign in)
    Providers.Google({
      clientId: process.env.NEXTAUTH_GOOGLE_ID,
      clientSecret: process.env.NEXTAUTH_GOOGLE_SECRET,
    }),
    Providers.Facebook({
      clientId: process.env.NEXTAUTH_FACEBOOK_ID,
      clientSecret: process.env.NEXTAUTH_FACEBOOK_SECRET,
    }),
    //The Credentials provider can only be used if JSON Web Tokens are enabled for sessions. 
    //Users authenticated with the Credentials provider are not persisted in the database.
    Providers.Credentials({
      id: 'sign-in-credentials',
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: 'Credentials',
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: {  label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        var error = 'eee'
        var usernameError = 'Ueee'
        var passwordError = 'Peee'
        
        // Add logic here to look up the user from the credentials supplied
        const user = null//{id: 1, name: 'J Smith', email: 'jsmith@example.com'}
        //const user = await User.findOne()
        //console.log("Credentials:", "sign-in-credentials", credentials)

        
        if (user) {
          // Any user object returned here will be saved in the JSON Web Token
          return Promise.resolve(user)
        } else {

          return Promise.reject(`${signInPageLink}?error=${error}&username_error=${usernameError}&password_error=${passwordError}`)
        }
      }
    }),


    Providers.Credentials({
      id: 'sign-up-credentials',
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: 'Credentials',
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: {  label: "Password", type: "password" },
        firstname: { type: "text" },
        lastname: { type: "text" }
      },
      authorize: async (credentials) => {
        var error = 'Seee'
        var usernameError = 'SUeee'
        var passwordError = 'SPeee'
        var firstnameError = 'SFeee'
        var lastnameError = 'SLeee'
        
        // Add logic here to look up the user from the credentials supplied
        const user = null//{id: 1, name: 'J Smith', email: 'jsmith@example.com'}
        //const user = await User.findOne()
        //console.log("Credentials:", "sign-up-credentials", credentials)

        
        if (user) {
          // Any user object returned here will be saved in the JSON Web Token
          return Promise.resolve(user)
        } else {

          return Promise.reject(`${signUpPageLink}?signup_error=${error}&signup_username_error=${usernameError}&signup_password_error=${passwordError}&signup_firstname_error=${firstnameError}&signup_lastname_error=${lastnameError}`)
        }
      }
    })
  ],

  // @link https://next-auth.js.org/configuration/databases
  // NOT WORKING
  database: process.env.NEXTAUTH_DATABASE_URL,
  
  // @link https://next-auth.js.org/configuration/options#session
  session: {
    // Use JSON Web Tokens for session instead of database sessions.
    // This option can be used with or without a database for users/accounts.
    // Note: `jwt` is automatically set to `true` if no database is specified.
    jwt: true,
    // Seconds - How long until an idle session expires and is no longer valid.
    maxAge: 30 * 24 * 60 * 60, // 30 days
    // Seconds - Throttle how frequently to write to database to extend a session.
    // Use it to limit write operations. Set to 0 to always update the database.
    // Note: This option is ignored if using JSON Web Tokens
    // updateAge: 24 * 60 * 60, // 24 hours
  },

  // @link https://next-auth.js.org/configuration/options#jwt
  jwt: {
    // A secret to use for key generation - you should set this explicitly
    // Defaults to NextAuth.js secret if not explicitly specified.
    secret: process.env.NEXTAUTH_JWT_SECRET,
    // Set to true to use encryption. Defaults to false (signing only).
    encryption: true,
    // You can define your own encode/decode functions for signing and encryption
    // if you want to override the default behaviour.
    // encode: async ({ secret, token, maxAge }) => {},
    // decode: async ({ secret, token, maxAge }) => {},
  },

  // @link https://next-auth.js.org/configuration/callbacks
  callbacks: {
    /**
     * Intercept signIn request and return true if the user is allowed.
     *
     * @link https://next-auth.js.org/configuration/callbacks#sign-in-callback
     * @param  {object} user     User object
     * @param  {object} account  Provider account
     * @param  {object} profile  Provider profile
     * @return {boolean}         Return `true` (or a modified JWT) to allow sign in
     *                           Return `false` to deny access
     */
    signIn: async (user, account, profile) => {
      //console.log("callback@signIn", user, account, profile)
      return true
    },

    /**
     * @link https://next-auth.js.org/configuration/callbacks#session-callback
     * @param  {object} session      Session object
     * @param  {object} user         User object    (if using database sessions)
     *                               JSON Web Token (if not using database sessions)
     * @return {object}              Session that will be returned to the client
     */
    session: async (session, user) => {
      const Sequelize = require("sequelize")
      //session.customSessionProperty = 'bar'
      //console.log("callback@session", user, session)
      const { User } = getTables(API_OPTIONS.database, ['User'], API_OPTIONS.defaultLocale, API_OPTIONS.defaultLocale)
      
      const fullUser = await User.findOne({
        where: {email: user.email}
      })
      if(fullUser) {
        session.user.id = fullUser.id
        session.user.telephone = fullUser.telephone
        session.user.createdAt = fullUser.createdAt
        session.user.updatedAt = fullUser.updatedAt
        session.user.rank = fullUser.rank
        session.user.name = fullUser.name
        session.user.image = fullUser.image
        session.user.username = fullUser.username
        session.user.bio = fullUser.bio
      }

      return Promise.resolve(session)
    },

    /**
     * @link https://next-auth.js.org/configuration/callbacks#jwt-callback
     * @param  {object}  token     Decrypted JSON Web Token
     * @param  {object}  user      User object      (only available on sign in)
     * @param  {object}  account   Provider account (only available on sign in)
     * @param  {object}  profile   Provider profile (only available on sign in)
     * @param  {boolean} isNewUser True if new user (only available on sign in)
     * @return {object}            JSON Web Token that will be saved
     */
    jwt: async (token, user, account, profile, isNewUser) => {
      //const isSignIn = (user) ? true : false
      // Add auth_time to token on signin in
      //if (isSignIn) { token.auth_time = Math.floor(Date.now() / 1000) }
      return Promise.resolve(token)
    },
  },

  // You can define custom pages to override the built-in pages
  // The routes shown here are the default URLs that will be used.
  // @link https://next-auth.js.org/configuration/pages
  pages: {
    signIn: signInPageLink,// /api/auth/signin
    //signOut: '/api/auth/signout',
    //error: '/api/auth/error', // Error code passed in query string as ?error=
    //verifyRequest: '/api/auth/verify-request', // (used for check email message)
    //newUser: null // If set, new users will be directed here on first sign in
  },

  // Additional options
  secret: process.env.NEXTAUTH_PAGES_SECRET, // Recommended (but auto-generated if not specified)
  debug: true, // Use this option to enable debug messages in the console
}

const Auth = (req, res) => {
  NextAuth(req, res, options)
}

export default Auth