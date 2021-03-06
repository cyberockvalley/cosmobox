import Router from 'next/router'
import { getSession, signIn } from 'next-auth/client'
import useTranslation from 'next-translate/useTranslation'
import Head from 'next/head'
import { useRouter } from "next/router"
import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { STATUS_CODES } from '../api'
import LoadingView from '../components/LoadingView'
import PageBody from '../components/PageBody'
import Products from '../components/home/Products'
import { NO_USERLINK_ID_PREFIX, TITLE_SEPARATOR, USERLINK_PREFIX, PRODUCTS_PER_PAGE, PROFILE_PHOTO_SIZE_LG } from '../utils/constants'
import { userLink, userName } from '../utils/functions'
import Pagination from '../views/Pagination'
import TextView from '../views/TextView'
import { API_OPTIONS } from './api/[...v1]'
import { useBottomScrollListener } from 'react-bottom-scroll-listener';
import Loading from '../views/Loading'
import { apiPostJson } from '../api/client'
import ImageView from '../views/ImageView'

const NumAbbr = require('number-abbreviate')

const $ = require('jquery')
const SCROLL_OFFSET = 50
const TABS = {
    posts: 0,
    saved: 1
}

const UserProfile = ({loaded, profile, posts, viewer, viewerFollowsProfile, cursor, savedCursor, savedPosts}) => {
    const { t, lang } = useTranslation('profile')
    const router = useRouter()
    const { username } = router.query

    const [loadedState, setLoadedState] = useState(false)
    const [profileState, setProfileState] = useState(profile)
    const [postsState, setPostsState] = useState()
    const [postsStateSaved, setPostsStateSaved] = useState()
    const [cursorState, setCursorState] = useState({totalItems: 1, rowsPerPage: 1, hasMore: true})
    const [cursorStateSaved, setCursorStateSaved] = useState({totalItems: 1, rowsPerPage: 1, hasMore: true})
    const [viewerState, setViewerState] = useState(viewer)
    const [viewerFollowsProfileState, setViewerFollowsProfileState] = useState(viewerFollowsProfile)

    const getSavesState = () => {
        var saves = router?.query?.saves
        if(saves && (isNaN(saves) || parseInt(saves) != 1)) saves = false
        return saves
    }

    var saves = getSavesState()
    const [savesState, setSavesState] = useState(getSavesState())
    

    const [page, setPage] = useState(1)
    const [pageSaved, setPageSaved] = useState(saves? 1 : 0)
    const [loading, setLoading] = useState(false)

    
    const [tab, setTab] = useState(!savesState? TABS.posts : TABS.saved)
    useEffect(() => {
        if(tab == TABS.saved && pageSaved == 0) {
            setPageSaved(pageSaved + 1)
        }
    }, [tab])

    useEffect(() => {
        setSavesState(getSavesState())
        setTab(!getSavesState()? TABS.posts : TABS.saved)

    }, [router])

    //update page
    useEffect(() => {
        if(page > 1) {
            setLoading(true)
            var top = $(window).scrollTop()
            router.push(Pagination.getPageUrl(router, {is_lang_switch: 0, page: page, saves: 0})).then(() => $(window).scrollTop(top + SCROLL_OFFSET))
        }
    }, [page])
    //update page for saves
    useEffect(() => {
        if(pageSaved > 0) {
            setLoading(true)
            var top = $(window).scrollTop()
            router.push(Pagination.getPageUrl(router, {is_lang_switch: 0, page: pageSaved, saves: 1})).then(() => $(window).scrollTop(top + SCROLL_OFFSET))
        }
    }, [pageSaved])

    //update load state
    useEffect(() => {
        setLoadedState(loaded)

    }, [loaded])
    
    //update profile
    useEffect(() => {
        setProfileState(profile)

    }, [profile])

    //update posts
    useEffect(() => {
        if(posts) {
            setPostsState([...(postsState || []), ...(posts || [])])
        }
        setLoading(false)
    }, [posts])

    //update saved posts
    useEffect(() => {
        if(posts) {
            setPostsStateSaved([...(postsStateSaved || []), ...(savedPosts || [])])
        }
        setLoading(false)
    }, [savedPosts])

    //update cursor
    useEffect(() => {
        var totalPages = Math.ceil(cursor?.totalItems / cursor?.rowsPerPage)
        setCursorState({...cursorState, ...cursor, hasMore: totalPages > page })
    }, [cursor])

    //update saved posts cursor
    useEffect(() => {
        var totalPages = Math.ceil(savedCursor?.totalItems / savedCursor?.rowsPerPage)
        setCursorStateSaved({...cursorStateSaved, ...savedCursor, hasMore: totalPages > pageSaved })
    }, [savedCursor])

    //update viewer
    useEffect(() => {
        setViewerState(viewer)
    }, [viewer])

    useEffect(() => {
        setViewerFollowsProfileState(viewerFollowsProfile)
    }, [viewerFollowsProfile])
    
    useEffect(() => {
        const handleRouteChange = (url, { shallow }) => {
            console.log("Route:", lang, url)
        }
    
        router.events.on('routeChangeStart', handleRouteChange)
        
        return () => {
          router.events.off('routeChangeStart', handleRouteChange)
        }
    }, [])

    const scrollRef = useBottomScrollListener(() => {
        console.log('USER:', cursorState, cursorStateSaved, tab)
        if(!loading) {
            if(tab == TABS.posts && cursorState.hasMore) {
                setPage(page + 1)
    
            } else if(tab == TABS.saved && cursorStateSaved.hasMore) {
                setPageSaved(pageSaved + 1)
            }
        }
    }, {offset: SCROLL_OFFSET});

    const abbrNum = num => {
        const units = t('common:num-abbr').split(",")
        return (new NumAbbr(units)).abbreviate(num, 1)
    }

    const message = () => {
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

        } else if(viewerState.id == profile.id) {
            router.push(`/profile/messages/`)

        } else {
            //message here
            router.push(`/profile/messages/${userName(profile.username, profile.id)}`)
        }
    }
    const follow = () => {
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

        } else if(viewerState.id == profile.id) {
            router.push("/profile/settings")

        } else {
            //follow here
            setViewerFollowsProfileState(!viewerFollowsProfile)
            //api
            apiPostJson('update-follow', {followed: profile.id}, lang)
            .then(r => {}).catch(e => {})
        }
    }

    console.log("Profle:", profileState, profile)
    if (!loaded) {
        return(
            <div>
                <Head>
                    <title>{`${t('title')}...`} {TITLE_SEPARATOR} {t('header:site-name')}</title>
                </Head>
                <PageBody navType={PageBody.vars.NAV_TYPES.others}>
                    <LoadingView />
                </PageBody>
            </div>
        )
    }

    return(
        <div>
            <Head>
                <title>{`${profile.name} (${userName(profile.username, profile.id)})`} {TITLE_SEPARATOR} {t('header:site-name')}</title>
            </Head>
            <PageBody navType={PageBody.vars.NAV_TYPES.others} className="m-0 p-0 w-100 mw-100">
                <div className="page-content">
                    <div> 
                        <div className="px-2 d-flex flex-column align-items-center mb-5" style={{border: ''}}>
                            <div className="d-flex justify-content-center align-items-start">
                                <div className="p-1 mr-3 d-flex justify-content-center align-items-center round-div border-3-primary">
                                    <ImageView isDefaultHost className="profile-image-round" width={PROFILE_PHOTO_SIZE_LG} height={PROFILE_PHOTO_SIZE_LG} src={profileState?.image || NO_PROFILE_PIC} />
                                </div>
                                <div className="ml-3 d-flex flex-column align-items-center w-100">
                                    <div className="d-flex flex-column flex-md-row align-md-items-center w-100 p-0 m-0">
                                        <div className="d-flex align-items-center p-1">
                                            <div className="h3 m-0 p-0 mr-3">{userName(profileState.username, profileState.id)}</div>
                                        </div>
                                        <div className="d-flex align-items-center p-1">
                                            <button onClick={message} className={`btn btn-primary mr-3 cap ${viewerState?.id == profile.id? 'd-none' : ''}`}>{t('message')}</button>
                                            <button onClick={follow} className={`btn ${viewerFollowsProfileState || viewerState?.id == profile.id? 'btn-outline-primary' : 'btn-primary' } mr-3`}>{t(viewerState && viewerState.id == profile.id? 'edit-profile' : !viewerFollowsProfileState? 'follow' : 'following')}</button>
                                        </div>
                                    </div>

                                    <div style={{display: 'none'}} className="d-md-flex flex-column align-items-center w-100">
                                        <div style={{display: 'none'}} className="my-3 d-md-flex justify-content-between align-items-center w-100">
                                            <div className="d-flex justify-content-center">
                                                <span className="b-700">
                                                    {abbrNum(profileState?.totalPosts)}
                                                </span>
                                                &nbsp;
                                                <span>{t('posts')}</span>
                                            </div>
                                            <div className="d-flex justify-content-center action">
                                                <span className="b-700">
                                                    {abbrNum(profileState?.totalFollowers)}
                                                </span>
                                                &nbsp;
                                                <span>{t('followers')}</span>
                                            </div>
                                            <div className="d-flex justify-content-center action">
                                                <span className="b-700">
                                                    {abbrNum(profileState?.totalFollowings)}
                                                </span>
                                                &nbsp;
                                                <span>{t('followings')}</span>
                                            </div>
                                        </div>

                                        <div className="h3 m-0 p-0 align-self-start">{profileState.name}</div>
                                        <TextView className="align-self-start">
                                            {profileState.bio}
                                        </TextView>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 d-flex d-md-none flex-column align-self-start align-self-md-center">
                                <div className="h3 m-0 p-0 align-self-start">{profileState.name}</div>
                                <TextView className="align-self-start">
                                    {profileState.bio}
                                </TextView>
                            </div>
                        </div>

                        <div style={{fontSize: '15px'}} className="border-top py-1 d-flex d-md-none justify-content-around align-items-center">
                            <div className="d-flex flex-column justify-content-center align-items-center">
                                <div className="b-700">
                                    {abbrNum(profileState?.totalPosts)}
                                </div>
                                <div>{t('posts')}</div>
                            </div>
                            <div className="d-flex flex-column justify-content-center align-items-center action">
                                <div className="b-700">
                                    {abbrNum(profileState?.totalFollowers)}
                                </div>
                                <div>{t('followers')}</div>
                            </div>
                            <div className="d-flex flex-column justify-content-center align-items-center action">
                                <div className="b-700">
                                    {abbrNum(profileState?.totalFollowings)}
                                </div>
                                <div>{t('followings')}</div>
                            </div>
                        </div>

                        <div className="border-top">
                            <div className="container py-4 px-4 d-flex flex-row justify-content-between align-items-center">
                                <div onClick={() => {setTab(TABS.posts)}} className={`action fa fa-th text-upper ${tab == TABS.posts? '' : 'opacity-2'}`}> {t('posts')}</div>
                                <div onClick={() => {setTab(TABS.saved)}} className={`action fa fa-heart text-upper ${tab == TABS.saved? '' : 'opacity-2'} ${viewer?.id != profile?.id? 'd-none' : ''}`}> {t('saved')}</div>
                            </div>
                        </div>

                        <div className="container">
                            <div style={{minHeight: "100px"}} className={`${tab == TABS.posts? '' : 'd-none'}`}>
                                <Products ref={scrollRef} products={postsState} viewer={viewerState} />
                            </div>
                            <div style={{minHeight: "100px"}} className={`${tab != TABS.saved || viewer?.id != profile?.id? 'd-none' : ''}`}>
                                <Products ref={scrollRef} products={postsStateSaved} viewer={viewerState} />
                            </div>
                            <div className="d-flex flex-column justify-content-center align-items-center">
                                <Loading
                                    type={Loading.TYPES.bars}
                                    color="#fea136"
                                    height={50}
                                    width={50}
                                    visible={loading}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </PageBody>
        </div>
    )
}

