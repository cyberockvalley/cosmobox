
import useTranslation from 'next-translate/useTranslation'
import Head from 'next/head'
import PageBody from '../components/PageBody'
import { DB_PHOTOS_SEPERATOR, MAX_RATING_STARS, NO_PROFILE_PIC, PROFILE_PHOTO_SIZE_MD, PROFILE_PHOTO_SIZE_SM, RANKS_PERMISSIONS, TITLE_SEPARATOR, RELATED_PRODUCTS_LIMIT } from '../utils/constants'
import Carousel from '../views/carousel/index'
import Link from '../views/Link'

import getTables from '../database/get-tables'
import { API_OPTIONS } from './api/[...v1]'
import { buildProductLink, currencyCodeToSymbol, destroyProductLink, formatMoney, getCurrentPackageDaysLeft, hrefBlank, imageUrlToDimension, notSet, tel, userLink } from '../utils/functions'
import { useRouter } from 'next/router'
import LoadingView from '../components/LoadingView'
import { STATUS_CODES } from '../api'
import TextView from '../views/TextView'
import { useEffect, useState } from 'react'
import { getSession, signIn } from 'next-auth/client'

import StarRatings from 'react-star-ratings'
import InputBox from '../views/InputBox'
import useFormRules, { formFieldSet, formFieldGet, formRulesKeys, getCharsRem, formRules } from '../hooks/form-rules'
import ReactTimeAgo from 'react-time-ago'
import { initTimeAgo } from '../init/init-time-ago'
import Swal from 'sweetalert2'
import { apiPostJson } from '../api/client'
import Telview from '../views/TelView'
import getPageLinks from '../hooks/page-links'
import ImageView from '../views/ImageView'
import { Box, Button, Flex, Heading } from '@chakra-ui/react'
import Products from '../components/home/Products'
import getDb from '../database/get-db'
import Pagination from '../views/Pagination'

initTimeAgo()

const Sequelize = require("sequelize")

const MESSAGE_STATUS = {
    sending: 'sending',
    sent: 'sent',
    none: 'none'
}

