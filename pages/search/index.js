
import useTranslation from 'next-translate/useTranslation'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Products from '../../components/home/Products'
import LoadingView from '../../components/LoadingView'
import PageBody from '../../components/PageBody'
import { PRODUCTS_PER_PAGE, TITLE_SEPARATOR } from '../../utils/constants'

import { useBottomScrollListener } from 'react-bottom-scroll-listener';
import { API_OPTIONS } from '../api/[...v1]'
import { getSession } from 'next-auth/client'
import Pagination from '../../views/Pagination'
import Loading from '../../views/Loading'
import { getFilterClause } from '../../utils/functions'

const $ = require('jquery')
const SCROLL_OFFSET = 50

export default function Search({filter, posts, cursor, filterTexts, viewer}) {
    const { t, lang } = useTranslation('search')

    const router = useRouter()
    const { s } = router.query

    const [filterTextsState, setFilterTextsState] = useState({})
    const [postsState, setPostsState] = useState() 
    const [cursorState, setCursorState] = useState({totalItems: 1, rowsPerPage: 1, hasMore: true})
    const [viewerState, setViewerState] = useState()

    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)

    //update filter texts
    useEffect(() => {
        setFilterTextsState(filterTexts)

    }, [filterTexts])

    //update page
    useEffect(() => {
        if(page > 1) {
            setLoading(true)
            var top = $(window).scrollTop()
            router.push(Pagination.getPageUrl(router, {is_lang_switch: 0, page: page})).then(() => $(window).scrollTop(top + SCROLL_OFFSET))
        }
    }, [page])

    //update posts
    useEffect(() => {
        console.log("posts:::", posts, postsState)
        if(posts) {
            setPostsState([...(postsState || []), ...posts])
        }
        setLoading(false)
    }, [posts])
    
    //update cursor
    useEffect(() => {
        var totalPages = Math.ceil(cursor?.totalItems / cursor?.rowsPerPage)
        setCursorState({...cursorState, ...cursor, hasMore: totalPages > page })
    }, [cursor])

    //update viewer
    useEffect(() => {
        setViewerState(viewer)
    }, [viewer])

    const scrollRef = useBottomScrollListener(() => {
        //save scroll pos
        console.log("scrollRef:", !loading, cursorState, postsState.length)
        if(!loading && cursorState.hasMore) {
            setPage(page + 1)
        }
    }, {offset: SCROLL_OFFSET});
    

    const getSearchTitle = () => {
        var textKey = []
        var textArgs = {}
        var hasArgs = false
        if(filterTextsState.country) {
            textKey.push("country")
            textArgs.country = filterTextsState.country
            hasArgs = true
        }
        if(filterTextsState.cat && filterTextsState.subcat) {
            textKey.push("cat-and-subcat")
            textArgs.cat = filterTextsState.cat
            textArgs.subcat = filterTextsState.subcat
            hasArgs = true

        } else if(filterTextsState.cat) {
            textKey.push("cat")
            textArgs.cat = filterTextsState.cat
            hasArgs = true

        } else if(filterTextsState.subcat) {
            textKey.push("subcat")
            textArgs.subcat = filterTextsState.subcat
            hasArgs = true
        }
        if(filterTextsState.s) {
            textKey.push("search")
            textArgs.search = filterTextsState.s
            hasArgs = true
        }
        if(filterTextsState.min_price && filterTextsState.max_price) {
            textKey.push("min-and-max-price")
            textArgs.minPrice = filterTextsState.min_price
            textArgs.maxPrice = filterTextsState.max_price
            hasArgs = true

        } else if(filterTextsState.min_price) {
            textKey.push("min-price")
            textArgs.minPrice = filterTextsState.min_price
            hasArgs = true

        } else if(filterTextsState.max_price) {
            textKey.push("max-price")
            textArgs.maxPrice = filterTextsState.max_price
            hasArgs = true
        }

        if(textKey.length == 0) {
            return ""

        } else {
            textKey = textKey.sort().join("-")
            console.log("TextArgs:", textArgs)
            return hasArgs? t(`filter-${textKey}`, textArgs) : t(`filter-${textKey}`)

        }
    }

    const getSearchHeaderTitle = () => {
        if(!postsState) return `${t('header:search')}...`
        return cursorState.totalItems > 0? `${cursorState.totalItems.toLocaleString(lang)} + ${getSearchTitle()}` : getSearchTitle()
    }

    if (!postsState) {
        return(
            <div>
                <Head>
                    <title>{getSearchHeaderTitle()} {TITLE_SEPARATOR} {t('header:site-name')}</title>
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
                <title>{getSearchHeaderTitle()} {TITLE_SEPARATOR} {t('header:site-name')}</title>
            </Head>
            <PageBody navType={PageBody.vars.NAV_TYPES.others} className="m-0 p-0 w-100 mw-100 h-100 mh-100">
                <div className={`page-content `}>
                    <div className="container">
                        <div className="h1 text-cap text-center mt-3 mb-5">
                            {getSearchTitle()}
                        </div>
                        <div id="products-wrapper">
                            <Products ref={scrollRef} products={postsState} viewer={viewerState} />
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
            </PageBody>
        </div>
    )

}

