import SiteData, { FILE_TOOLS, okResponse, serverErrorResponse, STATUS_CODES } from '../../api/index'
import Endpoint from "../../api/endpoint"
import i18n from '../../i18n'
import { buildProductLink, createChatId, notSet } from '../../utils/functions'
import { formRules, formRulesKeys } from '../../hooks/form-rules'
import { CURRENCY_CODE, DB_PHOTOS_SEPERATOR, IMAGE_DIMENSIONS_SEPERATOR, IMAGE_FILENAME_AND_DIMENSIONS_SEPERATOR, LISTING_BOOSTERS, RANKS, RANKS_PERMISSIONS, USERLINK_PREFIX, USERNAME_VALIDITY_REGEX } from '../../utils/constants'

import getConfig from 'next/config'
import getDb from '../../database/get-db'
import { verify } from '../../z-pay/webhook-events'
//import dbRun from '../../z-states'
const Sequelize = require("sequelize")

const path = require('path')

const REQUIRE_SESSION_ERROR = "common:AUTH_REQUIRED"

const staticPath = (staticFilePath) => {
    return path.join(getConfig().serverRuntimeConfig.STATIC_PATH, staticFilePath)
}

if(process.env.NODE_ENV === 'production') {
    console.log = () => {}
}

const ERROR_KEYS = {
    missingTranslations: 'messages:missing-translations',
    errorMessageToSelf: 'common:message-to-self',
    forbidden: 'common:action-not-allowed',
    productIdRequired: 'common:no-product-id',
    productNotFound: 'common:product-not-found',
    followedRequired: 'common:no-followed-id',
    invalidProductId: 'common:invalid-product-id',
    toIdRequired: 'common:no-to-id',
    toIdNotFound: 'common:receiver-not-found',
    userIdEmpty: "common:user-id-empty",
    usernameAlreadyExist: 'common:username-already-exist',
    serverError: 'common:server-error',
    fileTooLarge: 'common:files-too-large'
}

