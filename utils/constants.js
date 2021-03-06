export const STORAGE_KEYS = {
    searchHistory: "search-history",
    tailoredSearchTags: "tailored-search-tags"
}

export const THEME = "cosmobox"

export const TITLE_SEPARATOR = " - "

export const FACEBOOK_PAGE_LINK = ""
export const INSTAGRAM_PAGE_LINK = ""
export const TWITTER_PAGE_LINK = ""

export const NO_PROFILE_PIC = "/res/images/no-profile-photo.jpg"

export const DB_PHOTOS_SEPERATOR = ","

export const TEXT_BREAK_POINT = "::B::"

export const CURRENCY_CODE = "EUR"

export const IMAGE_FILENAME_AND_DIMENSIONS_SEPERATOR = "-"
export const IMAGE_DIMENSIONS_SEPERATOR = "X"

export const MAX_RATING_STARS = 5

export const PROFILE_PHOTO_SIZE_XS = 15
export const PROFILE_PHOTO_SIZE_SM = 40
export const PROFILE_PHOTO_SIZE_MD = 100
export const PROFILE_PHOTO_SIZE_LG = 120

export const DEFAULT_PHONE_COUNTRY = 'it'

export const MAX_REVIEW_PREVIEW_CHARS = 120

export const REVIEWS_PER_PAGE = 15
export const PRODUCTS_PER_PAGE = 48
export const RELATED_PRODUCTS_LIMIT = 8
export const PAGINATION_RANGE = 7

export const CHATS_PER_PAGE = 50
export const MESSAGES_PER_PAGE = 50

export const USERLINK_PREFIX = "@"
export const NO_USERLINK_ID_PREFIX = "vendor-"

export const MSG_EDITOR_MAX_LENGTH = 500

export const GENERAL_MESSAGE_CHAT_ID = "general"
export const CHAT_ID_SEPARATOR = "-"

export const DEFAULT_IMAGE_HOST = ""//"https://static.cosmobox.com"

export const PAYPAL_CLIENT_ID = () => {
    return process.env.NODE_ENV === 'production'? 
    process.env.NEXT_PUBLIC_PAYPAL_LIVE_CLIENT_ID
    :
    process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID
}
export const LISTING_BOOSTERS = {
    "0-days-boost": {
        days: 0,
        price: 0
    },
    "7-days-boost": {
        days: 7,
        price: 4.99
    },
    "30-days-boost": {
        days: 30,
        price: 19.99
    }
}

export const RANKS = {
    moderator: 1,
    admin: 2,
    owner: 3,
    engineer: 4
}
export const RANKS_PERMISSIONS = {
    general_messaging: [RANKS.admin, RANKS.owner, RANKS.engineer],
    daily_deals_marking: [RANKS.admin, RANKS.owner, RANKS.engineer]
}

/**
 * The length must be between 3 and 30 characters.
The accepted characters are like you said: a-z A-Z 0-9 dot(.) underline(_).
It's not allowed to have two or more consecutive dots in a row.
It's not allowed to start or end the username with a dot.
 */
export const USERNAME_VALIDITY_REGEX = /^[\w](?!.*?\.{2})[\w.]{1,28}[\w]$/


export const PASSWORD_VALIDITY_TYPES_USED = [
    'minLength8', 'noCharRepeat3', 'maxLength16'
]
export const PASSWORD_VALIDITY_TYPES = {
    minLength6: {
        reg: /^.{6,}$/,
        invalidBool: false,
        error: "PASS_ERROR_MIN_LEN_6"
    },
    minLength8: {
        reg: /^.{8,}$/,
        invalidBool: false,
        error: "PASS_ERROR_MIN_LEN_8"
    },
    minLength16: {
        reg: /^.{16,}$/,
        invalidBool: false,
        error: "PASS_ERROR_MIN_LEN_16"
    },
    maxLength16: {
        reg: /^.{16,}$/,
        invalidBool: true,
        error: "PASS_ERROR_MAX_LEN_16"
    },
    maxLength32: {
        reg: /^.{32,}$/,
        invalidBool: true,
        error: "PASS_ERROR_MAX_LEN_32"
    },
    noCharRepeat3: {
        reg: /(.)\1{2,}/,
        invalidBool: true,
        error: "PASS_ERROR_REPEAT_3"
    },
    noCharRepeat5: {
        reg: /(.)\1{4,}/,
        invalidBool: true,
        error: "PASS_ERROR_REPEAT_5"
    },
    noCharRepeat8: {
        reg: /(.)\1{7,}/,
        invalidBool: true,
        error: "PASS_ERROR_REPEAT_8"
    },
    alphaNumeric: {
        reg: /^[^\p{L}\p{Nd}]+$/,
        invalidBool: true,
        error: "PASS_ERROR_A_Z_NUM"
    },
    alphaNumericBothCase: {
        reg: /^[^\p{Ll}\p{Lu}\p{N}]+$/,
        invalidBool: true,
        error: "PASS_ERROR_A_Z_NUM_BOTH_CASE"
    },
    specialChars: {
        reg: /[!@#$%^&*~()_+\-=\[\]{};':"\\|,.<>\/?]+/,
        invalidBool: false,
        error: "PASS_ERROR_SPECIAL_CHARS"
    },

}