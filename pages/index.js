//import PropTypes from 'prop'
import Head from 'next/head'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import HomeTab from '../components/home/HomeTab'
import { PRODUCTS_PER_PAGE, THEME, TITLE_SEPARATOR } from '../utils/constants'
import PageBody from '../components/PageBody'
import LoadingView from '../components/LoadingView'
import { useEffect, useState } from 'react'
import { API_OPTIONS } from './api/[...v1]'
import { STATUS_CODES } from '../api'
import { getSession } from 'next-auth/client'
import { Box, Button, Flex, HStack, Text, VStack } from '@chakra-ui/react'
import Products from '../components/home/Products'
import CosmoboxCats from '../components/CosmoboxCats'
import ImageView from '../views/ImageView'
import Link from '../views/Link'
import SiteAd from '../components/home/SiteAd'

const Home = ({cats, posts, viewer}) => {
  const { t, lang } = useTranslation('home')
  const router = useRouter()

  const [catsState, setCatsState] = useState(cats || [])
  const [postsState, setPostsState] = useState(posts) 
  const [viewerState, setViewerState] = useState(viewer)

  //update cats
  useEffect(() => {
    setCatsState(cats)
  }, [cats])
  //update posts
  useEffect(() => {
    setPostsState(posts)
  }, [posts])
  //update viewer
  useEffect(() => {
    setViewerState(viewer)
  }, [viewer])


  if (!catsState || !postsState) {
    return(
        <div>
            <Head>
                <title>{t('common:site-desc')} {TITLE_SEPARATOR} {t('header:site-name')}</title>
            </Head>
            <PageBody navType={PageBody.vars.NAV_TYPES.home}>
                <LoadingView />
            </PageBody>
        </div>
    )
  }

  console.log("CATS::", catsState)
  return (
    <div>
      <Head>
        <title>{t('common:site-desc')} {TITLE_SEPARATOR} {t('header:site-name')}</title>
      </Head>
      <PageBody navType={PageBody.vars.NAV_TYPES.home} className="m-0 p-0 w-100 mw-100 h-100">
        <Flex position="relative" direction={{base: "column", md: "row"}} w="100%" h="100%" pt={{base: "60px", md: "0px"}}>
          <Box pt={{base: "0px", md: "16px"}} position="relative" w={{md: "305px"}} maxW={{md: "25%"}} h="100%">
            <CosmoboxCats cats={catsState} />
          </Box>
          <Box p="5" pt="16px" w={{base: "100%", md: "75%"}} ml={{base: 0, md: "2rem"}} h="100%">
            <SiteAd />
            <Box mt="30px" mb="12px" fontSize="20px" fontWeight="bold" lineHeight="1.4em" color="#4f4f4f">
              {t('trending-listings')}
            </Box>
            <Products products={postsState} viewer={viewerState} />
          </Box>
        </Flex>
      </PageBody>
    </div>
  )
}

export default Home

export const getServerSideProps = async ({ params, req, locale, query }) => {
  const Sequelize = require("sequelize")
  const getDb = require('../database/get-db')
  const DB = getDb(API_OPTIONS.database)
  
  var props = {}
  var redirect = null

  const { Cat, SubCat, Product, User, Review, UserList } = getTables(API_OPTIONS.database, ["Cat", "SubCat", "Product", "User", "Review", "UserList"], locale, API_OPTIONS.defaultLocale)
  try {
    //select the current cat is the current category the user want to see its products or more 
    //of its products
    var currentCat = params?.cat
    var currentCatId
    var noCats = query.no_cats
    console.log("CH_:", currentCat, params)
    //get cats along with subcats
    var cats = []
    if(!noCats) {
      Cat.hasMany(SubCat, {foreignKey: 'cat_id'})
      SubCat.belongsTo(Cat, {foreignKey: 'cat_id'})
      cats = await Cat.findAll({
        include: [{
            model: SubCat
        }],
        order: [
          ['weight', 'DESC'],
          ['name', 'ASC']
        ]
      }) || []

      if(!currentCat) {
        currentCat = cats[0].text_id
        currentCatId = cats[0].id
      }
     
    }
    
    
    var viewer = null
    //get the viewer id
    var userId
    const session = await getSession({req})
    var user = session?.user || {}
    userId = user?.id
    viewer = {id: user.id, image: user.image}

    //get the products of the current cat
    var posts = []
    var page = query?.page || 1
    if(page < 1) page = 1
    var offset = (page - 1) * PRODUCTS_PER_PAGE

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
        ORDER BY \`products\`.\`flash_last_update\` DESC, boosterExpiry DESC, updatedAt DESC LIMIT ?, ?
    ) AS \`products\` 
    LEFT OUTER JOIN \`cats\` ON \`products\`.\`cat\` = \`cats\`.\`id\`
    LEFT OUTER JOIN \`subcats\` ON \`products\`.\`subcat\` = \`subcats\`.\`id\`
    LEFT OUTER JOIN \`nextauth_users\` AS \`seller\` ON \`products\`.\`sellerId\` = \`seller\`.\`id\` 
    LEFT OUTER JOIN \`reviews\` AS \`reviews\` ON \`products\`.\`id\` = \`reviews\`.\`product_id\` 
    LEFT OUTER JOIN (SELECT \`product_id\` FROM  \`user_lists\` WHERE \`removed\` = 0 AND \`user_id\` = ?) AS \`user_lists\` ON \`user_lists\`.\`product_id\` = \`products\`.\`id\`
    GROUP BY id ORDER BY \`flash_last_update\` DESC, boosterExpiry DESC, updatedAt DESC
    `
    var products = await DB.query(query, {
      replacements: [offset, PRODUCTS_PER_PAGE, viewer?.id || -1],
      raw: true, 
      type: Sequelize.QueryTypes.SELECT,
      model: Product,
      mapToModel: true
    })

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
        props = JSON.parse(JSON.stringify(
          {
            cats: cats,
            posts: products,
            viewer: viewer
          }
        ))
        console.log("PROPSZ:", props)
        return {
            props: props
        }
    }
      
  } catch(e) {
      console.log("CATZ::E", "SERVER_ERROR", e)
      return {
          redirect: {
              destination: `/errors/${STATUS_CODES.INTERNAL_SERVER_ERROR}`,
              permanent: false,
          }
      }
  }
}