export default function SingleProduct({product, userReview, seller, viewer, relatedAds}) {
    const { t, lang } = useTranslation('single-product')
    const router = useRouter()



    const [deleting, setDeleting] = useState(false)
    
    const { single_product } = router.query
    const [ slug ] = useState([...single_product].pop())

    
    const [productState, setProductState] = useState(product)
    const [sellerState, setSellerState] = useState(seller)
    const [viewerState, setViewerState] = useState(viewer)
    const [userReviewState, setUserReviewState] = useState(userReview || {rating: 0, text: ''})

    const [defaultUserReviewText, setDefaultUserReviewText] = useState(userReview?.text || "")
    const [defaultUserRating, setDefaultUserRating] = useState(userReview?.rating || 0)

    const [soldOut, setSoldOut] = useState(product?.sold_out)
    useEffect(() => {
        setSoldOut(product?.sold_out)
    }, [product])

    const [boosterExpiry, setBoosterExpiry] = useState(new Date())

    //update product
    useEffect(() => {
        setProductState(product)
        setBoosterExpiry(new Date(product?.boosterExpiry || (new Date()).toString()))
    }, [product])
    //update seller
    useEffect(() => {
        setSellerState(seller)

    }, [seller])
    //update viewer
    useEffect(() => {
        setViewerState(viewer)

    }, [viewer])
    //update user review
    useEffect(() => {
        setUserReviewState(userReview || {rating: 0, text: ""})
        setDefaultUserReviewText(userReview?.text || "")
        setDefaultUserRating(userReview?.rating || 0)

    }, [userReview])

    const [relatedAdsstate, setRelatedAdsState] = useState(relatedAds)
    useEffect(() => {
        setRelatedAdsState(relatedAds)
    }, [relatedAds])

    const [telShown, setTelShown] = useState(false)
    const [showSaveMessage, setShowSaveMessage] = useState(false)
    const [savedByViewer, setSavedByViewer] = useState(product?.saved_by_viewer)

    const [totalSaves, setTotalSaves] = useState(product?.saves || 0)

    const [ratingError, setRatingError] = useState('')
    const [reviewError, setReviewError] = useState('')
    
    const formRule = useFormRules(formRulesKeys.SingleProduct)

    const [reviewFormShown, setReviewFormShown] = useState(false)
    const [showSent, setShowSent] = useState(false)

    const [message, setMessage] = useState('')
    const [showMessenger, setShowMessenger] = useState(false)
    const [messageError, setMessageError] = useState('')

    const [messageStatus, setMessageStatus] = useState(MESSAGE_STATUS.none)

    const [isFlash, setIsFlash] = useState(product?.is_flash)
    useEffect(() => {
        if(product) {
            setIsFlash(product.is_flash)
        }
    }, [product])

    useEffect(() => {
        if(!viewerState) {
            setReviewError('signin-to-review')
        }
    }, [])

    if (!product || deleting) {
        return(
            <div>
                <Head>
                    <title>{t('common:title-loading')}</title>
                </Head>
                <PageBody navType={PageBody.vars.NAV_TYPES.others}>
                    <LoadingView />
                </PageBody>
            </div>
        )
    }
    
    const save = () => {
        if(!viewerState) {
            Swal.fire({
                text: t('common:require-login-message'),
                icon: 'info',
                showCancelButton: true,
                cancelButtonText: t('common:cancel'),
                confirmButtonText: t('header:sign-in')
            })
            .then(result => {
                if(result.isConfirmed) {
                    signIn()
                }
            })

        } else {
            setTotalSaves(totalSaves + (savedByViewer? -1 : 1))
            setSavedByViewer(!savedByViewer)
            setShowSaveMessage(true)
            setTimeout(() => {
                setShowSaveMessage(false)
            }, 1000);
        
            //api
            apiPostJson('update-list', {product_id: product.id}, lang)
            .then(r => {}).catch(e => {})
        }
    }

    
    var formHasError = false
    const fieldsMap = {
        rating: {
            clearError: () => {
                setRatingError('')
            },
            set: value => {
                setUserReviewState({...userReviewState, rating: value})
            },
            get: () => {
                return formFieldGet(userReviewState.rating, formRule.rating, null, (error, valueLength, expectedLength) => {
                    if(error && error.length > 0) {
                        formHasError = true
                        setRatingError(t(error))
                    }
                })
            },
            setError: error => {
                formHasError = true
                setRatingError(t(error))
            }
        },
        text: {
            clearError: () => {
                setReviewError("")
            },
            set: value => {
                formFieldSet(value, formRule.text, null, newValue => {
                    if(!notSet(newValue)) {
                        setUserReviewState({...userReviewState, text: newValue})
                    }
                })
            },
            get: () => {
                return formFieldGet(userReviewState.text, formRule.text, null, (error, valueLength, expectedLength) => {
                    if(error && error.length > 0) {
                        formHasError = true
                        setReviewError(t(error))
                    }
                })
            },
            setError: error => {
                formHasError = true
                setReviewError(t(error))
            }
        }
    }
    
    const handleChange = e => {
        fieldsMap[e.target.name].set(e.target.value)
    }
    const resetUserReview = () => {
        fieldsMap.text.set(defaultUserReviewText)
    }

    const changeRating = rating => {
        fieldsMap.rating.set(rating)
    }

    
    const showReviewForm = () => {
        setReviewFormShown(true)

    }
    const hideReviewForm = (e, cb) => {
        setTimeout(() => {
            setReviewFormShown(false)
            if(cb) cb()
        }, 0);
    }

    const onSubmit = async e => {
        e.preventDefault()
        if(!viewerState) {
            Swal.fire({
                text: t('common:require-login-message'),
                icon: 'info',
                showCancelButton: true,
                cancelButtonText: t('common:cancel'),
                confirmButtonText: t('header:sign-in')
            })
            .then(result => {
                if(result.isConfirmed) {
                    signIn()
                }
            })

        } else {
        
            formHasError = false
            var form = {}
            for (const [key, value] of Object.entries(fieldsMap)) {
                form[key] = value.clearError()
                var cleaned = await value.get()
                if(cleaned) {
                    form[key] = cleaned
                    
                }
            }
            
            if(!formHasError) {
                var fieldsRemoved = 0
                var toSet = []
                if(form.text == defaultUserReviewText) {
                    fieldsRemoved += 1; delete form.text
                } else {
                    toSet.push(() => setDefaultUserReviewText(form.text))
                }
                if(form.rating == defaultUserRating) {
                    fieldsRemoved += 1;
                } else {
                    toSet.push(() => setDefaultUserRating(form.rating))
                }
                if(fieldsRemoved == 2) return
                setShowSent(true)
                hideReviewForm(null, () => {
                    setShowSent(false)
                })
                console.log("Review:", form, {...form, product_id: product.id})
                apiPostJson('update-review', {...form, product_id: product.id}, lang)
                .then(() => {
                    toSet.forEach(s => {
                        s()
                    });
                    router.replace(router.asPath)
                })
                .catch(e => {console.log("Review:Catch", e)})

            }
        }
    }
    

    const handleMessageChange = e => {
        var msg = e.target.value
        if(msg.length < formRule.message.maxChar[0]) setMessage(msg)
    }

    const showMessengerProxy = show => {
        if(show) {
            setMessageStatus(MESSAGE_STATUS.none)
        }
        setShowMessenger(show)
    }

    var messageHasError = false
    const messageMap = {
        message: {
            clearError: () => {
                setReviewError("")
            },
            set: value => {
                formFieldSet(value, formRule.message, null, newValue => {
                    if(!notSet(newValue)) {
                        setMessage(newValue)
                    }
                })
            },
            get: () => {
                setMessageError("")
                return formFieldGet(message, formRule.message, null, (error, valueLength, expectedLength) => {
                    if(error && error.length > 0) {
                        messageHasError = true
                        setMessageError(error)
                    }
                })
            },
            setError: error => {
                formHasError = true
                setMessageError(error)
            }
        }
    }
    
    const submitMessage = async e => {
        e.preventDefault()
        if(!viewerState) {
            Swal.fire({
                text: t('common:require-login-message'),
                icon: 'info',
                showCancelButton: true,
                cancelButtonText: t('common:cancel'),
                confirmButtonText: t('header:sign-in')
            })
            .then(result => {
                if(result.isConfirmed) {
                    signIn()
                }
            })

        } else {
            messageHasError = false
            var form = {}
            for (const [key, value] of Object.entries(messageMap)) {
                form[key] = value.clearError()
                var cleaned = await value.get()
                if(cleaned) {
                    form[key] = cleaned
                    
                }
            }
            console.log("MSG::", "message", form)
            
            if(!messageHasError) {
                setShowMessenger(false)
                setMessageStatus(MESSAGE_STATUS.sending)
                apiPostJson('message', {message: {defaultMsg: form.message}, to_id: sellerState.id, product_id: product.id}, lang)
                .then(() => {
                    setMessage("")
                    setMessageStatus(MESSAGE_STATUS.sent)
                })
                .catch(({request, response, message}) => {
                    setMessageStatus(MESSAGE_STATUS.none)
                    setShowMessenger(true)
                    if(response.status) {
                        if(response?.data.error) {
                            setMessageError(response.data.error)

                        } else if(response?.data.errors) {
                            //setMessageError(Object.values(response.data.errors)[0])
                            for( const [key, value] of Object.entries(response.data.errors)) {
                                if(messageMap[key]) {
                                    fieldsMap[key].setError(value)
                                }
                            }
                            
                        } else {
                            setMessageError('common:error-try-again')
                        }

                    } else if(request) {
                        setMessageError('common:network-error')

                    } else {
                        setMessageError('common:error-try-again')
                        console.log("apiJson('message')", "message", message)
                    }
                })
            }
        }
    }

    const deleteProduct = () => {
        if(viewerState && viewerState?.id == sellerState?.id) {
            Swal.fire({
                text: t('product-delete-warning'),
                confirmButtonText: t('common:yes'),
                cancelButtonText: t('common:cancel'),
                showCancelButton: true
            })
            .then(result => {
                if(result.isConfirmed) {
                    setDeleting(true)
                    apiPostJson('product-delete', {product_id: product.id}, lang)
                    .then(r => {
                        router.push(getPageLinks(sellerState).profilePageLink)
                    })
                    .catch(({request, response, message}) => {
                        setDeleting(false)
                        if(response.status) {
                            if(response?.data.error) {
                                Swal.fire({
                                    text: response.data.error,
                                    confirmButtonText: t('common:ok'),
                                    cancelButtonText: t('common:ok'),
                                })
        
                            } else if(response?.data.errors) {
                                var errorsText = ""
                                for( const [key, value] of Object.entries(response.data.errors)) {
                                    errorsText += `${t(value)}<br />`
                                }
                                Swal.fire({
                                    html: errorsText,
                                    confirmButtonText: t('common:ok'),
                                    cancelButtonText: t('common:ok'),
                                })
                                
                            } else {
                                setMessageError('common:error-try-again')
                            }
        
                        } else if(request) {
                            Swal.fire({
                                text: t('common:network-error'),
                                confirmButtonText: t('common:ok'),
                                cancelButtonText: t('common:ok'),
                            })
        
                        } else {
                            Swal.fire({
                                text: t('common:error-try-again'),
                                confirmButtonText: t('common:ok'),
                                cancelButtonText: t('common:ok'),
                            })
        
                        }
                    })
                }
            })

        }
    }

    const toggleSold = () => {
        if(viewerState?.id == sellerState.id) {
            if(!soldOut) {
                Swal.fire({
                    text: t('mark-sold-warning'),
                    confirmButtonText: t('common:yes'),
                    cancelButtonText: t('common:cancel'),
                    showCancelButton: true
                })
                .then(result => {
                    if(result.isConfirmed) {
                        apiPostJson("product-sold-update", {product_id: product.id}, lang)
                        .then(r => {
    
                        })
                        .catch(e => {
    
                        })
                        setSoldOut(!soldOut)
                        Swal.fire({
                            text: t('common:action-ok'),
                            confirmButtonText: t('common:ok'),
                            cancelButtonText: t('common:ok'),
                        })
                    }
                })

            } else {
                apiPostJson("product-sold-update", {product_id: product.id}, lang)
                .then(r => {

                })
                .catch(e => {
                    
                })
                setSoldOut(!soldOut)
                Swal.fire({
                    text: t('common:action-ok'),
                    confirmButtonText: t('common:ok'),
                    cancelButtonText: t('common:ok'),
                })
            }
        }

    }

    const toggleDailyDeal = () => {
        if(!RANKS_PERMISSIONS.daily_deals_marking.includes(viewer?.rank)) return
        if(!isFlash) {
            Swal.fire({
                text: t('make-daily-deal-warning'),
                confirmButtonText: t('common:yes'),
                cancelButtonText: t('common:cancel'),
                showCancelButton: true
            })
            .then(result => {
                if(result.isConfirmed) {
                    apiPostJson("daily-deal", {product_id: product.id}, lang)
                    .then(r => {

                    })
                    .catch(e => {

                    })
                    setIsFlash(!isFlash)
                    Swal.fire({
                        text: t('common:action-ok'),
                        confirmButtonText: t('common:ok'),
                        cancelButtonText: t('common:ok'),
                    })
                }
            })

        } else {
            apiPostJson("daily-deal", {product_id: product.id}, lang)
            .then(r => {

            })
            .catch(e => {
                
            })
            setIsFlash(!isFlash)
            Swal.fire({
                text: t('common:action-ok'),
                confirmButtonText: t('common:ok'),
                cancelButtonText: t('common:ok'),
            })
        }
    }

    
    return(
        <div>
            <Head>
                <title>{product.title} {TITLE_SEPARATOR} {t('header:site-name')}</title>
            </Head>
            <PageBody navType={PageBody.vars.NAV_TYPES.others}>
                <div className="page-content">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb" style={{background: 'transparent'}}>
                            <li className="breadcrumb-item">
                                <Link href="/">{t('all-listings')}</Link>
                            </li>
                            <li className="breadcrumb-item">
                                <Link href={`/group/all/${product.cat_text_id}`}>{product.cat_name}</Link>
                            </li>
                            <li className={`breadcrumb-item ${!product.hasSubCats? "d-none" : ""}`}>
                                <Link href={`/group/all/${product.cat_text_id}/${product.subcat_text_id}`}>{product.subcat_name}</Link>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                {product.title}
                            </li>
                        </ol>
                    </nav>

                    <div className="row">
                        <div className="col-md-8">
                            <div className="">
                                <div className="h1">{ product.title }</div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div onMouseEnter={showReviewForm}>
                                        <div className="d-flex align-items-center">
                                            <div>
                                                <StarRatings
                                                    rating={productState.ratingsAvg}
                                                    starRatedColor="#fea136"
                                                    starHoverColor="#fea136"
                                                    starDimension="25px"
                                                    starSpacing="3px"
                                                    numberOfStars={MAX_RATING_STARS}
                                                    name='rating'
                                                />
                                            </div>
                                            { }
                                            {
                                                productState.reviews > 0?
                                                <Link href={`/reviews/${slug}`}>
                                                    ({t('reviews-count', {count: productState.reviews})})
                                                </Link>
                                                :
                                                <div>
                                                    ({t('reviews-count', {count: productState.reviews})})
                                                </div>
                                            }
                                        </div>
                                        <div onMouseLeave={hideReviewForm} className={`card rounded my-3 p-3 ${reviewFormShown? '' : 'd-none'}`} style={{width: 400, maxWidth: '100%', position: 'absolute', zIndex: 10}} >
                                            <InputBox className="mb-1" error={ratingError? t(ratingError) : ''}>
                                                <div className="d-flex align-items-center">
                                                    <div className="mr-2">
                                                        <ImageView isDefaultHost width={PROFILE_PHOTO_SIZE_SM} height={PROFILE_PHOTO_SIZE_SM} className="profile-image-round" src={viewerState?.image || NO_PROFILE_PIC} />
                                                    </div>
                                                    <StarRatings
                                                        rating={userReviewState.rating}
                                                        starRatedColor="#fea136"
                                                        starHoverColor="#ffc996"
                                                        starDimension="15px"
                                                        starSpacing="1px"
                                                        changeRating={viewerState? changeRating : null}
                                                        numberOfStars={MAX_RATING_STARS}
                                                        name='rating'
                                                    />
                                                </div>
                                            </InputBox>
                                            
                                            <form onSubmit={onSubmit}>
                                                <InputBox className="form-group" error={reviewError? t(reviewError) : ''}>
                                                    <textarea rows="4" className={`form-control`} readOnly={notSet(viewerState)} name="text" value={userReviewState.text} onChange={handleChange} placeholder={t('review-placeholder')}></textarea>
                                                    <small class="form-text text-muted">{t('common:chars-remaining', {count: getCharsRem(formRule.text.maxChar[0],  userReviewState.text.length)})}</small>
                                                </InputBox>
                                                <div className="form-group row">
                                                    <div className="col-6">
                                                        <button type="submit" className={`btn btn-success btn-sm text-cap`} disabled={notSet(viewerState)}>{t(showSent? 'review-sent' : 'submit-text')}</button>
                                                    </div>
                                                    <div className={`col-6 d-flex justify-content-end ${!viewerState? 'd-none' : ''}`}>
                                                        <button onClick={resetUserReview} className="btn btn-outline-success btn-sm text-cap">{t('reset-form')}</button>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                    {
                                        !RANKS_PERMISSIONS.daily_deals_marking.includes(viewer?.rank)? null :
                                        <button onClick={toggleDailyDeal} className={`m-1 btn btn-${!isFlash? "outline-" : ""}danger btn-sm text-cap`}>
                                            <>
                                                <span>{t(!isFlash? 'make-daily-deal' : 'unmake-daily-deal')} </span>
                                                <i className="fa fa-bolt"></i>
                                            </>
                                        </button>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="row mb-3">
                        <div className="col-md-8 mb-3">
                            <Carousel className="card rounded" title={product.title} images={product.photos.split(DB_PHOTOS_SEPERATOR)} onDimension={imageUrlToDimension}>
                                {
                                    soldOut?
                                    <div className="card py-2 px-3 d-flex flex-row align-items-center bg-sad">
                                        <div className="fa fa-2x fa-truck pr-2"></div>
                                        <div className="h4 p-0 m-0">{t('sold-out')}</div>
                                    </div>
                                    :null
                                }
                            </Carousel>
                        </div>

                        <div className="col-md-4">
                            <div className="card rounded-bottom">
                                <div className="bg-primary">
                                    <div className="d-flex justify-content-between p-0 m-0">
                                        <div className="d-flex justify-content-center align-items-center">
                                            <div className="h3 m-0 px-3">{currencyCodeToSymbol(product.currency_code)}{formatMoney(product.price, lang, 2)}</div>
                                        </div>
                                        <div onClick={save} className="action d-flex justify-content-center align-items-center p-3 bg-dark c-energy">
                                            <div className={`h3 m-0 pr-2 slide-left ${showSaveMessage? 'show' : ''}`}>{t(savedByViewer? 'saved-feedback' : 'unsaved-feedback')}</div>
                                            <div className={`fa fa-2x fa-heart${savedByViewer? '' : '-o'}`}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex flex-column align-items-center p-3">
                                    <Link className="d-flex flex-column align-items-center" href={userLink(sellerState.username, sellerState.id)}>
                                        <div className="pb-2">
                                            <ImageView isDefaultHost width={PROFILE_PHOTO_SIZE_MD} height={PROFILE_PHOTO_SIZE_MD} className="profile-image-round" src={sellerState.image || NO_PROFILE_PIC} />
                                        </div>
                                        <div className="h3">{sellerState.name}</div>
                                    </Link>

                                    {
                                        sellerState.telephone && sellerState.telephone.length > 0?
                                        <button onClick={!telShown? () => setTelShown(true) : () => tel(sellerState.telephone)} className="col-12 mb-3 btn btn-outline-success btn-lg text-cap">
                                            {telShown? <Telview prefix="+" tel={sellerState.telephone} /> : t('show-tel')}
                                        </button> : null
                                    }
                                    {
                                        viewerState?.id == sellerState.id?
                                        <>
                                            <button onClick={() => router.push(getPageLinks(product.id).sellEditPageLink)} className={`col-12 btn btn-success btn-lg text-cap mb-3`}>
                                                <>
                                                    <span>{t('edit-product')} </span>
                                                    <i className="fa fa-pencil"></i>
                                                </>
                                            </button>
                                            <div className="d-flex justify-content-between w-100">
                                                <button onClick={deleteProduct} className={`fa fa-trash btn btn-danger btn-sm text-cap mb-3`}>
                                                </button>
                                                <button onClick={toggleSold} className={`${!soldOut? "btn-outline-danger" : "btn-danger"} btn btn-sm text-cap mb-3`}>
                                                    <span>{t(!soldOut? 'mark-sold' : 'unmark-sold')} </span>
                                                    <i className="fa fa-truck"></i>
                                                </button>
                                            </div>
                                            <small class="form-text text-muted">{t('common:current-booster', {count: getCurrentPackageDaysLeft(boosterExpiry)})}</small>
                                        </>
                                        :
                                        <div className="w-100 mb-3" messageStatus={messageStatus}>
                                            {
                                                messageStatus != MESSAGE_STATUS.none?
                                                <small className={`text-center m-2 form-text ${messageStatus == MESSAGE_STATUS.sending? 'text-info' : 'text-success'}`}>
                                                    {messageStatus == MESSAGE_STATUS.sending? <i>{t('status-sending-message')}</i> : 'status-sent-message'}
                                                </small> : null
                                            }
                                            <InputBox className={`form-group w-100 ${showMessenger? '' : 'd-none'}`} error={messageError? t(messageError) : ''}>
                                                <textarea rows="4" className={`form-control`} readOnly={notSet(viewerState)} name="message" value={message} onChange={handleMessageChange} placeholder={t('message-placeholder')}></textarea>
                                                <small class="form-text text-muted">{t('common:chars-remaining', {count: getCharsRem(formRule.message.maxChar[0],  message.length)})}</small>
                                            </InputBox>
                                            <button onClick={showMessenger? submitMessage : () => showMessengerProxy(true)} className={`col-12 btn btn-success btn-lg text-cap ${messageStatus != MESSAGE_STATUS.none? 'd-none' : ''}`}>
                                                {
                                                    showMessenger?
                                                    <>
                                                        <span>{t('send-message')} </span>
                                                        <i className="fa fa-send"></i>
                                                    </>
                                                    :
                                                    t('message')
                                                }
                                            </button>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-8">
                            <div className="card d-flex flex-row justify-content-between align-items-center border-bottom border-light rounded-top p-3">
                                <div className="d-flex align-items-center">
                                    <div className="mr-3">
                                        <i className="fa fa-clock-o"></i>
                                        <span>
                                            <span> {t('published')} </span><ReactTimeAgo date={new Date(product?.createdAt)} locale={lang} />
                                        </span>
                                    </div>
                                    <div>
                                        <i className="fa fa-map-marker"></i>
                                        <Link href={getPageLinks(product.country_sortname).countryLink}> {product.country_name}</Link>
                                    </div>
                                </div>

                                <div className="d-flex align-items-center">
                                    <div className="mr-3">
                                        <i className="fa fa-heart"></i>
                                        <span> {(totalSaves).toLocaleString(lang)}</span>
                                    </div>
                                    <div>
                                        <i className="fa fa-eye"></i>
                                        <span> {(product.views || 0).toLocaleString(lang)}</span>
                                    </div>
                                </div>
                            </div>
                            <TextView className="card p-3 lead rounded-bottom">
                                    {product.description}
                            </TextView>
                        </div>
                    </div>
                    <Button as="a" href={Pagination.getPageUrl({asPath: getPageLinks().sellPageLink}, {cat: product.cat, subcat: product.subcat})} 
                    onClick={e => { e.preventDefault()
                        router.push(Pagination.getPageUrl({asPath: getPageLinks().sellPageLink}, {cat: product.cat, subcat: product.subcat}))
                    }} my="4" bg="primary.900" color="primary-font" 
                    _hover={{opacity: "0.7", textDecoration: "none", bg: "primary.900", color: "primary-font"}}>
                        {t('post-related-ad')}
                    </Button>
                    <Flex direction="column" mt="8">
                        <Heading size="md" pb="4">
                            {t('related-ads')}
                        </Heading>
                        <Box w="100%">
                            <Products products={relatedAdsstate} viewer={viewerState} />
                        </Box>
                    </Flex>
                </div>
            </PageBody>
        </div>
    )
}

export async function getServerSideProps({ params, req, locale, res }) {
    const [cat_text_id, subcat_text_id, slug] = params.single_product
    const pageLink = buildProductLink(null, slug, cat_text_id, subcat_text_id)
    const linkShreds = destroyProductLink(pageLink)
    const { Product, Cat, SubCat, User, Country, UserList, View, Review } = getTables(API_OPTIONS.database, ["Product", "Cat", "SubCat", "User", "Country", "UserList", "View", "Review"], locale, API_OPTIONS.defaultLocale)
    
    var id = linkShreds.id
    var props = {}
    var redirect = null
    try {
        var product = await Product.findOne({
            where: {id: linkShreds.id}
        })
        
        if(!product) {
            props.errorCode = STATUS_CODES.NOT_FOUND

        } else {

            var cat = await Cat.findOne({
                where: {id: product.cat}
            })
            if(!cat) {
                props.errorCode = STATUS_CODES.NOT_FOUND

            }

            var subcat = await SubCat.findOne({
                where: {id: product.subcat}
            })
            if(!subcat) {
                props.errorCode = STATUS_CODES.NOT_FOUND

            }

            var relatedAds = []

            var pageLinkChecked = buildProductLink(id, product.title, cat?.text_id || ".", subcat?.text_id || ".")
            
            if(pageLink != pageLinkChecked) {console.log("G:::!", pageLink, pageLinkChecked)
                redirect = pageLinkChecked

            } else  if(!props.errorCode) {console.log("G:::", pageLink, pageLinkChecked)
                //get user
                var seller = await User.findOne({
                    where: {id: product.seller_id}
                })

                //get country
                var country = await Country.findOne({
                    where: {id: product.country}
                })

                //get the viewer id
                var userId
                const session = await getSession({req})
                var user = session?.user || {}
                var viewer = null
                userId = user?.id

                var saved_by_viewer = false
                if(userId) {
                    viewer = {id: user.id, image: user.image, rank: user.rank}
                    //check if user has saved product
                    const productInUserList = await UserList.findOne({
                        where: Sequelize.and(
                            {product_id: product.id},
                            {user_id: userId},
                            {removed: false}
                        )
                    })
                    if(productInUserList) {
                        saved_by_viewer = true
                    }
                }

                //count the total saves
                var saves = await UserList.count({
                    where: Sequelize.and(
                        {product_id: product.id},
                        {removed: false}
                    )
                }) || 0

                //count the total reviews
                var reviews = await Review.count({
                    where: Sequelize.and(
                        {product_id: product.id},
                        {has_text: true}
                    )
                }) || 0
                
                //AVG all ratings
                var ratingsAvgAgg = await Review.findAll({
                    where: {
                        product_id: product.id
                    },
                    attributes: [[Sequelize.fn('AVG', Sequelize.col('rating')), 'avg']],
                    raw: true
                })

                console.log("AVG_R:", ratingsAvgAgg, ratingsAvgAgg[0]?.avg || -1)

                var ratingsAvg = ratingsAvgAgg && ratingsAvgAgg[0].avg? parseFloat(parseFloat(ratingsAvgAgg[0].avg).toFixed(2)) : 0

                //count the total views
                var views = await View.count() || 0
                var userReview = null
                //increase the views if user is signed in and has not viewed it before
                if(userId) {
                    const userView = await View.findOne({
                        where: {viewer_id: userId}
                    })
                    if(!userView) {
                        views += 1
                        View.create({
                            product_id: product.id,
                            viewer_id: userId
                        })
                    }

                    userReview = await Review.findOne({
                        where: Sequelize.and(
                            {product_id: product.id},
                            {writer_id: userId}
                        )
                    })
                    if(userReview) {
                        userReview = {
                            id: userReview.id,
                            rating: userReview.rating,
                            text: userReview.text,
                            has_text: userReview.has_text,
                            createdAt: userReview.createdAt.toString(),
                            updatedAt: userReview.updatedAt.toString()
                        }
                    }
                }

                //Related Ads
                var query = `
                SELECT 

                \`products\`.*, 

                \`cats\`.\`text_id\` AS \`catTextId\`,
                \`subcats\`.\`text_id\` AS \`subcatTextId\`,

                \`seller\`.\`name\` AS \`sellerName\`, \`seller\`.\`username\` AS \`sellerUsername\`, 
                \`seller\`.\`image\` AS \`sellerImage\`, 

                IF(\`user_lists\`.\`product_id\` > 0, true, false) AS \`liked\`,

                COALESCE(AVG(\`reviews\`.\`rating\`), 0) AS \`avgRating\`, 
                COALESCE(COUNT(\`reviews\`.\`rating\`), 0) AS \`totalRatings\` 

                FROM (
                    SELECT \`products\`.\`id\`, \`products\`.\`seller_id\` AS \`sellerId\`, \`products\`.\`cat\`, \`products\`.\`subcat\`, 
                    \`products\`.\`country\`, \`products\`.\`title\`, \`products\`.\`description\`, \`products\`.\`currency_code\`, 
                    \`products\`.\`price\`, \`products\`.\`photos\`, \`products\`.\`reviewed\`, \`products\`.\`sold_out\`, 
                    \`products\`.\`is_flash\`, \`products\`.\`flash_last_update\`, \`products\`.\`created_at\` AS \`createdAt\`, 
                    \`products\`.\`updated_at\` AS \`updatedAt\`, 
                    \`products\`.\`booster_expiry\` AS \`boosterExpiry\` FROM \`products\` AS \`products\` 
                    WHERE \`products\`.\`id\` != ? AND \`products\`.\`cat\` = ? AND \`products\`.\`subcat\` = ? ORDER BY \`products\`.\`updated_at\` DESC LIMIT ?
                ) AS \`products\` 
                LEFT OUTER JOIN \`cats\` ON \`products\`.\`cat\` = \`cats\`.\`id\`
                LEFT OUTER JOIN \`subcats\` ON \`products\`.\`subcat\` = \`subcats\`.\`id\`
                LEFT OUTER JOIN \`nextauth_users\` AS \`seller\` ON \`products\`.\`sellerId\` = \`seller\`.\`id\` 
                LEFT OUTER JOIN \`reviews\` AS \`reviews\` ON \`products\`.\`id\` = \`reviews\`.\`product_id\` 
                LEFT OUTER JOIN (SELECT \`product_id\` FROM  \`user_lists\` WHERE \`removed\` = 0 AND \`user_id\` = ?) AS \`user_lists\` ON \`user_lists\`.\`product_id\` = \`products\`.\`id\`
                GROUP BY id ORDER BY boosterExpiry DESC, updatedAt DESC
                `

                const DB = getDb(API_OPTIONS.database)
                relatedAds = await DB.query(query, {
                    replacements: [product.id, cat.id, subcat.id, RELATED_PRODUCTS_LIMIT, viewer?.id || -1],
                    raw: true, 
                    type: Sequelize.QueryTypes.SELECT,
                    model: Product,
                    mapToModel: true
                })
            }
            
            
        }
        if(props.errorCode) {
            if(props.errorCode == STATUS_CODES.NOT_FOUND) return {notFound: true}
            return {
                redirect: {
                  destination: `/errors/${props.errorCode}`,
                  permanent: false,
                }
            }

        } else if(redirect) {
            return {
                redirect: {
                  destination: redirect,
                  permanent: true,
                }
            }

        } else {

            console.log("RelatedAds:", JSON.parse(JSON.stringify(relatedAds)))
            
            return {
                props: {
                    product: {
                        id: product.id,
                        title: product.title, 
                        description: product.description,
                        price: product.price,
                        currency_code: product.currency_code,
                        cat: product.cat,
                        cat_name: cat.name, 
                        cat_text_id: cat.text_id, 
                        subcat: product.subcat,
                        subcat_text_id: subcat.text_id, 
                        subcat_name: subcat.name,
                        country: product.country,
                        country_name: country.name,
                        country_sortname: country.sortname,
                        photos: product.photos,
                        reviewed: product.reviewed,
                        sold_out: product.sold_out,
                        createdAt: product.createdAt.toString(),
                        updatedAt: product.updatedAt.toString(),
                        saved_by_viewer: saved_by_viewer,
                        saves: saves,
                        views: views,
                        reviews: reviews,
                        ratingsAvg: ratingsAvg,
                        is_flash: product.is_flash,
                        hasSubCats: cat.no_subcat_placeholder > 0? false : true,
                        boosterExpiry: product.boosterExpiry.toString() || (new Date()).toString()
                    },
                    seller: {
                        id: seller.id,
                        name: seller.name,
                        username: seller.username,
                        image: seller.image,
                        telephone: seller.telephone,
                        createdAt: seller.createdAt.toString()
                    },
                    userReview: userReview,
                    viewer: viewer,
                    relatedAds: JSON.parse(JSON.stringify(relatedAds))
                }
            }
        }
        
    } catch(e) {
        console.log("NotFound::", "SERVER_ERROR", viewer, e)
        return {
            redirect: {
                destination: `/errors/${STATUS_CODES.INTERNAL_SERVER_ERROR}`,
                permanent: false,
            }
        }
    }
}