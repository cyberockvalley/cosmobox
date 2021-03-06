import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons"
import { Box, Flex, HStack, IconButton, Text } from "@chakra-ui/react"
import useTranslation from "next-translate/useTranslation"
import { useEffect, useState } from "react"

import Link from "../views/Link"

const $ = require('jquery')

const CUSTOM_CATS = {
    "cat-flash-offer": "/res/images/flash.svg",
    "cat-group-ads": "/res/images/cubes.svg",
    "cat-other": "/res/images/unknown.svg"
}


const catLink = (catTextId, catId) => {
    return `/group/all/${catTextId}`
}
const subCatLink = (catTextId, subcatTextId, catId) => {
    return `/group/all/${catTextId}/${subcatTextId}`
}

const CosmoboxCats = ({cats, subcats}) => {
    const { t } = useTranslation()

    const [catsABS, setCatABS] = useState(false)

    const [catsState, setCatsState] = useState(cats || [])
    useEffect(() => {
        console.log("CATSZ: ", cats)
        setCatsState(cats || [])
    }, [cats])
    const [cat, setCat] = useState()
    const [subCatsState, setSubCatsState] = useState([])

    const [showUpCatScoller, setShowUpCatScoller] = useState(false)
    const [showDownCatScoller, setShowDownCatScoller] = useState(false)
    const [scrollerUsed, setScrollerUsed] = useState(false)

    useEffect(() => {
        var catsEl = $("#side_bar_scroll")
        if(catsEl) {
            catsEl = catsEl[0]
            if(catsEl.offsetHeight == catsEl.scrollHeight) {
                setShowUpCatScoller(false)
                setShowDownCatScoller(false)

            } else {
                setShowUpCatScoller(true)
                setShowDownCatScoller(true)

                console.log("CATS_DIV:", catsEl.offsetHeight, catsEl.scrollHeight, catsEl.scrollTop)
                
                if(catsEl.scrollTop == 0) {
                    setShowUpCatScoller(false)

                }
                
                if(catsEl.scrollHeight - catsEl.offsetHeight <= catsEl.scrollTop) {
                    setShowDownCatScoller(false)
                }
            }
            
        }
    }, [scrollerUsed])

    const scrollUp = () => {
        const pane = $("#side_bar_scroll")[0]
        const by = pane.offsetHeight
        console.log("scroll:", "UP", by, pane)
        pane.scrollTop += -1 * by
        //setScrollerUsed(!scrollerUsed)
    }
    
    const scrollDown = () => {
        const pane = $("#side_bar_scroll")[0]
        const by = pane.offsetHeight
        console.log("scroll:", "DOWN", by, pane)
        pane.scrollTop += by
        //setScrollerUsed(!scrollerUsed)
    }

    

    const [showUpCatScollerSub, setShowUpCatScollerSub] = useState(false)
    const [showDownCatScollerSub, setShowDownCatScollerSub] = useState(false)
    const [scrollerUsedSub, setScrollerUsedSub] = useState(false)

    useEffect(() => {
        var catsEl = $("#side_bar_scroll_sub")
        if(catsEl) {
            catsEl = catsEl[0]
            if(catsEl.offsetHeight == catsEl.scrollHeight) {
                setShowUpCatScollerSub(false)
                setShowDownCatScollerSub(false)

            } else {
                setShowUpCatScollerSub(true)
                setShowDownCatScollerSub(true)

                console.log("CATS_DIV_Sub:", catsEl.offsetHeight, catsEl.scrollHeight, catsEl.scrollTop)
                
                if(catsEl.scrollTop == 0) {
                    setShowUpCatScollerSub(false)

                }
                
                if(catsEl.scrollHeight - catsEl.offsetHeight <= catsEl.scrollTop) {
                    setShowDownCatScollerSub(false)
                }
            }
            
        }
    }, [scrollerUsedSub])

    const scrollUpSub = () => {
        const pane = $("#side_bar_scroll_sub")[0]
        const by = pane.offsetHeight
        console.log("scroll:", "UP", by, pane)
        pane.scrollTop += -1 * by
        //setScrollerUsed(!scrollerUsed)
    }
    
    const scrollDownSub = () => {
        const pane = $("#side_bar_scroll_sub")[0]
        const by = pane.offsetHeight
        console.log("scroll:", "DOWN", by, pane)
        pane.scrollTop += by
        //setScrollerUsed(!scrollerUsed)
    }

    const [mobileCatList, setMobileCatList] = useState(false)


    const buildCat = (cat, index, totalProducts, link) => {
        //console.log("CATSZZ:", cat)
        return (
            <Flex key={cat.id} _hover={{
                bg: "#EEF2F4"
            }} cursor="pointer" px="2" py={{base: 0, md: "1"}} 
                direction={{base: !mobileCatList? "column" : "row", md: "row"}} 
                justifyContent={{base: !mobileCatList? "space-around" : "flex-start", md: "space-around"}}
                alignItems={{base: !mobileCatList? "flex-start" : "center", md: "center"}} 
                minW={{base: !mobileCatList? "25%" : "100%", md: "100%"}} 
                w={{base: !mobileCatList? "25%" : "100%", md: "100%"}} 
                
                onMouseEnter={ mobileCatList? null : () => {
                    if(!CUSTOM_CATS[cat.text_id]) {
                        setCatABS(true)
                        setCat(cat)
                        setSubCatsState(cat.subcats)
                        setScrollerUsedSub(!scrollerUsedSub)
                    }
                }} >
                <Box w={{base: !mobileCatList? "100%" : "20%", md: "20%"}} as={Link} href={link}>
                {
                    !CUSTOM_CATS[cat.text_id]?
                    <svg className={cat.text_id} style={{ width: "32px", height: "32px", maxWidth: "32px", maxHeight: "32px", fill: "rgb(114, 183, 71)", stroke: "inherit" }} data-index={index} data-id={cat.id}>
                        <use xlinkHref={`#${cat.text_id}`} data-index={index} data-id={cat.id}></use>
                    </svg>
                    :
                    <svg style={{ width: "32px", height: "32px", maxWidth: "32px", maxHeight: "32px", fill: "rgb(114, 183, 71)", stroke: "inherit" }} data-index={index} data-id={cat.id}>       
                        <image style={{width: "100%", height: "100%"}} xlinkHref={CUSTOM_CATS[cat.text_id]} data-index={index} data-id={cat.id} />    
                    </svg>
                }
                </Box>
                <HStack w={{base: !mobileCatList? "100%" : "80%", md: "80%"}} 
                alignItems="center" justifyContent={'space-between'}>
                    <Text className="more-text" fontSize=".75rem" as={Link} href={link} 
                    _hover={{textDecor: "none"}}>
                        {cat.name}
                    </Text>
                    <IconButton
                    icon={<ChevronRightIcon />}
                    variant="ghost"
                    size="lg"
                    display={{
                        base: !mobileCatList || CUSTOM_CATS[cat.text_id]? 'none' : 'block', 
                        md: CUSTOM_CATS[cat.text_id]? 'none' : 'block'
                    }} 
                    onClick={!mobileCatList? null : () => {
                        if(!CUSTOM_CATS[cat.text_id]) {
                            setCatABS(true)
                            setCat(cat)
                            setSubCatsState(cat.subcats)
                            
                            console.log("SS:2", cat.name, cat.subcats)
                            setScrollerUsedSub(!scrollerUsedSub)
                        }
                    }} />
                </HStack>
            </Flex>
        )
    }

    const buildSubCat = (cat, index, totalProducts, link) => {
        //console.log("CATSZZ:", cat)
        return (
            <Flex key={cat.id} _hover={{
                bg: "#EEF2F4",
                textDecor: "none"
            }} cursor="pointer" px="15px" py="5px"
                direction="row"
                alignItems="center"
                minW="100%" 
                w="100%" 
                as={Link} href={link}>
                <HStack w={{md: "100%"}} alignItems="center" justifyContent={'space-between'} w="100%">
                    <Text className="more-text" fontSize=".75rem">
                        {cat.name}
                    </Text>
                </HStack>
            </Flex>
        )
    }

    return(
    <Box ml={{md: "15px"}} id="cats" className="side-inner" zIndex={7} 
    pos="relative" h={{md: "5000px"}} 
    maxH={{md: "80vh"}} bottom="auto">
        <Box pos={{base: !mobileCatList? "relative" : "absolute", md: catsABS? "absolute" : "relative"}} 
        h={{md: "100%"}} mt={{md: "15px"}}
        zIndex={7}
        left={{base: !mobileCatList? "initial" : "0", md: "initial"}}
        top={{base: !mobileCatList? "initial" : "0", md: "initial"}}
        right={{base: !mobileCatList? "initial" : "0", md: "initial"}}
        >
            <Box onMouseLeave={() => {
                setSubCatsState([])
                setCatABS(false)
            }} 
            className="b-categories-listing-inner b-categories-listing-inner--small-box-shadow" 
            bg="#fff" 
            boxShadow="1px 1px 4px rgb(80 114 125 / 40%);" 
            pos="relative" h="100%" w={{base: !mobileCatList? "auto" : "100%"}} 
            display="flex">

                <Box className="b-categories-listing__item b-categories-listing__parents" 
                    h={{md: "100%"}} w="100%" overflow={{md: "hidden"}}
                    display={{base: mobileCatList && subCatsState.length > 0? "none" : "block", md: "block"}}>

                    <Box as="div" id="side_bar_scroll" className="sidebar-scroll" 
                    onScroll={() => setScrollerUsed(!scrollerUsed)}>
                        <Box w="100%">
                            <Flex display={{base: "none", md: showUpCatScoller? "flex" : "none"}} 
                            cursor="pointer" position="absolute" 
                            left={0} top={0} right={0} h="35px" w={{md: subCatsState.length == 0? "100%" : "50%"}}
                            zIndex={7}
                            justifyContent="center" alignItems="center" 
                            bgGradient="linear(to-b, rgba(246,248,253,.74) 74%, rgba(246,248,253,0))" onClick={scrollUp}>
                                <i className="fa fa-caret-up"></i>
                            </Flex>
                            {
                                !mobileCatList? null :
                                <HStack display={{base: "flex", md: "none"}} 
                                w="100%" bg="#535353" 
                                h="45px" fontSize=".9375rem"
                                justifyContent="space-between" alignItems="center" 
                                pos="relative">
                                    <IconButton  
                                        color="#fff"
                                        icon={<ChevronLeftIcon />}
                                        variant="ghost"
                                        size="lg"
                                        onClick={() => {
                                            setMobileCatList(false)
                                        }}
                                    />
                                    <Text color="#fff" fontWeight="700">
                                        {t("categories")}
                                    </Text>
                                    <IconButton visibility="hidden" />
                                </HStack>
                            }
                            <Flex className="categories-innermost-wrapper" py="1" fontWeight="bold" 
                            direction={{base: !mobileCatList? "row" : "column", md: "column"}} 
                            justifyContent={{base: !mobileCatList? "space-between" : "flex-start", md: "flex-start"}} 
                            alignItems={{md: "flex-start"}} 
                            pos="relative" w="100%" pb={{base: "0px"}}>
                                <Flex onClick={() => setMobileCatList(true)} cursor="pointer" 
                                display={{base: !mobileCatList? "flex" : "none", md: "none"}} px="2" direction="column" 
                                minW={{base: "25%", md: "100%"}} w={{base: "25%", md: "100%"}} >
                                    <Text className="fa fa-2x fa-list" color="primary.900"></Text>
                                    <Text className="more-text" fontSize=".75rem">
                                    {t('home:browse-all')}
                                    </Text>
                                </Flex>
                                {
                                    catsState.map((cat, index) => (
                                        buildCat(cat, index, cat.total || 0, catLink(cat.text_id, cat.id))
                                    ))
                                }

                            </Flex>
                            <Flex display={{base: "none", md: showDownCatScoller? "flex" : "none"}} 
                            cursor="pointer" position="absolute" 
                            left={0} bottom={0} w="100%" h="35px" w={{md: subCatsState.length == 0? "100%" : "50%"}}
                            zIndex={7}
                            justifyContent="center" alignItems="center" 
                            bgGradient="linear(to-t, rgba(246,248,253,.74) 74%, rgba(246,248,253,0))" 
                            onClick={scrollDown}>
                                <i className="fa fa-caret-down"></i>
                            </Flex>
                        </Box>
                    </Box>
                </Box>
                <Box display={{base: !mobileCatList? 'none' : subCatsState.length == 0? 'none' : 'block', md: subCatsState.length == 0? 'none' : 'block'}} 
                borderLeft={{base: !mobileCatList? "1px solid" : "0px"}} borderColor="primary.900" 
                w="100%" h="100%"
                >
                    <Box className="b-categories-listing__item b-categories-listing__parents" 
                    h="100%" overflow={{md: "hidden"}} pos="relative" w="100%">

                        <Box h="100%" as="div" id="side_bar_scroll_sub" className="sidebar-scroll" 
                        onScroll={() => setScrollerUsedSub(!scrollerUsedSub)}>
                            <Box w="100%" h="100%">
                                <Flex display={{base: "none", md: showUpCatScollerSub? "flex" : "none"}} 
                                cursor="pointer" 
                                position="absolute" left={0} top={0} right={0} 
                                zIndex={7}
                                w="100%" h="35px" 
                                justifyContent="center" alignItems="center" 
                                bgGradient="linear(to-b, rgba(246,248,253,.74) 74%, rgba(246,248,253,0))" 
                                onClick={scrollUpSub}>
                                    <i className="fa fa-caret-up"></i>
                                </Flex>
                                {
                                    !mobileCatList? null :
                                    <HStack display={{base: "flex", md: "none"}} 
                                    w="100%" bg="#535353" 
                                    h="45px" fontSize=".9375rem"
                                    justifyContent="space-between" alignItems="center" 
                                    pos="relative">
                                        <IconButton  
                                            color="#fff"
                                            icon={<ChevronLeftIcon />}
                                            variant="ghost"
                                            size="lg"
                                            onClick={() => {
                                                setSubCatsState([])
                                                setCatABS(false)
                                                setCat(null)
                                                console.log("SS:", subCatsState)
                                            }}
                                        />
                                        <Text color="#fff" fontWeight="700">
                                            {cat? cat.name : ""}
                                        </Text>
                                        <IconButton visibility="hidden" />
                                    </HStack>
                                }
                                <Flex className="categories-innermost-wrapper" py="1" fontWeight="bold" 
                                direction={{base: !mobileCatList? "row" : "column", md: "column"}} 
                                justifyContent={{base: !mobileCatList? "space-between" : "flex-start", md: "flex-start"}} 
                                alignItems={{md: "flex-start"}} 
                                pos="relative" w="100%">
                                
                                    {
                                        subCatsState.map((scat, index) => (
                                            buildSubCat(scat, index, scat.total || 0, subCatLink(cat.text_id, scat.text_id))
                                        ))
                                    }

                                </Flex>
                                <Flex display={{base: "none", md: showDownCatScollerSub? "flex" : "none"}} 
                                cursor="pointer" 
                                position="absolute" left={0} bottom={0} right={0}
                                zIndex={7}
                                w="100%" h="35px" justifyContent="center" 
                                alignItems="center" 
                                bgGradient="linear(to-t, rgba(246,248,253,.74) 74%, rgba(246,248,253,0))" onClick={scrollDownSub}>
                                    <i className="fa fa-caret-down"></i>
                                </Flex>
                            </Box>
                        </Box>
                    </Box>
                </Box>

            </Box>
        </Box>
    </Box>
    )
}

export default CosmoboxCats