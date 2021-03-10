import useTranslation from "next-translate/useTranslation";
import Head from "next/head";
import PageBody from "../../components/PageBody";
import { MAX_RATING_STARS, MAX_REVIEW_PREVIEW_CHARS, NO_PROFILE_PIC, NO_USERLINK_ID_PREFIX, PAGINATION_RANGE, PROFILE_PHOTO_SIZE_SM, REVIEWS_PER_PAGE, TITLE_SEPARATOR, USERLINK_PREFIX } from "../../utils/constants";

import StarRatings from 'react-star-ratings'
import TextView from "../../views/TextView";
import Pagination from "../../views/Pagination";
import { useEffect, useState } from "react";
import InputBox from "../../views/InputBox";
import { useRouter } from "next/router";
import { buildProductLink, destroyProductLink, formatMoney, notSet, showSignInAlert, userLink } from "../../utils/functions";
import getTables from "../../database/get-tables";
import { API_OPTIONS } from "../api/[...v1]";
import { STATUS_CODES } from "../../api";
import { getSession } from "next-auth/client";
import useFormRules, { formFieldGet, formFieldSet, formRulesKeys, getCharsRem } from "../../hooks/form-rules";
import LoadingView from "../../components/LoadingView";
import { apiPostJson } from '../../api/client'
import EmptyView from "../../components/EmptyView";
import Link from "../../views/Link";
import ImageView from "../../views/ImageView";

const Sequelize = require("sequelize")

