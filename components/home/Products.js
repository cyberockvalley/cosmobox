import useTranslation from 'next-translate/useTranslation'
import Masonry, {ResponsiveMasonry} from "react-responsive-masonry"

import styles from '../../styles/Masonry.module.css'
import { DB_PHOTOS_SEPERATOR, MAX_RATING_STARS, NO_PROFILE_PIC, NO_USERLINK_ID_PREFIX, PROFILE_PHOTO_SIZE_XS, USERLINK_PREFIX } from '../../utils/constants'
import { buildProductLink, currencyCodeToSymbol, destroyProductLink, formatMoney, getCurrentPackageDaysLeft, imageUrlToDimension, isClient, userLink } from '../../utils/functions'
import TextView from '../../views/TextView'
import StarRatings from 'react-star-ratings'
import Link from '../../views/Link'
import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'

import { apiPostJson } from '../../api/client'
import EmptyView from '../EmptyView'
import LoadingBalls from '../animations/LoadingBalls'
import LoadingView from '../LoadingView'
import ImageView, { imageSrc } from '../../views/ImageView'
import { Box, Button, Flex, HStack, IconButton, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import BackgroundImage from '../../views/BackgroundImage'
import { StarIcon } from '@chakra-ui/icons'

const PRODUCT_IMAGE_MAX_WIDTH = 600
const PRODUCT_IMAGE_MAX_HEIGHT = 600
const Product = ({ product, viewer }) => {
    const { t, lang } = useTranslation('common')
    const photos = product?.photos?.split(DB_PHOTOS_SEPERATOR)
    const photo = photos[0]
    const dimensions = imageUrlToDimension(photo, PRODUCT_IMAGE_MAX_WIDTH, PRODUCT_IMAGE_MAX_HEIGHT)
    const productLink = buildProductLink(product?.id, product?.title, product?.catTextId, product?.subcatTextId)

    const [liked, setLiked] = useState(product?.liked)

    useEffect(() => {
        setLiked(product.liked)
    }, [product.liked])

    //console.log("PROD:photo", dimensions, photo)
    //console.log("PROD:", product)

    const boosterRem = getCurrentPackageDaysLeft(new Date(product.boosterExpiry) || new Date())
    //console.log("PROD:r", boosterRem)

    const toggleLike = e => {
        e.preventDefault()
        if(!viewer) {
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
            setLiked(!liked)
        
            //api
            apiPostJson('update-list', {product_id: product.id}, lang)
            .then(r => {}).catch(e => {})
        }
    }

    const img1 = (
        <Box bgImage={`url("${imageSrc({src: photo, isDefaultHost: true})}")`}
        bgSize="cover" bgPos="50%" bgRepeat="no-repeat"
        fontSize="16px" lineHeight="24px" fontWeight="700" textAlign="center" 
        alignItems="center" position="relative" 
        _before={{
            content: "''",
            pt: "70%",
            display: "table"
        }}>
            <VStack pos="absolute" left="0" bottom="0" top="0" right="0"
            bgColor="rgba(0,0,0,.2)" justifyContent="space-between" alignItems="flex-start">
                <HStack mt="5%" justifyContent="space-between" alignItems="center" width="100%">
                    <Box opacity={boosterRem > 0? 1 : 0} bg="primary.900" color="#fff" borderTopRightRadius="4px" borderBottomRightRadius="4px" 
                    p="5px" textTransform="uppercase" fontWeight="bold">
                        Top +
                    </Box>

                    <Box opacity={product.is_flash? 1 : 0} borderTopLeftRadius="4px" borderBottomLeftRadius="4px" 
                    p="5px" textTransform="uppercase" fontWeight="bold">
                        <svg style={{ width: "32px", height: "32px", maxWidth: "32px", maxHeight: "32px", fill: "rgb(255, 255, 255)", stroke: "inherit" }}>       
                            <image style={{width: "100%", height: "100%"}} xlinkHref="/res/images/flash.svg" />    
                        </svg>
                    </Box>
                </HStack>
                <Box
                fontSize="10px" lineHeight="1.2em" color="#fff" fontWeight="400" 
                bgColor="rgba(0,0,0,.5)" borderRadius="0 8px 0 0" py="4px" px="8px">
                    {photos.length}
                </Box>
            </VStack>
        </Box>
    )

    const img2 = (
        <BackgroundImage isDefaultHost src={photo}
        bgSize="cover" bgPos="50%" bgRepeat="no-repeat"
        fontSize="16px" lineHeight="24px" fontWeight="700" textAlign="center" 
        alignItems="center" position="relative"
        childrenProps={{_before:{
            content: "''",
            pt: "90%",
            display: "table"
        }}}>
            <VStack pos="absolute" left="0" bottom="0" top="0" right="0"
            bgColor="rgba(0,0,0,.2)" justifyContent="space-between" alignItems="flex-start">
                <HStack mt="5%" justifyContent="space-between" alignItems="center" width="100%">
                    <Box opacity={boosterRem > 0? 1 : 0} bg="primary.900" color="#fff" borderTopRightRadius="4px" borderBottomRightRadius="4px" 
                    p="5px" textTransform="uppercase" fontWeight="bold">
                        Top +
                    </Box>

                    <Box opacity={product.is_flash? 1 : 0} borderTopLeftRadius="4px" borderBottomLeftRadius="4px" 
                    p="5px" textTransform="uppercase" fontWeight="bold">
                        <svg style={{ width: "32px", height: "32px", maxWidth: "32px", maxHeight: "32px", fill: "rgb(255, 255, 255)", stroke: "inherit" }}>       
                            <image style={{width: "100%", height: "100%"}} xlinkHref="/res/images/flash.svg" />    
                        </svg>
                    </Box>
                </HStack>
                <Box
                fontSize="10px" lineHeight="1.2em" color="#fff" fontWeight="400" 
                bgColor="rgba(0,0,0,.5)" borderRadius="0 8px 0 0" py="4px" px="8px">
                    {photos.length}
                </Box>
            </VStack>
        </BackgroundImage>
    )
    
    return (
        <Box as={Link} href={productLink} width={{base: "100%", sm: "50%", md: "33.33%", lg: "25%"}} py="0px" px="7px" mb="15px" 
        _hover={{
            textDecor: "none"
        }}>
            <Box pos="relative" overflow="hidden" flex="1" borderRadius="4px" bg="#fff" boxShadow="0 1px 2px rgb(96 125 135 / 15%);" h="100%">
                {img2}
                <VStack alignItems="flex-start" pt="24px" pr="8px" pb="8px"
                fontSize="14px" lineHeight="18px" color="#303a4b" p="16px" pos="relative" >
                    <Text fontSize="14px" fontWeight="400" lineHeight="1.2em" maxH="1.2em" 
                    display="inline-block" whiteSpace="nowrap" overflow="hidden!important" 
                    textOverflow="ellipsis" maxW="100%">
                        {product.title}
                    </Text>
                    <Text fontSize="14px" lineHeight="16px" fontWeight="400" color="primary.900">
                        {currencyCodeToSymbol(product?.currency_code || "")}{formatMoney(product?.price, lang, 2)}
                    </Text>
                    <Box pos="absolute" right="11px" top="-25px">
                        <Button onClick={toggleLike}
                        w="36px" h="36px" 
                        borderRadius="50%"
                        isRound="true"
                        background="white"
                        color="primary.900"
                        variant="solid" 
                        boxShadow="0 1px 2px rgb(96 125 135 / 15%)" pos="relative">
                            <Box className={`fa fa-2x fa-star${liked? "" : "-o"}`}></Box>
                        </Button>
                    </Box>
                </VStack>
            </Box>
        </Box>
    )
}

export default function Products({loading, products, viewer}) {
    const { t } = useTranslation('common')

    if(loading) return <LoadingView />

    if(!products || !Array.isArray(products)) return null

    if(products.length == 0) return <EmptyView message={t('common:no-result')} />

    return(
        <div id="products">
            <Flex flexWrap="wrap" mx="-7px ">
                {
                    products.map((product, i) => {
                        return <Product product={product} viewer={viewer} key={product.id} />
                    })
                }
            </Flex>
        </div>
    )
}