export async function getServerSideProps({params, query, locale, req}) {
    const Sequelize = require("sequelize")
    const getDb = require('../../database/get-db')
    const DB = getDb(API_OPTIONS.database)
    const getTables = require('../../database/get-tables')
    const { Cat, SubCat, Country } = getTables(API_OPTIONS.database, ['Cat', 'SubCat', 'Country'], locale, API_OPTIONS.defaultLocale)
    
    var props = {}
    var redirect = null

    const group = params?.groups || []
    const filter = {
        country: group[0],
        cat: group[1],
        subcat: group[2],
        searchPhrase: query?.s,
        priceMin: isNaN(query?.price_min)? null : parseFloat(query?.price_min),
        priceMax: isNaN(query?.price_max)? null : parseFloat(query?.price_max)
    }

    var viewer = null
    //get the viewer id
    var userId
    const session = await getSession({req})
    var user = session?.user || {}
    userId = user?.id
    viewer = {id: user.id, image: user.image}

    try {
        var page = query?.page || 1
        if(page < 1) page = 1
        var offset = (page - 1) * PRODUCTS_PER_PAGE

        var filterClauses = ""
        var filterCountTables = ""
        var filterTables = ""
        var filterReplacements = []
        var filterOrder = ""

        var filterTextsGetters = {}

        if(filter.country && filter.country.toLowerCase() != "all") {
            filterClauses = getFilterClause("WHERE", filterClauses, "AND", `\`countries\`.\`sortname\`=?`)
            filterReplacements.push(filter.country.toUpperCase())

            filterTables += `LEFT OUTER JOIN \`countries\` ON \`products\`.\`country\` = \`countries\`.\`id\`\n`
            filterCountTables += `LEFT OUTER JOIN \`countries\` ON \`products\`.\`country\` = \`countries\`.\`id\`\n`

            filterTextsGetters.country = async () => {
                
                const row = await Country.findOne({
                    where: {sortname: filter.country.toUpperCase()}
                }) || {name: null}
                return Promise.resolve(
                    {
                        key: "country",
                        value: row.name
                    }
                )
            }
        }

        if(filter.cat) {
            if(filter.cat.toLowerCase() == "cat-flash-offer") {
                filterClauses = getFilterClause("WHERE", filterClauses, "AND", `\`products\`.\`is_flash\`=1`)

            } else {
                filterClauses = getFilterClause("WHERE", filterClauses, "AND", `\`cats\`.\`text_id\`=?`)
            
                filterReplacements.push(filter.cat.toLowerCase())
            }
            filterCountTables += `LEFT OUTER JOIN \`cats\` ON \`products\`.\`cat\` = \`cats\`.\`id\`\n`

            filterTextsGetters.cat = async () => {
                
                const row = await Cat.findOne({
                    where: {text_id: filter.cat.toLowerCase()}
                }) || {name: null}
                return Promise.resolve(
                    {
                        key: "cat",
                        value: row.name
                    }
                )
            }
        }

        if(filter.subcat) {
            filterClauses = getFilterClause("WHERE", filterClauses, "AND", `\`subcats\`.\`text_id\`=?`)
            filterReplacements.push(filter.subcat.toLowerCase())
            filterCountTables += `LEFT OUTER JOIN \`subcats\` ON \`products\`.\`subcat\` = \`subcats\`.\`id\`\n`
            
            filterTextsGetters.subcat = async () => {
                
                const row = await SubCat.findOne({
                    where: {text_id: filter.subcat.toLowerCase()}
                }) || {name: null}
                return Promise.resolve(
                    {
                        key: "subcat",
                        value: row.name
                    }
                )
            }
        }

        if(filter.searchPhrase) {
            var search = filter.searchPhrase.split(" ")
            var regex = ""
            search.forEach(phrase => {
                regex += phrase + "|"
            });
            regex = regex.substring(0, regex.length - 1)
            filterClauses = getFilterClause("WHERE", filterClauses, "AND", `\`products\`.\`title\` REGEXP ?`)
            filterReplacements.push(regex)

            filterTextsGetters.s = () => {

                return Promise.resolve(
                    {
                        key: "s",
                        value: filter.searchPhrase
                    }
                )
            }
        }

        if(filter.priceMin) {
            filterClauses = getFilterClause("WHERE", filterClauses, "AND", `\`products\`.\`price\` >= ?`)
            filterReplacements.push(filter.priceMin)

            filterTextsGetters.price_min = () => {
                
                
                return Promise.resolve(
                    {
                        key: "price_min",
                        value: filter.priceMin
                    }
                )
            }
        }

        if(filter.priceMax) {
            filterClauses = getFilterClause("WHERE", filterClauses, "AND", `\`products\`.\`price\` <= ?`)
            filterReplacements.push(filter.priceMax)

            filterTextsGetters.price_max = () => {
                
                
                return Promise.resolve(
                    {
                        key: "price_max",
                        value: filter.priceMax
                    }
                )
            }
        }

        filterOrder = getFilterClause("ORDER BY", filterOrder, ",", `boosterExpiry DESC`)
        filterOrder = getFilterClause("ORDER BY", filterOrder, ",", `\`products\`.\`createdAt\` DESC`)

        var isLangSwitch = query.is_lang_switch
        if(isLangSwitch && (isNaN(isLangSwitch) || parseInt(isLangSwitch) != 1)) isLangSwitch = false
        if(!isLangSwitch) {
            var countQuery = `
            SELECT 

            COUNT(\`products\`.\`id\`) AS \`totalResult\`

            FROM  \`products\`
            ${filterCountTables}
            ${filterClauses}
            `

            console.log("FILTER:3", 1, filter)
            console.log("FILTER:3", 2, countQuery)
            console.log("FILTER:3", 4, filterReplacements)

            var total = await DB.query(countQuery, {
                replacements: filterReplacements,
                raw: true, 
                type: Sequelize.QueryTypes.SELECT,
                model: Product,
                mapToModel: true
            })

            total = JSON.parse(JSON.stringify(total))[0].totalResult

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
            ) AS \`products\` 
            LEFT OUTER JOIN \`cats\` ON \`products\`.\`cat\` = \`cats\`.\`id\`
            LEFT OUTER JOIN \`subcats\` ON \`products\`.\`subcat\` = \`subcats\`.\`id\`
            LEFT OUTER JOIN \`nextauth_users\` AS \`seller\` ON \`products\`.\`sellerId\` = \`seller\`.\`id\` 
            LEFT OUTER JOIN \`reviews\` AS \`reviews\` ON \`products\`.\`id\` = \`reviews\`.\`product_id\` 
            LEFT OUTER JOIN (SELECT \`product_id\` FROM  \`user_lists\` WHERE \`removed\` = 0 AND \`user_id\` = ${viewer?.id || -1}) AS \`user_lists\` ON \`user_lists\`.\`product_id\` = \`products\`.\`id\`
            ${filterTables}
            ${filterClauses}
            GROUP BY \`products\`.\`id\` ${filterOrder} LIMIT ${offset}, ${PRODUCTS_PER_PAGE}
                `
            var products = []

            console.log("FILTER:3", 3, query)

            if(total > 0) {
                products = await DB.query(query, {
                    replacements: filterReplacements,
                    raw: true, 
                    type: Sequelize.QueryTypes.SELECT,
                    model: Product,
                    mapToModel: true
                }) || []
            }
        }

        var filterTexts = {}
        var filterTextsPromises = []
        Object.keys(filterTextsGetters).forEach(textGetterKey => {
            filterTextsPromises.push(filterTextsGetters[textGetterKey]())
            filterTexts[textGetterKey] = filterTextsGetters[textGetterKey]() 
        });

        var filterTextsResults = await Promise.all(filterTextsPromises)

        filterTextsResults.forEach(result => {
            filterTexts[result.key] = result.value
        });

        props = {
            filter: filter,
            posts: products,
            cursor: {
                totalItems: total,
                rowsPerPage: PRODUCTS_PER_PAGE
            },
            filterTexts: filterTexts,
            viewer: viewer
        }
        props = JSON.parse(JSON.stringify(props))
        console.log("SEARCH:-E", total, filterTexts)
        return {
            props: props
        }

    } catch(e) {
        console.log("SEARCH::E", "SERVER_ERROR", e)
        return {
            redirect: {
                destination: `/errors/${STATUS_CODES.INTERNAL_SERVER_ERROR}`,
                permanent: false,
            }
        }
    }
}