export default function ProductReviews({reviews, viewer, userReview, product}) {
    const { t, lang } = useTranslation('reviews')
    const router = useRouter()


    if (!product || !reviews) {
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


    const page = router?.query?.page || 1

    const [reviewsState, setReviewsState] = useState(reviews)
    const [viewerState, setViewerState] = useState(viewer)
    const [userReviewState, setUserReviewState] = useState(userReview || {rating: 0, text: ""})
    const [productState, setProductState] = useState(product)

    const [defaultUserReviewText, setDefaultUserReviewText] = useState(userReview?.text || "")
    const [defaultUserRating, setDefaultUserRating] = useState(userReview?.rating || 0)

    //update reviews
    useEffect(() => {
        setReviewsState(reviews)

    }, [reviews])
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
    //update product
    useEffect(() => {
        setProductState(product)

    }, [product])

    const [edit, setEdit] = useState(false)

    
    const [ratingError, setRatingError] = useState('')
    const [reviewError, setReviewError] = useState('')
    const formRule = useFormRules(formRulesKeys.SingleProduct)
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

    const [reviewFormShown, setReviewFormShown] = useState(false)
    const [showSent, setShowSent] = useState(false)
    const showReviewForm = () => {
        setReviewFormShown(true)

    }
    const hideReviewForm = (e, cb) => {
        setTimeout(() => {
            setReviewFormShown(false)
            if(cb) cb()
        }, 1000);
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
                console.log("Review:", form, {...form, product_id: productState.id})
                apiPostJson('update-review', {...form, product_id: productState.id}, lang)
                .then(() => {
                    toSet.forEach(s => {
                        s()
                    })
                    router.replace(router.asPath)
                })
                .catch(e => {console.log("Review:Catch", e)})

            }
        }
    }
    

    return(
        <div>
            <Head>
                <title>{t('reviews-title', {title: productState.title})} {TITLE_SEPARATOR} {t('header:site-name')}</title>
            </Head>
            <PageBody navType={PageBody.vars.NAV_TYPES.others}>
                <div className="page-content">
                    <div className="container">
                        <div className="card d-flex flex-row align-items-center border-bottom border-light rounded-top p-3">
                            <div onClick={() => router.back()} className="action fa fa-2x fa-arrow-left mr-3"></div>
                            <div className="h3 p-0 m-0 text-cap">{t('customers-feedback')}</div>
                        </div>
                        <div className="card rounded-bottom p-3">
                            <div className="row">
                                <div className="col-md-4 mb-5">
                                    <div className="h4 text-upper pb-3">
                                        {t('product-ratings-count', {count: reviewsState.totalRatings})}
                                    </div>
                                    <div className="p-3 mb-3 bg-light d-flex flex-column justify-content-center align-items-center">
                                        <div className="h1" style={{color: "#fea136"}}>
                                            {formatMoney(reviewsState.ratingsAvg || 0, lang, 1, 1)}/{MAX_RATING_STARS}
                                        </div>
                                        <div className="my-2">
                                            <StarRatings
                                                rating={reviewsState.ratingsAvg}
                                                starRatedColor="#fea136"
                                                starHoverColor="#ffc996"
                                                starDimension="25px"
                                                starSpacing="3px"
                                                numberOfStars={MAX_RATING_STARS}
                                                name='rating'
                                            />
                                        </div>
                                        <div>{t('ratings-count', {count: reviewsState.totalRatings})}</div>
                                    </div>
                                    <div className="h4">
                                        {t('your-rating')}
                                    </div>
                                    <div className={`card rounded my-3 p-3`} style={{width: 400, maxWidth: '100%'}} >
                                        <InputBox className="mb-1" error={ratingError? t(ratingError) : ''}>
                                            <div className="d-flex align-items-center">
                                                <div className="mr-2">
                                                    <ImageView isDefaultHost width={PROFILE_PHOTO_SIZE_SM} height={PROFILE_PHOTO_SIZE_SM} className="profile-image-round" src={viewerState?.image || NO_PROFILE_PIC} />
                                                </div>
                                                <div className={`${viewerState && edit? '' : 'opacity-2'}`}>
                                                    <StarRatings
                                                        rating={userReviewState.rating}
                                                        starRatedColor="#fea136"
                                                        starHoverColor="#ffc996"
                                                        starDimension="15px"
                                                        starSpacing="1px"
                                                        changeRating={viewerState && edit? changeRating : null}
                                                        numberOfStars={MAX_RATING_STARS}
                                                        name='rating'
                                                    />
                                                </div>
                                            </div>
                                        </InputBox>
                                        
                                        <form onSubmit={onSubmit}>
                                            {
                                                viewerState && edit?
                                                <>
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
                                                </>
                                                :
                                                <>
                                                    <TextView style={{fontSize: 14}} className="text-muted" truncate={{length: MAX_REVIEW_PREVIEW_CHARS, moreClass: 'i'}}>
                                                        {userReviewState.text}
                                                    </TextView>
                                                    <button onClick={viewerState? () => setEdit(true) : showSignInAlert(t)} className="btn btn-outline-success btn-sm text-cap">{t(userReviewState.rating > 0? 'edit-review' : 'add-review')}</button>
                                                </>
                                            }
                                        </form>
                                    </div>
                                </div>
                                <div className="col-md-8">
                                    <div className="">
                                        <div className="h4 text-upper pb-3">
                                            {t('product-reviews-count', {count: reviewsState.totalReviews})}
                                        </div>
                                        <div id="reviews">
                                            {
                                                reviewsState.list.length == 0? <EmptyView />
                                                :
                                                reviewsState.list.map((review, index) => {
                                                    return <div className="row" key={review.id}>
                                                        <div className="col-sm-10">
                                                            <Link href={userLink(review.writer.username, review.writer.id)} className="d-flex align-items-center mb-2">
                                                                <ImageView isDefaultHost width={PROFILE_PHOTO_SIZE_SM} height={PROFILE_PHOTO_SIZE_SM} className="profile-image-round" src={review.writer.image || NO_PROFILE_PIC} />
                                                                <div className="text-cap ml-3">
                                                                    {review.writer.name}
                                                                </div>
                                                            </Link>
                                                            <div className="d-flex align-items-center mb-2">
                                                                <StarRatings
                                                                    rating={review.rating}
                                                                    starRatedColor="#fea136"
                                                                    starHoverColor="#ffc996"
                                                                    starDimension="15px"
                                                                    starSpacing="1px"
                                                                    numberOfStars={MAX_RATING_STARS}
                                                                    name='rating'
                                                                />
                                                                <small className="ml-3">
                                                                    {(new Date(review.createdAt)).toLocaleDateString(lang)}
                                                                </small>
                                                            </div>
                                                            <TextView style={{fontSize: 14}} className="text-muted" truncate={{length: MAX_REVIEW_PREVIEW_CHARS, moreText: "Read more", moreClass: 'b i'}}>
                                                                {review.text}
                                                            </TextView>
                                                        </div>
                                                    </div>
                                                })
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <hr />
                            <Pagination placement="center" page={page} range={PAGINATION_RANGE} totalItems={reviewsState.cursor.totalItems} rowsPerPage={reviewsState.cursor.rowsPerPage} />
                        </div>
                    </div>
                </div>
            </PageBody>
            
        </div>
    )
}