const DEBUG = true
export const API_OPTIONS = {
    ranking: {
        ranks: RANKS,
        permissions: RANKS_PERMISSIONS
    },
    database: {
        host: process.env.DB_HOST,
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        pass: process.env.DB_PASS
    },
    debug: DEBUG,
    locales: i18n.locales,
    defaultLocale: i18n.defaultLocale,
    endpoints: [
        Endpoint.PostJson({
            id: 'paypal-payment',
            requiredTables: ['PayPal', 'Product'],
            expectedData: "all",
            expectedHeaders: "all",
            respond: async ({expectedData, expectedHeaders, tables}) => {
                const Sequelize = require("sequelize");
                const { PayPal, Product } = tables
                var webhookId = process.env.NODE_ENV === "production"? 
                process.env.PAYPAL_LIVE_WEBHOOK_ID : process.env.PAYPAL_SANDBOX_WEBHOOK_ID

                //console.log("paypal-payment:", "expectedData", expectedData)
                //console.log("paypal-payment:", "expectedHeaders", expectedHeaders)
                //console.log("paypal-payment:", "webhookId", webhookId)

                if(!expectedData || !expectedHeaders) {
                    return Promise.resolve({
                        status: STATUS_CODES.BAD_REQUEST,
                        data: {status: "failed", error: "provide-headers-and-body"}
                    })
                }

                var eventType = expectedData.event_type
                var resource = expectedData.resource

                var captureStatus = resource?.status || ""

                if(eventType != "PAYMENT.CAPTURE.COMPLETED" || !resource.final_capture || !captureStatus || captureStatus != "COMPLETED") {
                    return Promise.resolve({
                        data: { status: "ok", message: "not-paid" }
                    })
                }
                
                try {
                    var isValid = await verify(expectedHeaders, expectedData, webhookId, null, true)
                    if(isValid) {
                        console.log("paypal-payment:", "ok")
                        var captureId = resource?.id || ""
                        var captureAmount = resource?.amount?.value || 0
                        var captureCurrency = resource?.amount?.currency_code || ""
                        var captureCreatedAt = resource?.create_time || "";

                        //check if client as saved the capture and update the product with the package purchase
                        const clientCapture = await PayPal.findOne({
                            where: {captureId: captureId}
                        })
                        
                        var boosterDays = 0
                        Object.values(LISTING_BOOSTERS).forEach(value => {
                            if(parseFloat(String(value.price)) == parseFloat(String(captureAmount))) {
                                boosterDays = value.days
                            }
                        });
                        
                        if(clientCapture && !clientCapture.consumed && boosterDays > 0) {
                            //delete the capture and assign the product with the top ads package
                            const product = await Product.findOne({
                                where: {id: clientCapture.productId}
                            })

                            if(product) {
                                var boosterExpiry = new Date(product.boosterExpiry)
                                var currentDate = new Date()
                                var referencePoint = boosterExpiry.getTime() > currentDate.getTime()? boosterExpiry : currentDate
                                referencePoint.setDate(referencePoint.getDate() + boosterDays)
                                product.update({boosterExpiry: referencePoint})
                                .then(result => {
                                    clientCapture.update({consumed: true})
                                    .catch(e => {
                                        console.log("paypal-payment:", "ok", "paypal-consumed", e)
                                    })
                                })
                                .catch(e => {
                                    console.log("paypal-payment:", "ok", "prod-update", e)
                                    
                                })
                                return Promise.resolve({
                                    data: { status: "ok", message: "paid" }
                                })

                            } else {
                                return Promise.resolve({
                                    data: { status: "ok", message: "will-counsume" }
                                })
                            }

                        } else if(!clientCapture) {
                            //save the capture
                            PayPal.create({
                                captureId: captureId, 
                                amountValue: captureAmount, 
                                amountCurrency: captureCurrency, 
                                capturedAt: captureCreatedAt, 
                                fromWebhook: true,
                            })
                            .catch(e => {
                                console.log("paypal-payment:", "ok", "paypal-create", e)
                                
                            })
                            return Promise.resolve({
                                data: { status: "ok", message: "paid-save" }
                            })

                        } else {
                            return Promise.resolve({
                                data: { status: "ok", message: "already-consumed" }
                            })

                        }

                    } else {
                        console.log("paypal-payment:", "failed")
                        return Promise.resolve({
                            status: STATUS_CODES.BAD_REQUEST,
                            data: { status: "failed" }
                        })
                    }

                } catch(error) {
                    console.log("paypal-payment:", "error", error)
                    return Promise.resolve({
                        status: error?.response?.httpStatusCode,
                        data: error?.response
                    })
                } 
            }
        }),
        Endpoint.Get({
            id: 'cats',
            cors: [],
            requiredTables: ['Cat'],
            respond: async ({tables}) => {
                const { Cat } = tables

                const response = await Cat.findAll({
                    offset: 1,
                    order: [
                        ['weight', 'DESC'],
                        ['name', 'ASC']
                    ]
                })
                if (response) {
                    // If status field is not provided, 200 will be returned
                    return Promise.resolve({
                        data: response
                    })
                } else {
        
                    return Promise.resolve({
                        status: STATUS_CODES.BAD_REQUEST,
                        data: response
                    })
                }
            }
        }),
        Endpoint.Get({
            id: 'subcats',
            cors: [],
            expectedData: {
                cat_id: {
                    required: 'empty-cat-id', clean: data => {
                        if(isNaN(data) || parseInt(data) < 0) return {error: 'invalid-cat-id'}
                        return {value: parseInt(data)}

                    }, requirementFallbacks: {
                        cat_text_id: {
                            clean: data => {
                                if(!isNaN(data) || data.length == 0 || !/[a-z0-9-]+/.test(data)) return {}
                                return {value: data.trim()}
                            }
                        }
                    }
                }
            },
            requiredTables: ['SubCat', 'Cat'],
            respond: async ({expectedData, tables}) => {
                const { SubCat, Cat } = tables
                
                // Add logic here to return a response from the data supplied
                if(!notSet(expectedData.cat_id)) {
                    const response = await SubCat.findAll({
                        where: {
                            cat_id: expectedData.cat_id
                        }
                    })
                    if (response) {
                    // If status field is not provided, 200 will be returned
                    return Promise.resolve({
                        data: response
                    })
                } else {
        
                    return Promise.resolve({
                        status: 403,
                        data: response
                    })
                }

                } else {
                    const catResponse = await Cat.findOne({
                        where: {
                            text_id: expectedData.cat_id.fallback.value
                        }
                    })
                    const response = await SubCat.findAll({
                        where: {
                            cat_id: catResponse.id
                        }
                    })
                    if (response) {
                        // If status field is not provided, 200 will be returned
                        return Promise.resolve({
                            data: response
                        })
                    } else {
            
                        return Promise.resolve({
                            status: 403,
                            data: response
                        })
                    }
                }
            }
        }),
        Endpoint.Get({
            id: 'countries',
            cors: [],
            requiredTables: ['Country'],
            respond: async ({tables}) => {
                const { Country } = tables

                const response = await Country.findAll({
                    where: {
                        country_id: 107
                    }
                })
                if (response) {
                    // If status field is not provided, 200 will be returned
                    return Promise.resolve({
                        data: response
                    })
                } else {
        
                    return Promise.resolve({
                        status: 403,
                        data: response
                    })
                }
            }
        }),
        Endpoint.Get({
            id: 'cities',
            cors: [],
            expectedData: {
                state_id: {
                    required: 'empty-state-id', clean: data => {
                        if(isNaN(data) || parseInt(data) < 1) return {error: 'invalid-state-id'}
                        return {value: parseInt(data)}

                    }
                }
            },
            requiredTables: ['City'],
            respond: async ({expectedData, tables}) => {
                console.log("cleanedData", expectedData)
                const { City } = tables
                
                // Add logic here to return a response from the data supplied
                if(!notSet(expectedData.state_id)) {
                    const response = await City.findAll({
                        where: {
                            state_id: expectedData.state_id
                        }
                    })
                    if (response) {
                    // If status field is not provided, 200 will be returned
                    return Promise.resolve({
                        data: response
                    })
                } else {
        
                    return Promise.resolve({
                        status: 403,
                        data: response
                    })
                }

                } else {
                    const catResponse = await Cat.findOne({
                        where: {
                            text_id: expectedData.cat_id.fallback.value
                        }
                    })
                    const response = await SubCat.findAll({
                        where: {
                            cat_id: catResponse.id
                        }
                    })
                    if (response) {
                        // If status field is not provided, 200 will be returned
                        return Promise.resolve({
                            data: response
                        })
                    } else {
            
                        return Promise.resolve({
                            status: 403,
                            data: response
                        })
                    }
                }
            }
        }),
        Endpoint.Get({
            id: 'product-edit-details',
            cors: [],
            expectedData: {
                id: {
                    required: ERROR_KEYS.productIdRequired, clean: data => {
                        if(isNaN(data) || parseInt(data) < 1) return {error: ERROR_KEYS.productIdRequired}
                        return {value: parseInt(data)}

                    }
                }
            },
            sessionRequired: true,
            requiredTables: ['Product'],
            respond: async ({session, expectedData, tables}) => {
                const Sequelize = require("sequelize");
                console.log("product-edit-details:", expectedData, session?.user)
                const { Product } = tables
                
                var product = await Product.findOne({
                    where: Sequelize.and(
                        {id: expectedData.id},
                        {seller_id: session.user.id}
                    )
                })
                if(!product) {
                    return Promise.resolve({
                        status: STATUS_CODES.NOT_FOUND,
                        data: {error: ERROR_KEYS.productNotFound}
                    })
                }
                return Promise.resolve({
                    data: product
                })
            }
        }),
        Endpoint.UploadFileAndJson({
            id: 'upload-profile-photo',
            cors: [],
            sessionRequired: REQUIRE_SESSION_ERROR,
            expectedFiles: {
                fileOp: {
                    rename: ({noExtFilename, filePath}) => {
                        var sizeOf = require('image-size');
                        var dimensions = sizeOf(filePath);
                        return `${noExtFilename}${IMAGE_FILENAME_AND_DIMENSIONS_SEPERATOR}${dimensions.width}${IMAGE_DIMENSIONS_SEPERATOR}${dimensions.height}`
                    }
                },
                required: formRules[formRulesKeys.ProfileSettings].photos.required,
                min: [1, 'min-photos'],//the same as required: just here for reference purpose
                max: formRules[formRulesKeys.ProfileSettings].photos.maxLength,
                maxFileSize: [1024 * 1024 * 10, ERROR_KEYS.fileTooLarge],//size in bytes,//max od 10mb per file
                uploadDir: staticPath("uploads/profile"),
                mimes: formRules[formRulesKeys.ProfileSettings].photos.validTypes
            },
            requiredTables: ['User'],
            respond: async ({session, tables, expectedFiles}) => {
                const {User } = tables
                
                var userId = session?.user.id

                if(!notSet(userId)) {
                    //update user profile photo here
                    console.log("expectedFiles:", expectedFiles)
                    return User.findOne({
                        where: {id: userId}
                    })
                    .then(u => {
                        var prevImage = u?.image
                        return u.update({image: `/uploads/profile/${expectedFiles[0].filename}`})
                        .then(r => {
                            if(prevImage && prevImage.length > 0) {
                                try {
                                    FILE_TOOLS.deleteEngine([`public${prevImage}`])
                                    console.log("FileDelete:OK", `public${prevImage}`)

                                } catch (e) {
                                    console.log("FileDelete:ERROR", `public${prevImage}`, e)
                                }
                            }
                            return Promise.resolve({
                                data: {
                                    status: "ok"
                                }
                            })
    
                        })
                        .catch(e => {
                            return Promise.resolve({
                                status: STATUS_CODES.INTERNAL_SERVER_ERROR,
                                data: {
                                    error: ERROR_KEYS.serverError 
                                }
                            })
                        })
                    })
                    .catch(e => {
                        return Promise.resolve({
                            status: STATUS_CODES.INTERNAL_SERVER_ERROR,
                            data: {
                                error: ERROR_KEYS.serverError 
                            }
                        })
                    })

                } else {
                    return Promise.resolve({
                        status: STATUS_CODES.BAD_REQUEST,
                        data: {
                            error: ERROR_KEYS.userIdEmpty 
                        }
                    })
                }
            }
        }),
        Endpoint.PostJson({
            id: 'remove-profile-photo',
            cors: [],
            sessionRequired: REQUIRE_SESSION_ERROR,
            requiredTables: ['User'],
            respond: async ({session, tables}) => {
                const {User } = tables
                
                var userId = session?.user.id

                if(!notSet(userId)) {
                    //update user profile photo here
                    return User.findOne({
                        where: {id: userId}
                    })
                    .then(u => {
                        var prevImage = u?.image
                        return u.update({image: ""})
                        .then(r => {
                            if(prevImage && prevImage.length > 0) {
                                try {
                                    FILE_TOOLS.deleteEngine([`public${prevImage}`])
                                    console.log("FileDelete:OK", `public${prevImage}`)

                                } catch (e) {
                                    console.log("FileDelete:ERROR", `public${prevImage}`, e)
                                }
                            }
                            return Promise.resolve({
                                data: {
                                    status: "ok"
                                }
                            })
    
                        })
                        .catch(e => {
                            return Promise.resolve({
                                status: STATUS_CODES.INTERNAL_SERVER_ERROR,
                                data: {
                                    error: ERROR_KEYS.serverError 
                                }
                            })
                        })
                    })
                    .catch(e => {
                        return Promise.resolve({
                            status: STATUS_CODES.INTERNAL_SERVER_ERROR,
                            data: {
                                error: ERROR_KEYS.serverError 
                            }
                        })
                    })

                } else {
                    return Promise.resolve({
                        status: STATUS_CODES.BAD_REQUEST,
                        data: {
                            error: ERROR_KEYS.userIdEmpty 
                        }
                    })
                }
            }
        }),
        Endpoint.PostJson({
            id: 'update-profile',
            cors: [],
            sessionRequired: REQUIRE_SESSION_ERROR,
            expectedData: {
                name: {
                    clean: data => {
                        if(data.length < formRules[formRulesKeys.ProfileSettings].name.minChar[0]) {
                            return {error: formRules[formRulesKeys.ProfileSettings].name.minChar[1]}

                        } else if(data.length > formRules[formRulesKeys.ProfileSettings].name.maxChar[0]) {
                            return {error: formRules[formRulesKeys.ProfileSettings].name.maxChar[1]}

                        }
                        return {value: data.trim()}

                    }
                },
                username: {
                    clean: data => {
                        if(data.length > formRules[formRulesKeys.ProfileSettings].username.maxChar[0]) {
                            return {error: formRules[formRulesKeys.ProfileSettings].username.maxChar[1]}

                        }
                        if(data.trim().startsWith(USERLINK_PREFIX) || !(USERNAME_VALIDITY_REGEX.test(data.trim()))) {
                            return {error: formRules[formRulesKeys.ProfileSettings].username.others}
                        }
                        return {value: data.trim()}

                    }
                },
                bio: {
                    clean: data => {
                        if(data.length > formRules[formRulesKeys.ProfileSettings].bio.maxChar[0]) {
                            return {error: formRules[formRulesKeys.ProfileSettings].bio.maxChar[1]}

                        }
                        return {value: data.trim()}

                    }
                },
                telephone: {
                    clean: data => {
                        if(data.length > formRules[formRulesKeys.ProfileSettings].telephone.maxChar[0]) {
                            return {error: formRules[formRulesKeys.ProfileSettings].telephone.maxChar[1]}

                        }
                        return {value: data.trim()}

                    }
                },
            },
            requiredTables: ['User'],
            respond: async ({session, expectedData, tables}) => {
                const {User } = tables
                
                var userId = session?.user.id

                if(!notSet(userId)) {
                    //update user profile here
                    console.log("ProfileData: ", expectedData)
                    var form = {}
                    var hasUpdate = false
                    var username
                    for(const [key, value] of Object.entries(expectedData)) {
                        if(value && value.length > 0) {console.log("ProfileData:Fin", key,value)
                            
                            if(key == "username") {
                                hasUpdate = true
                                username = value

                            } else {
                                hasUpdate = true
                                form[key] = value
                            }
                        }
                    }

                    if(hasUpdate) {
                        if(username) {
                            const usernameCheck = await User.findOne({
                                where: {username: username}
                            })

                            if(usernameCheck && usernameCheck.id != userId) {
                                return Promise.resolve({
                                    status: STATUS_CODES.BAD_REQUEST,
                                    data: {
                                        errors: {
                                            username: ERROR_KEYS.usernameAlreadyExist
                                        } 
                                    }
                                })

                            } else if(!usernameCheck) {
                                form.username = username
                            }
                        }

                        console.log("ProfileData:F", form)
                        try {
                            User.update(form, {
                                where: {
                                    id: userId
                                }
                            })

                        } catch(e) {
                            console.log("ProfileData: E", e)
                        }

                        return Promise.resolve({
                            data: {
                                status: "pending"
                            }
                        })

                    } else {

                        return Promise.resolve({
                            data: {
                                status: "no-change"
                            }
                        })
                    }

                } else {
                    return Promise.resolve({
                        status: STATUS_CODES.BAD_REQUEST,
                        data: {
                            error: ERROR_KEYS.userIdEmpty 
                        }
                    })
                }
            }
        }),
        Endpoint.PostJson({
            id: 'update-follow',
            cors: [],
            sessionRequired: REQUIRE_SESSION_ERROR,
            expectedData: {
                followed: {
                    required: ERROR_KEYS.followedRequired,
                    clean: data => {
                        if(isNaN(data) || parseInt(data) < 0) return {error: ERROR_KEYS.followedRequired}
                        return {value: parseInt(data)}
                    }
                }
            },
            requiredTables: ['User', 'Follow'],
            respond: async ({session, expectedData, tables}) => {
                const {User, Follow } = tables
                
                var userId = session?.user.id

                if(!notSet(userId) || expectedData.followed == userId) {
                    User.findOne({
                        where: {id: expectedData.followed}
                    })
                    .then(u => {
                        if(u) {
                            Follow.findOne({
                                where: Sequelize.and(
                                    {followed: expectedData.followed},
                                    {follower: userId}
                                )
                            })
                            .then(f => {
                                if(!f) {
                                    Follow.create({followed: expectedData.followed, follower: userId})

                                } else {
                                    //delete follower
                                    Follow.destroy({
                                        where: Sequelize.and(
                                            {followed: expectedData.followed},
                                            {follower: userId}
                                        )
                                    })
                                }
                            })

                        }
                    })
                    .catch(e => {
                        if(DEBUG) {
                            console.log("UserList:", "productFind", e)
                        }
                    })
                    return Promise.resolve({
                        data: {
                            status: "pending"
                        }
                    })

                } else {
                    return Promise.resolve({
                        status: STATUS_CODES.BAD_REQUEST,
                        data: {
                            error: ERROR_KEYS.userIdEmpty 
                        }
                    })
                }
            }
        }),
        Endpoint.PostJson({
            id: 'daily-deal',
            cors: [],
            sessionRequired: REQUIRE_SESSION_ERROR,
            expectedData: {
                product_id: {
                    required: ERROR_KEYS.productIdRequired,
                    clean: data => {
                        if(isNaN(data) || parseInt(data) < 0) return {error: ERROR_KEYS.productIdRequired}
                        return {value: parseInt(data)}
                    }
                }
            },
            requiredTables: ['Product'],
            respond: async ({session, expectedData, tables}) => {
                const {Product } = tables
                
                var userId = session?.user.id
                

                RANKS_PERMISSIONS.daily_deals_marking.includes()
                if(!notSet(userId)) {
                    if(!RANKS_PERMISSIONS.daily_deals_marking.includes(session.user.rank)) {
                        return Promise.resolve({
                            status: STATUS_CODES.FORBIDDEN,
                            data: {
                                error: ERROR_KEYS.forbidden
                            }
                        })
                    }
                    Product.findOne({
                        where: {id: expectedData.product_id}
                    })
                    .then(p => {
                        const db = getDb(API_OPTIONS.database)
                        p.update({is_flash: !p.is_flash, flash_last_update: db.fn("NOW")})
                        .then(result => {
                            console.log("DailyDeal:", "result")

                        })
                        .catch(e => {
                            console.log("DailyDeal:", "resultError", e)
                        })
                    })
                    .catch(e => {
                        if(DEBUG) {
                            console.log("DailyDeal:", "productFind", e)
                        }
                    })
                    return Promise.resolve({
                        data: {
                            status: "pending"
                        }
                    })

                } else {
                    return Promise.resolve({
                        status: STATUS_CODES.BAD_REQUEST,
                        data: {
                            error: ERROR_KEYS.userIdEmpty 
                        }
                    })
                }
            }
        }),
        Endpoint.PostJson({
            id: 'update-list',
            cors: [],
            sessionRequired: REQUIRE_SESSION_ERROR,
            expectedData: {
                product_id: {
                    required: ERROR_KEYS.productIdRequired,
                    clean: data => {
                        if(isNaN(data) || parseInt(data) < 0) return {error: ERROR_KEYS.productIdRequired}
                        return {value: parseInt(data)}
                    }
                }
            },
            requiredTables: ['Product', 'UserList'],
            respond: async ({session, expectedData, tables}) => {
                const {Product, UserList } = tables
                
                var userId = session?.user.id

                if(!notSet(userId)) {
                    Product.findOne({
                        where: {id: expectedData.product_id}
                    })
                    .then(p => {
                        if(p) {
                            UserList.findOne({
                                where: Sequelize.and(
                                    {product_id: expectedData.product_id},
                                    {user_id: userId}
                                )
                            })
                            .then(l => {
                                if(!l) {
                                    //if user has not added the product to their list, add it
                                    UserList.create({product_id: expectedData.product_id, user_id: userId})

                                } else {
                                    //if they have, toggle the removed column
                                    l.update({removed: !l.removed})
                                }
                            })

                        }
                    })
                    .catch(e => {
                        if(DEBUG) {
                            console.log("UserList:", "productFind", e)
                        }
                    })
                    return Promise.resolve({
                        data: {
                            status: "pending"
                        }
                    })

                } else {
                    return Promise.resolve({
                        status: STATUS_CODES.BAD_REQUEST,
                        data: {
                            error: ERROR_KEYS.userIdEmpty 
                        }
                    })
                }
            }
        }),
        Endpoint.PostJson({
            id: 'update-review',
            cors: [],
            sessionRequired: REQUIRE_SESSION_ERROR,
            expectedData: {
                product_id: {
                    required: ERROR_KEYS.productIdRequired,
                    clean: data => {
                        if(isNaN(data) || parseInt(data) < 0) return {error: ERROR_KEYS.productIdRequired}
                        return {value: parseInt(data)}
                    }
                },
                rating: {
                    required: formRules[formRulesKeys.SingleProduct].rating.required,
                    clean: data => {
                        if(isNaN(data)) return {error: formRules[formRulesKeys.SingleProduct].rating.required}
                        if(parseInt(data) < formRules[formRulesKeys.SingleProduct].rating.minValue[0]) return {error: formRules[formRulesKeys.SingleProduct].rating.minValue[1]}
                        if(parseInt(data) > formRules[formRulesKeys.SingleProduct].rating.maxValue[0]) return {error: formRules[formRulesKeys.SingleProduct].rating.maxValue[1]}
                        return {value: parseInt(data)}
                    }
                },
                text: {
                    defaultValue: "",
                    clean: data => {
                        if(data.length > formRules[formRulesKeys.SingleProduct].text.maxChar[0]) {
                            return {error: formRules[formRulesKeys.SingleProduct].text.maxChar[1]}

                        }
                        return {value: data.trim()}
                    }
                }
            },
            requiredTables: ['Product', 'Review'],
            respond: async ({session, expectedData, tables}) => {
                const {Product, Review } = tables

                if(expectedData.text.length == 0) expectedData.text = null
                
                var userId = session?.user.id

                if(!notSet(userId)) {
                    Product.findOne({
                        where: {id: expectedData.product_id}
                    })
                    .then(p => {
                        if(p) {
                            Review.findOne({
                                where: Sequelize.and(
                                    {product_id: expectedData.product_id},
                                    {writer_id: userId}
                                )
                            })
                            .then(r => {
                                if(!r) {
                                    //if user has not added the product to their list, add it
                                    Review.create({product_id: expectedData.product_id, writer_id: userId, rating: expectedData.rating, text: expectedData.text || "", has_text: expectedData.text && expectedData.text.length > 0})

                                } else {
                                    //if they have, toggle the removed column
                                    r.update({rating: expectedData.rating || r.rating, text: expectedData.text || r.text, has_text: expectedData.text && expectedData.text.length > 0? true : r.has_text})
                                }
                            })

                        }
                    })
                    .catch(e => {
                        if(DEBUG) {
                            console.log("UserReview:", "productFind", e)
                        }
                    })
                    return Promise.resolve({
                        data: {
                            status: "pending"
                        }
                    })

                } else {
                    return Promise.resolve({
                        status: STATUS_CODES.BAD_REQUEST,
                        data: {
                            error: ERROR_KEYS.userIdEmpty 
                        }
                    })
                }
            }
        }),
        Endpoint.PostJson({
            id: 'message',
            cors: [],
            sessionRequired: REQUIRE_SESSION_ERROR,
            expectedData: {
                is_general: {
                    defaultValue: false,
                    clean: data => {
                        if(!(typeof data === "boolean") && (isNaN(data) || parseInt(data) != 1)) return {value: false}
                        if(!isNaN(data) && parseInt(data) == 1) data = true
                        return {value: data}
                    }
                },
                to_id: {
                    required: ERROR_KEYS.toIdRequired,
                    clean: data => {
                        if(isNaN(data) || parseInt(data) < 0) return {error: ERROR_KEYS.toIdRequired}
                        return {value: parseInt(data)}
                    }
                },
                product_id: {
                    defaultValue: -1,
                    clean: data => {
                        if(isNaN(data)) return {error: ERROR_KEYS.invalidProductId}
                        return {value: parseInt(data)}
                    }
                },
                message: {
                    required: formRules[formRulesKeys.SingleProduct].message.required,
                    clean: data => {
                        if(!data.defaultMsg || data.defaultMsg.length == 0) return {error: formRules[formRulesKeys.SingleProduct].message.required}
                        if(data.defaultMsg.length < formRules[formRulesKeys.SingleProduct].message.minChar[0]) {
                            return {error: formRules[formRulesKeys.SingleProduct].message.minChar[1]}

                        }
                        if(data.defaultMsg.length > formRules[formRulesKeys.SingleProduct].message.maxChar[0]) {
                            return {error: formRules[formRulesKeys.SingleProduct].message.maxChar[1]}

                        }
                        const { locales } = i18n
                        const returnData = { text: data.defaultMsg }
                        locales.forEach(l => {
                            if(data[l]) {
                                if(data[l].length > formRules[formRulesKeys.SingleProduct].message.maxChar[0]) {
                                    return {error: formRules[formRulesKeys.SingleProduct].message.maxChar[1]}
        
                                } else {
                                    returnData[`text_${l}`] = data[l]
                                }
                                
                            }
                        })
                        return {value: returnData}
                    }
                }
            },
            requiredTables: ['Product', 'Message', 'User'],
            respond: async ({session, expectedData, tables}) => {
                const {Product, Message, User } = tables
                
                var userId = session?.user.id
                try {
                if(!notSet(userId)) {
                    if(expectedData.is_general) {
                        console.log("MSG:_", "IS_GEN", expectedData)
                        if(!RANKS_PERMISSIONS.general_messaging.includes(session.user.rank)) {
                            return Promise.resolve({
                                status: STATUS_CODES.FORBIDDEN,
                                data: {
                                    error: ERROR_KEYS.forbidden 
                                }
                            })

                        } else {
                            const { locales, defaultLocale } = i18n
                            var cancelMessage = false
                            for(var i = 0; i < locales.length; i++) {
                                var l = locales[i]
                                if(l != defaultLocale && !expectedData.message[`text_${l}`]) {
                                    //general message must contain every locale translations
                                    //if one is missing the message won't be sent
                                    cancelMessage = true
                                    break
                                    
                                }
                            }
                            if(cancelMessage) {
                                console.log("Message:C", session.user, expectedData)
                                return Promise.resolve({
                                    status: STATUS_CODES.BAD_REQUEST,
                                    data: {
                                        error: ERROR_KEYS.missingTranslations 
                                    }
                                })
                            }
                        }

                    } else {
                        if(userId == expectedData.to_id) {
                            return Promise.resolve({
                                status: STATUS_CODES.BAD_REQUEST,
                                data: {
                                    error: ERROR_KEYS.errorMessageToSelf 
                                }
                            })
                        }
                        //make sure the receiver exists
                        const to = await User.findOne({
                            where: {id: expectedData.to_id}
                        })
                        if(!to) {
                            return Promise.resolve({
                                status: STATUS_CODES.BAD_REQUEST,
                                data: {
                                    error: ERROR_KEYS.toIdNotFound 
                                }
                            })
                        }
                    }
                    
                    var chatId = createChatId(userId, expectedData.to_id, expectedData.is_general)
                    var data = {
                        chat_id: chatId,
                        is_general: expectedData.is_general? 1 : 0
                    }
                    if(expectedData.product_id > -1) {
                        Product.findOne({
                            where: {id: expectedData.product_id}
                        })
                        .then(p => {

                            data = {
                                ...data,
                                text: expectedData.message.text, 
                                product_id: p? expectedData.product_id : -1, 
                                from_id: userId, 
                                to_id: expectedData.to_id
                            }
                            for(const [key, value] of Object.entries(expectedData.message)) {
                                data[key] = value
                            }
                            Message.create(data)
                            .then(m => {})
                            .catch(e => {
                                console.log("MSG:_C1", e)
                            })
                        })
                        .catch(e => {
                            if(DEBUG) {
                                console.log("MSG:_e", "productFind", e)
                            }
                        })

                        return Promise.resolve({
                            data: {
                                status: "pending"
                            }
                        })
                    } else {
                        data = {
                            ...data,
                            text: expectedData.message.text, 
                            product_id: -1, 
                            from_id: userId, 
                            to_id: expectedData.to_id
                        }
                        for(const [key, value] of Object.entries(expectedData.message)) {
                            data[key] = value
                        }
                        Message.create(data)
                        .then(m => {})
                        .catch(e => {
                            console.log("MSG:_C2", e)
                        })

                        return Promise.resolve({
                            data: {
                                status: "pending"
                            }
                        })
                    }

                } else {
                    console.log("Message:C1", session.user, expectedData)
                    return Promise.resolve({
                        status: STATUS_CODES.BAD_REQUEST,
                        data: {
                            error: ERROR_KEYS.userIdEmpty 
                        }
                    })
                }} catch(e) {console.log("MSG:_EE", e)}
            }
        }),
        Endpoint.UploadFileAndJson({
            id: 'product-create',
            cors: [],
            sessionRequired: REQUIRE_SESSION_ERROR,
            expectedFiles: {
                fileOp: {
                    rename: ({noExtFilename, filePath}) => {
                        var sizeOf = require('image-size');
                        var dimensions = sizeOf(filePath);
                        return `${noExtFilename}${IMAGE_FILENAME_AND_DIMENSIONS_SEPERATOR}${dimensions.width}${IMAGE_DIMENSIONS_SEPERATOR}${dimensions.height}`
                    }
                },
                required: formRules[formRulesKeys.sell].photos.required,
                min: [1, 'min-photos'],//the same as required: just here for reference purpose
                max: formRules[formRulesKeys.sell].photos.maxLength,
                maxFileSize: [1024 * 1024 * 10, ERROR_KEYS.fileTooLarge],//size in bytes,//max od 10mb per file
                uploadDir: staticPath("uploads"),
                mimes: formRules[formRulesKeys.sell].photos.validTypes
            },
            expectedData: {
                paypal: {},
                title: {
                    required: formRules[formRulesKeys.sell].title.required, clean: data => {
                        if(data.length < formRules[formRulesKeys.sell].title.minChar[0]) {
                            return {error: formRules[formRulesKeys.sell].title.minChar[1]}

                        } else if(data.length > formRules[formRulesKeys.sell].title.maxChar[0]) {
                            return {error: formRules[formRulesKeys.sell].title.maxChar[1]}

                        }
                        return {value: data.trim()}

                    }
                },
                description: {
                    defaultValue: "",
                    clean: data => {
                        if(data.length > formRules[formRulesKeys.sell].description.maxChar[0]) {
                            return {error: formRules[formRulesKeys.sell].description.maxChar[1]}

                        }
                        return {value: data.trim()}
                    }
                },
                price: {
                    required: formRules[formRulesKeys.sell].price.required,
                    clean: data => {
                        if(isNaN(data)) return {error: formRules[formRulesKeys.sell].price.required}
                        if(parseInt(data) < formRules[formRulesKeys.sell].price.minValue[0]) return {error: formRules[formRulesKeys.sell].price.minValue[1]}
                        if(String(data).length > formRules[formRulesKeys.sell].price.maxDigits[0]) return {error: formRules[formRulesKeys.sell].price.maxDigits[1]}
                        return {value: parseInt(data)}
                    }
                },
                cat: {
                    required: formRules[formRulesKeys.sell].cat.required,
                    clean: data => {
                        if(isNaN(data) || parseInt(data) < formRules[formRulesKeys.sell].cat.minValue[0]) return {error: formRules[formRulesKeys.sell].cat.required}
                        return {value: parseInt(data)}
                    }
                },
                subcat: {
                    required: formRules[formRulesKeys.sell].subcat.required,
                    clean: data => {
                        if(isNaN(data) || parseInt(data) < formRules[formRulesKeys.sell].subcat.minValue[0]) return {error: formRules[formRulesKeys.sell].subcat.required}
                        return {value: parseInt(data)}
                    }
                },
                country:  {
                    required: formRules[formRulesKeys.sell].country.required,
                    clean: data => {
                        if(isNaN(data) || parseInt(data) < formRules[formRulesKeys.sell].country.minValue[0]) return {error: formRules[formRulesKeys.sell].country.minValue[1]}
                        return {value: parseInt(data)}
                    }
                },
                city: {
                    required: formRules[formRulesKeys.sell].city.required,
                    clean: data => {
                        if(isNaN(data) || parseInt(data) < formRules[formRulesKeys.sell].city.minValue[0]) return {error: formRules[formRulesKeys.sell].city.required}
                        return {value: parseInt(data)}
                    }
                },
                booster: {
                    required: formRules[formRulesKeys.sell].booster.required,
                    clean: data => {
                        if(!Object.keys(LISTING_BOOSTERS).includes(data)) {
                            return {error: formRules[formRulesKeys.sell].booster.required}
                        }
                        return {value: data}
                    }
                }
            },
            requiredTables: ['PayPal', 'Product', 'Cat', 'SubCat', 'Country'],
            respond: async ({session, expectedData, tables, expectedFiles}) => {
                const {PayPal, Product, Cat, SubCat, Country } = tables

                console.log("Products:Session", session)
                console.log("Products:Body", expectedData)

                var sellerId = session?.user.id

                if(notSet(sellerId)) {
                    return Promise.resolve({
                        status: STATUS_CODES.INTERNAL_SERVER_ERROR,
                        data: {
                            error: ERROR_KEYS.userIdEmpty 
                        }
                    })

                } else {
                    let catTextId, subCatTextId
                    //check if cat exists
                    const catCheck = await Cat.findOne({
                        where: {id: expectedData.cat}
                    })

                    if(catCheck) {
                        expectedData.subcat = catCheck.no_subcat_placeholder || expectedData.subcat
                        //set needed cat details
                        catTextId = catCheck.text_id
                        //check if subcat exists
                        console.log("SUBCAT_CHECK:", catCheck.no_subcat_placeholder, expectedData.subcat, "catCheck", JSON.parse(JSON.stringify(catCheck)))
                        
                        const subcatCheck = await SubCat.findOne({
                            where: {id: expectedData.subcat}
                        })
                        

                        if(subcatCheck) {
                            console.log("SUBCAT_CHECK:", "sc-check", JSON.parse(JSON.stringify(subcatCheck)))
                            
                            //set needed subcat details
                            subCatTextId = subcatCheck.text_id
                            //check if country exists
                            const countryCheck = await Country.findOne({
                                where: {id: expectedData.country}
                            })

                            if(countryCheck) {
                                //join file names
                                var photos = []
                                expectedFiles.forEach(file => {
                                    photos.push(`/uploads/${file.filename}`)
                                })

                                //add the photos
                                expectedData.photos = photos.join(DB_PHOTOS_SEPERATOR)
                                //add the seller_id
                                expectedData.seller_id = sellerId
                                //add the currency_code
                                expectedData.currency_code = CURRENCY_CODE
                                
                                try {
                                    var product
                                    //paypal start
                                    if(expectedData.paypal && expectedData.paypal.captureId) {
                                        var captureId = expectedData.paypal.captureId || ""
                                        var captureAmount = expectedData.paypal.captureAmount || 0
                                        var captureCurrency = expectedData.paypal.captureCurrency || ""
                                        var captureCreatedAt = expectedData.paypal.captureCreatedAt || "";

                                        delete expectedData.paypal

                                        //check if client as saved the capture and update the product with the package purchase
                                        const clientCapture = await PayPal.findOne({
                                            where: {captureId: captureId}
                                        })

                                        var boosterDays = 0
                                        Object.values(LISTING_BOOSTERS).forEach(value => {
                                            if(parseFloat(String(value.price)) == parseFloat(String(captureAmount))) {
                                                boosterDays = value.days
                                            }
                                        });
                        
                                        if(clientCapture && clientCapture.fromWebhook && !clientCapture.consumed) {
                                            //this means the webhook has been triggered before the client was notified of
                                            //the successfull payment, so this product needs to consume the payment 

                                            //delete the capture and assign the product with the top ads package
                                            var boosterExpiry = new Date()
                                            //var currentDate = new Date()
                                            //var referencePoint = boosterExpiry.getTime() > currentDate.getTime()? boosterExpiry : currentDate
                                            boosterExpiry.setDate(boosterExpiry.getDate() + boosterDays)
                                            
                                            product = await Product.create({...expectedData, ...{boosterExpiry: boosterExpiry}})
                                            clientCapture.update({consumed: true})
                                            .catch(e => {
                                                console.log("product-create:", "ok", "paypal-consumed", e)
                                            })

                                        } else if(!clientCapture) {
                                            //this may mean the webhook is yet to be triggered, so we have to save the
                                            //transaction for this product to consume the transaction 
                                            //when the webhook is trggered
                                            product = await Product.create(expectedData)
                                            //save the capture
                                            PayPal.create({
                                                captureId: captureId, 
                                                amountValue: captureAmount, 
                                                amountCurrency: captureCurrency, 
                                                capturedAt: captureCreatedAt,
                                                productId: product.id
                                            })
                                            .catch(e => {
                                                console.log("paypal-payment:", "ok", "paypal-create", e)
                                                
                                            })

                                        } else {
                                            //this means the payment exist but has already been consumed
                                            product = await Product.create(expectedData)
                                        }
                                    } else {
                                        product = await Product.create(expectedData)
                                    }
                                    //paypal end

                                    if(!product) {
                                        return Promise.resolve({
                                            status: STATUS_CODES.INTERNAL_SERVER_ERROR,
                                            data: {
                                                error: 'product-upload-empty'
                                            }
                                        })

                                    } else {
                                        console.log("Products:", catTextId, subCatTextId, product.title, product)
                                        return Promise.resolve({
                                            data: {
                                                ok: true,
                                                id: product.id,
                                                reviewed: product.reviewed,
                                                link: buildProductLink(product.id, product.title, catTextId, subCatTextId)
                                            }
                                        })
                                    }

                                } catch(e) {console.log("product-create-catch:", e)
                                    return Promise.resolve({status: STATUS_CODES.INTERNAL_SERVER_ERROR,
                                        data: {
                                            error: 'product-create-catch'
                                        }
                                    })
                                }
                                

                            } else {

                                return Promise.resolve({
                                    status: STATUS_CODES.BAD_REQUEST,
                                    data: {
                                        errors: {country: formRules[formRulesKeys.sell].country.required} 
                                    }
                                })
                            }

                        } else {

                            return Promise.resolve({
                                status: STATUS_CODES.BAD_REQUEST,
                                data: {
                                    errors: {subcat: formRules[formRulesKeys.sell].subcat.required} 
                                }
                            })
                        }

                    } else {

                        return Promise.resolve({
                            status: STATUS_CODES.BAD_REQUEST,
                            data: {
                                errors: {cat: formRules[formRulesKeys.sell].cat.required} 
                            }
                        })
                    }
                }
            }
        }),
        Endpoint.PostJson({
            id: 'product-delete',
            cors: [],
            sessionRequired: REQUIRE_SESSION_ERROR,
            expectedData: {
                product_id: {
                    required: ERROR_KEYS.productIdRequired,
                    clean: data => {
                        if(isNaN(data) || parseInt(data) < 0) return {error: ERROR_KEYS.productIdRequired}
                        return {value: parseInt(data)}
                    }
                }
            },
            requiredTables: ['Product'],
            respond: async ({session, expectedData, tables}) => {
                //const Sequelize = require("sequelize");
                const { Product } = tables

                try{
                    console.log("ProductDelete:Body", expectedData)

                    var sellerId = session?.user.id

                    if(notSet(sellerId)) {
                        return Promise.resolve({
                            status: STATUS_CODES.INTERNAL_SERVER_ERROR,
                            data: {
                                error: ERROR_KEYS.userIdEmpty 
                            }
                        })

                    } else {
                        var toDelete = await Product.findOne({
                            where: Sequelize.and(
                                {id: expectedData.product_id},
                                {seller_id: sellerId}
                            )
                        })
                        if(!toDelete) {
                            return Promise.resolve({
                                status: STATUS_CODES.NOT_FOUND,
                                data: {
                                    error: ERROR_KEYS.productNotFound
                                }
                            })
                        }
                        try {
                            //get all the produt photos to delete
                            var photosToDelete = toDelete.photos.split(DB_PHOTOS_SEPERATOR)
                            await Product.destroy({
                                where: {id: expectedData.product_id}
                            })
                            var photosToDeletePaths = []
                            for(var i = 0; i < photosToDelete.length; i++) {
                                photosToDeletePaths.push(`public${photosToDelete[i]}`)
                            }
                            
                            try {
                                FILE_TOOLS.deleteEngine(photosToDeletePaths)

                            } catch (e) {
                                console.log("ProductDeleteFileDelete:", e)
                            }
                            return Promise.resolve({
                                data: {
                                    ok: true
                                }
                            })

                        } catch(e) {
                            return Promise.resolve({
                                status: STATUS_CODES.INTERNAL_SERVER_ERROR,
                                data: {
                                    error: ERROR_KEYS.productNotFound
                                }
                            })
                        }
                    }
                } catch(e) {
                    console.log("ProductDelete:ERR", e)
                    return Promise.resolve({
                        status: STATUS_CODES.INTERNAL_SERVER_ERROR,
                        data: {
                            error: ERROR_KEYS.productNotFound
                        }
                    })
                }
            }
        }),
        Endpoint.UploadFileAndJson({
            id: 'product-edit',
            cors: [],
            sessionRequired: REQUIRE_SESSION_ERROR,
            expectedFiles: {
                fileOp: {
                    rename: ({noExtFilename, filePath}) => {
                        var sizeOf = require('image-size');
                        var dimensions = sizeOf(filePath);
                        return `${noExtFilename}${IMAGE_FILENAME_AND_DIMENSIONS_SEPERATOR}${dimensions.width}${IMAGE_DIMENSIONS_SEPERATOR}${dimensions.height}`
                    }
                },
                max: formRules[formRulesKeys.sell].photos.maxLength,
                maxFileSize: [1024 * 1024 * 10, ERROR_KEYS.fileTooLarge],//size in bytes,//max od 10mb per file
                uploadDir: staticPath("uploads"),
                mimes: formRules[formRulesKeys.sell].photos.validTypes
            },
            expectedData: {
                paypal: {},
                product_id: {
                    required: ERROR_KEYS.productIdRequired,
                    clean: data => {
                        if(isNaN(data) || parseInt(data) < 0) return {error: ERROR_KEYS.productIdRequired}
                        return {value: parseInt(data)}
                    }
                },
                photos: {
                    required: formRules[formRulesKeys.sell].photos.required,
                    clean: data => {
                        console.log("PhotosEdits:Array", "photos", data)
                        if(!Array.isArray(data)) return {error: formRules[formRulesKeys.sell].photos.required}
                        return {value: data}
                    }
                },
                photo_urls_and_files_order: {
                    required: formRules[formRulesKeys.sell].photos.required,
                    clean: data => {
                        if(!Array.isArray(data) || data.length == 0) return {error: formRules[formRulesKeys.sell].photos.required}
                        if(data.length > formRules[formRulesKeys.sell].photos.maxLength[0]) {
                            return {error: formRules[formRulesKeys.sell].photos.maxLength[1]}
                        }
                        var newData = []
                        for(var i = 0; i < data.length; i++) {
                            if(typeof data[i] === "string") {
                                newData.push(data[i])
                            }
                        }
                        if(newData.length == 0) return {error: formRules[formRulesKeys.sell].photos.required}
                        return {value: newData}
                    }
                },
                title: {
                    required: formRules[formRulesKeys.sell].title.required, clean: data => {
                        if(data.length < formRules[formRulesKeys.sell].title.minChar[0]) {
                            return {error: formRules[formRulesKeys.sell].title.minChar[1]}

                        } else if(data.length > formRules[formRulesKeys.sell].title.maxChar[0]) {
                            return {error: formRules[formRulesKeys.sell].title.maxChar[1]}

                        }
                        return {value: data.trim()}

                    }
                },
                description: {
                    defaultValue: "",
                    clean: data => {
                        if(data.length > formRules[formRulesKeys.sell].description.maxChar[0]) {
                            return {error: formRules[formRulesKeys.sell].description.maxChar[1]}

                        }
                        return {value: data.trim()}
                    }
                },
                price: {
                    required: formRules[formRulesKeys.sell].price.required,
                    clean: data => {
                        if(isNaN(data)) return {error: formRules[formRulesKeys.sell].price.required}
                        if(parseInt(data) < formRules[formRulesKeys.sell].price.minValue[0]) return {error: formRules[formRulesKeys.sell].price.minValue[1]}
                        if(String(data).length > formRules[formRulesKeys.sell].price.maxDigits[0]) return {error: formRules[formRulesKeys.sell].price.maxDigits[1]}
                        return {value: parseInt(data)}
                    }
                },
                cat: {
                    required: formRules[formRulesKeys.sell].cat.required,
                    clean: data => {
                        if(isNaN(data) || parseInt(data) < formRules[formRulesKeys.sell].cat.minValue[0]) return {error: formRules[formRulesKeys.sell].cat.required}
                        return {value: parseInt(data)}
                    }
                },
                subcat: {
                    required: formRules[formRulesKeys.sell].subcat.required,
                    clean: data => {
                        if(isNaN(data) || parseInt(data) < formRules[formRulesKeys.sell].subcat.minValue[0]) return {error: formRules[formRulesKeys.sell].subcat.required}
                        return {value: parseInt(data)}
                    }
                },
                country:  {
                    required: formRules[formRulesKeys.sell].country.required,
                    clean: data => {
                        if(isNaN(data) || parseInt(data) < formRules[formRulesKeys.sell].country.minValue[0]) return {error: formRules[formRulesKeys.sell].country.minValue[1]}
                        return {value: parseInt(data)}
                    }
                },
                city: {
                    required: formRules[formRulesKeys.sell].city.required,
                    clean: data => {
                        if(isNaN(data) || parseInt(data) < formRules[formRulesKeys.sell].city.minValue[0]) return {error: formRules[formRulesKeys.sell].city.required}
                        return {value: parseInt(data)}
                    }
                },
                booster: {
                    required: formRules[formRulesKeys.sell].booster.required,
                    clean: data => {
                        if(!Object.keys(LISTING_BOOSTERS).includes(data)) {
                            return {error: formRules[formRulesKeys.sell].booster.required}
                        }
                        return {value: data}
                    }
                }
            },
            requiredTables: ['PayPal', 'Product', 'Cat', 'SubCat', 'Country'],
            respond: async ({session, expectedData, tables, expectedFiles}) => {
                const Sequelize = require("sequelize");
                const {PayPal, Product, Cat, SubCat, Country } = tables

                try{
                    console.log("ProductsEdit:Body", expectedData)
                    console.log("ProductsEdit:Files", expectedFiles)

                    var sellerId = session?.user.id

                    if(notSet(sellerId)) {
                        return Promise.resolve({
                            status: STATUS_CODES.INTERNAL_SERVER_ERROR,
                            data: {
                                error: ERROR_KEYS.userIdEmpty 
                            }
                        })

                    } else {
                        //check if product exists and it belongs to the user
                        var toUpdate = await Product.findOne({
                            where: Sequelize.and(
                                {id: expectedData.product_id},
                                {seller_id: sellerId}
                            )
                        })
                        if(!toUpdate) {
                            return Promise.resolve({
                                status: STATUS_CODES.NOT_FOUND,
                                data: {
                                    error: ERROR_KEYS.productNotFound
                                }
                            })
                        }

                        let catTextId, subCatTextId
                        //check if cat exists
                        const catCheck = await Cat.findOne({
                            where: {id: expectedData.cat}
                        })

                        if(catCheck) {
                            expectedData.subcat = catCheck.no_subcat_placeholder || expectedData.subcat
                            //set needed cat details
                            catTextId = catCheck.text_id
                            //check if subcat exists
                            const subcatCheck = await SubCat.findOne({
                                where: {id: expectedData.subcat}
                            })

                            if(subcatCheck) {

                                //set needed subcat details
                                subCatTextId = subcatCheck.text_id
                                //check if country exists
                                const countryCheck = await Country.findOne({
                                    where: {id: expectedData.country}
                                })

                                var totalPhotoUrlsAndFilesLength = expectedData.photos.length + expectedFiles.length
                                if(countryCheck) {
                                    //check if the maximum files allowed is not exceeded
                                    if(expectedFiles.length > 0 && 
                                        totalPhotoUrlsAndFilesLength > 
                                        formRules[formRulesKeys.sell].photos.maxLength[0]) {
                                        try {
                                            FILE_TOOLS.deleteEngine(expectedFiles)
        
                                        } catch (e) {
                                            console.log("FileDelete:ERROR_EDIT_MAX", e)
                                        }
                                        return Promise.resolve({
                                            status: STATUS_CODES.BAD_REQUEST,
                                            data: {
                                                error: formRules[formRulesKeys.sell].photos.maxLength[1]
                                            }
                                        })
                                    }
                                    
                                    var updatedPhotosUrls = expectedData.photos
                                    //this holds the order of current photo urls to newly uploaded photos file
                                    //e.g [url, file, file, url]
                                    //this will make us keep the order that the user set the newly uploaded
                                    // images(file) to among the previously uploaded images
                                    var photoUrlsAndFilesOrder = expectedData.photo_urls_and_files_order
                                    var currentPhotosUrlsInDb = toUpdate.photos.split(DB_PHOTOS_SEPERATOR)
                                    
                                    //this holds the index of the next photoUrl or fileUrl in each of their
                                    //arrays
                                    var urlsIndex = 0; var filesIndex = 0;
                                    var photos = []
                                    for(var i = 0; i < totalPhotoUrlsAndFilesLength; i++) {
                                        if(photoUrlsAndFilesOrder[i]) {
                                            if(photoUrlsAndFilesOrder[i].toLowerCase() == "url") {
                                                //make sure any provided photo urls is in the db to prevent the 
                                                //the user updating the phots urls with an empty url 
                                                //or a url of an image not belnging to the product
                                                if(updatedPhotosUrls[urlsIndex] && currentPhotosUrlsInDb.includes(updatedPhotosUrls[urlsIndex])) {
                                                    photos.push(updatedPhotosUrls[urlsIndex])
                                                }
                                                urlsIndex++

                                            } else if(photoUrlsAndFilesOrder[i].toLowerCase() == "file") {
                                                if(expectedFiles[filesIndex]) {
                                                    photos.push(`/uploads/${expectedFiles[filesIndex].filename}`)
                                                }
                                                filesIndex++
                                            }
                                        }
                                    }

                                    if(photos.length == 0) {
                                        return Promise.resolve({
                                            status: STATUS_CODES.BAD_REQUEST,
                                            data: {
                                                error: formRules[formRulesKeys.sell].photos.required
                                            }
                                        })

                                    }
                                    //this will hold the array of photos the user has deleted on the client side
                                    //by checking the current photo urls in the db that isn't in the updated photos
                                    //urls
                                    var photosToDelete = []
                                    for(var i = 0; i < currentPhotosUrlsInDb.length; i++) {
                                        if(!photos.includes(currentPhotosUrlsInDb[i])) {
                                            photosToDelete.push(`public${currentPhotosUrlsInDb[i]}`)
                                        }
                                    }

                                    //update the photos

                                    var update = {photos: photos.join(DB_PHOTOS_SEPERATOR)}
                                    update.cat = expectedData.cat
                                    update.subcat = expectedData.subcat
                                    update.country = expectedData.country
                                    update.booster = expectedData.booster
                                    update.city = expectedData.city
                                    update.title = expectedData.title
                                    update.description = expectedData.description
                                    update.price = expectedData.price
                                    
                                    var toUpdateParsed = JSON.parse(JSON.stringify(toUpdate))
                                    if((!expectedData.paypal || !expectedData.paypal.captureId) && JSON.stringify({...toUpdateParsed, ...update}) == JSON.stringify(toUpdateParsed)) {
                                        return Promise.resolve({
                                            data: {
                                                ok: true,
                                                id: toUpdateParsed.id,
                                                reviewed: toUpdateParsed.reviewed,
                                                link: buildProductLink(toUpdateParsed.id, toUpdateParsed.title, catTextId, subCatTextId)
                                            }
                                        }) 
                                    }

                                    //paypal start
                                    if(expectedData.paypal && expectedData.paypal.captureId) {
                                        var captureId = expectedData.paypal.captureId || ""
                                        var captureAmount = expectedData.paypal.captureAmount || 0
                                        var captureCurrency = expectedData.paypal.captureCurrency || ""
                                        var captureCreatedAt = expectedData.paypal.captureCreatedAt || "";

                                        //check if client as saved the capture and update the product with the package purchase
                                        const clientCapture = await PayPal.findOne({
                                            where: {captureId: captureId}
                                        })

                                        var boosterDays = 0
                                        Object.values(LISTING_BOOSTERS).forEach(value => {
                                            if(parseFloat(String(value.price)) == parseFloat(String(captureAmount))) {
                                                boosterDays = value.days
                                            }
                                        });
                        
                                        if(clientCapture && clientCapture.fromWebhook && !clientCapture.consumed) {
                                            //this means the webhook has been triggered before the client was notified of
                                            //the successfull payment, so this product needs to consume the payment 
                                            
                                            //delete the capture and assign the product with the top ads package
                                            var boosterExpiry = new Date(toUpdateParsed.boosterExpiry)
                                            var currentDate = new Date()
                                            var referencePoint = boosterExpiry.getTime() > currentDate.getTime()? boosterExpiry : currentDate
                                            referencePoint.setDate(referencePoint.getDate() + boosterDays)
                                            
                                            update = {...update, ...{boosterExpiry: referencePoint}} 
                                            clientCapture.update({consumed: true})
                                            .catch(e => {
                                                console.log("product-update:1", "catch", "paypal-consumed", e)
                                            })

                                        } else if(!clientCapture) {
                                            //this may mean the webhook is yet to be triggered, so we have to save the
                                            //transaction for this product to consume the transaction 
                                            //when the webhook is trggered
                                            //save the capture
                                            PayPal.create({
                                                captureId: captureId, 
                                                amountValue: captureAmount, 
                                                amountCurrency: captureCurrency, 
                                                capturedAt: captureCreatedAt,
                                                productId: toUpdateParsed.id
                                            })
                                            .catch(e => {
                                                console.log("product-update:", "ok", "paypal-create", e)
                                                
                                            })

                                        } else {
                                            //this means the payment exist but has already been consumed
                                            //product = await Product.create(expectedData)
                                        }
                                    } else {
                                        //product = await Product.create(expectedData)
                                    }
                                    //paypal end

                                    return toUpdate.update(update)
                                    .then(() => {
                                        if(photosToDelete.length > 0) {
                                            try {
                                                FILE_TOOLS.deleteEngine(photosToDelete)
            
                                            } catch (e) {
                                                console.log("FileDelete:ERROR_EDIT_REMOVED", e)
                                            }
                                        }
                                        return Promise.resolve({
                                            data: {
                                                ok: true,
                                                id: toUpdateParsed.id,
                                                reviewed: toUpdateParsed.reviewed,
                                                link: buildProductLink(toUpdateParsed.id, toUpdateParsed.title, catTextId, subCatTextId)
                                            }
                                        })
                                    })
                                    .catch(e => {
                                        return Promise.resolve({
                                            status: STATUS_CODES.INTERNAL_SERVER_ERROR,
                                            data: {
                                                error: 'product-edit-catch'
                                            }
                                        })
                                    })
                                    

                                } else {

                                    return Promise.resolve({
                                        status: STATUS_CODES.BAD_REQUEST,
                                        data: {
                                            errors: {country: formRules[formRulesKeys.sell].country.required} 
                                        }
                                    })
                                }

                            } else {

                                return Promise.resolve({
                                    status: STATUS_CODES.BAD_REQUEST,
                                    data: {
                                        errors: {subcat: formRules[formRulesKeys.sell].subcat.required} 
                                    }
                                })
                            }

                        } else {

                            return Promise.resolve({
                                status: STATUS_CODES.BAD_REQUEST,
                                data: {
                                    errors: {cat: formRules[formRulesKeys.sell].cat.required} 
                                }
                            })
                        }
                    }  
                } catch(e) {
                    console.log("ProductsEdits:", "E", e)
                    return Promise.resolve({
                        status: STATUS_CODES.INTERNAL_SERVER_ERROR,
                        data: {
                            error: 'product-edit-catch'
                        }
                    })
                }
            }
        }),
        Endpoint.PostJson({
            id: 'product-sold-update',
            cors: [],
            sessionRequired: REQUIRE_SESSION_ERROR,
            expectedData: {
                product_id: {
                    required: ERROR_KEYS.productIdRequired,
                    clean: data => {
                        if(isNaN(data) || parseInt(data) < 0) return {error: ERROR_KEYS.productIdRequired}
                        return {value: parseInt(data)}
                    }
                }
            },
            requiredTables: ['Product'],
            respond: async ({session, expectedData, tables}) => {
                const Sequelize = require("sequelize");
                const {Product } = tables
                
                var userId = session?.user.id
                
                if(!notSet(userId)) {
                    
                    Product.findOne({
                        where: Sequelize.and(
                            {id: expectedData.product_id},
                            {seller_id: userId}
                        )
                    })
                    .then(p => {
                        if(p) {
                            p.update({sold_out: !p.sold_out})
                            .then(result => {
                                console.log("SoldUpdate:", "result")

                            })
                            .catch(e => {
                                console.log("SoldUpdate:", "resultError", e)
                            })
                        }
                        
                    })
                    .catch(e => {
                        if(DEBUG) {
                            console.log("SoldUpdate:", "productFind", e)
                        }
                    })
                    return Promise.resolve({
                        data: {
                            status: "pending"
                        }
                    })

                } else {
                    return Promise.resolve({
                        status: STATUS_CODES.BAD_REQUEST,
                        data: {
                            error: ERROR_KEYS.userIdEmpty 
                        }
                    })
                }
            }
        }),
    ]
}

const Data = (req, res) => {
    SiteData(req, res, API_OPTIONS)
}

export const config = {
    api: {
      bodyParser: false,
    },
}
  
export default Data