export default UserProfile

export async function getServerSideProps({req, params, locale, query}) {
    const { username } = params

    var queryUser = ""
    var queryUserId = null
    if(username.startsWith(USERLINK_PREFIX)) {
        queryUser = username.substring(USERLINK_PREFIX.length)
        if(queryUser.startsWith(NO_USERLINK_ID_PREFIX)) {
            queryUserId = parseInt(queryUser.trim().substring(NO_USERLINK_ID_PREFIX.length))
            queryUser = null
        }
    }

    
    console.log("Profile::::", user, userId)

    const Sequelize = require("sequelize")
    const getDb = require('../database/get-db')
    const DB = getDb(API_OPTIONS.database)
    const getTables = require('../database/get-tables')
    const { User, UserList, Follow, Product } = getTables(API_OPTIONS.database, ['User', 'UserList', 'Follow', 'Product'], locale, API_OPTIONS.defaultLocale)
    
    var props = {}
    var redirect = null

    var viewer = null
    //get the viewer id
    var userId
    const session = await getSession({req})
    var user = session?.user || {}
    userId = user?.id
    if(userId) {
        viewer = {id: user.id, image: user.image}
    }

    try {
        var page = query?.page || 1
        if(page < 1) page = 1
        var offset = (page - 1) * PRODUCTS_PER_PAGE

        var profile = await User.findOne({
            where: queryUser? {username: queryUser} : {id: queryUserId}
        })
        
        if(!profile) {
            props.errorCode = STATUS_CODES.NOT_FOUND

        } else {
            console.log("USERNAME::E_F", profile)
            var totalPosts = await Product.count({
                where: {seller_id: profile.id}
            })
            var totalFollowers = await Follow.count({
                where: {followed: profile.id}
            })
            var totalFollowings = await Follow.count({
                where: {follower: profile.id}
            })
            
            profile = JSON.parse(JSON.stringify(profile))
            profile.totalPosts = totalPosts
            profile.totalFollowers = totalFollowers
            profile.totalFollowings = totalFollowings
            profile.bio = profile.bio

            var viewerFollowsProfile = false
            if(viewer && viewer.id != profile.id) {
                var followCheck = await Follow.findOne({
                    where: Sequelize.and(
                        {follower: viewer.id},
                        {followed: profile.id}
                    )
                })
                if(followCheck) {
                    viewerFollowsProfile = true
                }
            }

            var products = []
            var savedPosts = []
            var saves = query?.saves

            var totalPosts = 0
            var totalPostsSaved = 0

            
            totalPosts = await Product.count({
                where: Sequelize.and(
                    {seller_id: profile.id}
                )
            })
        
            if(viewer && viewer.id == profile.id) {
                totalPostsSaved = await UserList.count({
                    where: Sequelize.and(
                        {user_id: viewer.id},
                        {removed: 0}
                    )
                })
            }
            //saves = true
            if(saves && (isNaN(saves) || parseInt(saves) != 1)) saves = false
            var isLangSwitch = query.is_lang_switch
            if(isLangSwitch && (isNaN(isLangSwitch) || parseInt(isLangSwitch) != 1)) isLangSwitch = false
            if(isLangSwitch) {

            } else if(saves && viewer && viewer.id == profile.id) {
            console.log("USERNAME::FFF", saves)
                if(totalPostsSaved > 0) {
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
                        \`products\`.\`updated_at\` AS \`updatedAt\` FROM \`products\` AS \`products\`
                    ) AS \`products\` 
                    LEFT OUTER JOIN \`cats\` ON \`products\`.\`cat\` = \`cats\`.\`id\`
                    LEFT OUTER JOIN \`subcats\` ON \`products\`.\`subcat\` = \`subcats\`.\`id\`
                    LEFT OUTER JOIN \`nextauth_users\` AS \`seller\` ON \`products\`.\`sellerId\` = \`seller\`.\`id\` 
                    LEFT OUTER JOIN \`reviews\` AS \`reviews\` ON \`products\`.\`id\` = \`reviews\`.\`product_id\` 
                    LEFT OUTER JOIN \`user_lists\` AS \`user_lists\` ON \`user_lists\`.\`product_id\` = \`products\`.\`id\`
                    WHERE \`user_lists\`.\`user_id\` = ${profile.id}
                    AND \`user_lists\`.\`removed\` = 0
                    GROUP BY \`products\`.\`id\` ORDER BY \`products\`.\`updatedAt\` DESC LIMIT ${offset}, ${PRODUCTS_PER_PAGE}
                        `

                    savedPosts = await DB.query(query, {
                        replacements: [],
                        raw: true, 
                        type: Sequelize.QueryTypes.SELECT,
                        model: Product,
                        mapToModel: true
                    }) || []
                    
                }
                

            } else {

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
                    \`products\`.\`updated_at\` AS \`updatedAt\` FROM \`products\` AS \`products\`
                ) AS \`products\` 
                LEFT OUTER JOIN \`cats\` ON \`products\`.\`cat\` = \`cats\`.\`id\`
                LEFT OUTER JOIN \`subcats\` ON \`products\`.\`subcat\` = \`subcats\`.\`id\`
                LEFT OUTER JOIN \`nextauth_users\` AS \`seller\` ON \`products\`.\`sellerId\` = \`seller\`.\`id\` 
                LEFT OUTER JOIN \`reviews\` AS \`reviews\` ON \`products\`.\`id\` = \`reviews\`.\`product_id\` 
                LEFT OUTER JOIN (SELECT \`product_id\` FROM  \`user_lists\` WHERE \`removed\` = 0 AND \`user_id\` = ${viewer?.id || -1}) AS \`user_lists\` ON \`user_lists\`.\`product_id\` = \`products\`.\`id\`
                WHERE \`products\`.\`sellerId\` = ${profile.id}
                GROUP BY \`products\`.\`id\` ORDER BY \`products\`.\`updatedAt\` DESC LIMIT ${offset}, ${PRODUCTS_PER_PAGE}
                    `

                products = await DB.query(query, {
                    replacements: [],
                    raw: true, 
                    type: Sequelize.QueryTypes.SELECT,
                    model: Product,
                    mapToModel: true
                }) || []
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
            props = {
                loaded: true,
                profile: profile,
                viewer: viewer,
                posts: products,
                savedPosts: savedPosts,
                cursor: {totalItems: totalPosts, rowsPerPage: PRODUCTS_PER_PAGE},
                savedCursor: {totalItems: totalPostsSaved, rowsPerPage: PRODUCTS_PER_PAGE},
                viewerFollowsProfile: viewerFollowsProfile
            }
            props = JSON.parse(JSON.stringify(props))
    
            console.log("USERNAME::F", savedPosts.length, savedPosts)
            console.log("USERNAME::FF", products.length, products)
    
            return {
                props: props
            }
        }
        
    } catch (e) {
        console.log("USERBNAME::E", "SERVER_ERROR", e)
        
        return {
            redirect: {
                destination: `/errors/${STATUS_CODES.INTERNAL_SERVER_ERROR}`,
                permanent: false,
            }
        }
    }
}