export async function getServerSideProps({ params, req, locale, query }) {
    var page = query?.page || 1
    if(page < 1) page = 1
    console.log("ReviewZ:::", page, params)
    const cat_text_id = "1"
    const subcat_text_id = "2"
    const slug = params.product
    var pageLink = buildProductLink(null, slug, cat_text_id, subcat_text_id)
    const linkShreds = destroyProductLink(pageLink)
    pageLink = linkShreds.slug
    const { Product, User, Review } = getTables(API_OPTIONS.database, ["Product", "User", "Review"], locale, API_OPTIONS.defaultLocale)
    
    var props = {}

    var id = linkShreds.id
    var props = {}
    var redirect = null
    console.log("ReviewZ:::a", pageLink, linkShreds)
    try {
        var product = await Product.findOne({
            where: {id: linkShreds.id}
        })
        console.log("ReviewZ:::b", product)
        
        if(!product) {
            props.errorCode = STATUS_CODES.NOT_FOUND
            console.log("ReviewZ:::c")

        } else {

            var pageLinkChecked = destroyProductLink(buildProductLink(id, product.title, ".", ".")).slug
            
            if(pageLink != pageLinkChecked) {console.log("I:::!", pageLink, pageLinkChecked)
                redirect = pageLinkChecked

            } else  if(!props.errorCode) {console.log("I:::", pageLink, pageLinkChecked)
                //get user
                var seller = await User.findOne({
                    where: {id: product.seller_id}
                })

                //get the viewer id
                var userId
                const session = await getSession({req})
                var user = session?.user || {}
                var viewer = null
                userId = user?.id

                var saved_by_viewer = false
                if(userId) {
                    viewer = {id: user.id, image: user.image}
                }

                //count the total ratings
                var ratings = await Review.count({
                    where: Sequelize.and(
                        {product_id: product.id}
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
                    attributes: [[Sequelize.fn('AVG', Sequelize.col('rating')), 'avg']],
                    raw: true
                })

                var ratingsAvg = ratingsAvgAgg? parseFloat(parseFloat(ratingsAvgAgg[0].avg).toFixed(2)) : 0
                var userReviewState = null
                //count the user review
                if(userId) {
                    userReviewState = await Review.findOne({
                        where: Sequelize.and(
                            {product_id: product.id},
                            {writer_id: userId}
                        )
                    })
                    if(userReviewState) {
                        userReviewState = {
                            id: userReviewState.id,
                            rating: userReviewState.rating,
                            text: userReviewState.text,
                            has_text: userReviewState.has_text,
                            createdAt: userReviewState.createdAt.toString(),
                            updatedAt: userReviewState.updatedAt.toString()
                        }
                    }
                }
            }
            
            //select reviews
            var pageResult = []
            var cursor = {totalItems: reviews, rowsPerPage: REVIEWS_PER_PAGE}
            
            var offset = (page - 1) * REVIEWS_PER_PAGE

            var isLangSwitch = query.is_lang_switch
            if(isLangSwitch && (isNaN(isLangSwitch) || parseInt(isLangSwitch) != 1)) isLangSwitch = false
            if(!isLangSwitch && reviews > 0) {
                User.hasMany(Review, {foreignKey: 'writer_id'})
                Review.belongsTo(User, {as: 'writer', foreignKey: 'writer_id'})

                pageResult = await Review.findAll({
                    where: Sequelize.and(
                        {product_id: product.id},
                        {has_text: true}
                    ),
                    include: [{
                        model: User,
                        as: 'writer',
                        attributes: ['id', 'name', 'username', 'image']
                    }],
                    limit: REVIEWS_PER_PAGE, offset: offset,
                    order: [
                        ['createdAt', 'DESC']
                    ]
                })
            }

            //console.log("PageResult:", pageResult)
            
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
            
            return {
                props: {
                    reviews: {
                        list: JSON.parse(JSON.stringify(pageResult)),
                        cursor: cursor,
                        totalRatings: ratings,
                        totalReviews: reviews,
                        ratingsAvg: ratingsAvg
                    },
                    product: {
                        id: product.id,
                        title: product.title
                    },
                    viewer: viewer,
                    userReview: userReviewState
                }
            }
        }
        
    } catch(e) {
        console.log("H:::", "SERVER_ERROR", viewer, e)
        return {
            redirect: {
                destination: `/errors/${STATUS_CODES.INTERNAL_SERVER_ERROR}`,
                permanent: false,
            }
        }
    }

}