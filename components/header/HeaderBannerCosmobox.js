import { Box, Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, HStack, IconButton, SimpleGrid, Text, useDisclosure, VStack } from "@chakra-ui/react";
import useTranslation from "next-translate/useTranslation";
import { useState } from "react";
import ImageView from "../../views/ImageView";
import SearchBox from "../../widgets/search-box";

import { API_REQUEST_STATUS, useApiGet } from '../../api/client'
import LoadingView from "../LoadingView";
import Link from "../../views/Link";
import getPageLinks from "../../hooks/page-links";
import { CloseIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import { getFromStorage, saveToStrorage } from "../../utils/functions";

const HeaderBannerCosmobox = ({search, buttonAction, buttonText}) => {
  const { t, lang } = useTranslation('header')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [ currentState, setCurrentState ] = useState(getFromStorage("currentState"))
  const [ currentStateId, setCurrentStateId ] = useState(getFromStorage("currentStateId"))

  const [states, statesError, statesStatus] = useApiGet('countries', lang, {
    initialData: [],
    noLocale: true
  })

  const router = useRouter()

  const updateCurrentState = (state, link) => {
    saveToStrorage("currentState", state.name)
    saveToStrorage("currentStateId", state.sortname)
    setCurrentState(state.name)
    setCurrentStateId(state.sortname)
    if(link) router.push(link)
  }

  return (
    <>
      <Box display={{base: 'none', md: 'block'}} className="banner" bg="primary.900" pt="60px">
        <HStack justifyContent={{base: "center", lg: "space-between"}} w="100%" height="300px" py="15px">
          <VStack width="30%" justifyContent="flex-end" display={{base: "none", lg: "flex"}}>
            <ImageView src="/res/images/man.png" width="auto" height="300px" />
          </VStack>
          <VStack flexGrow={1} maxWidth="70%" alignItems="center">
            <HStack alignItems="center" mb="35px">
              <Text color="#fff" fontWeight="700" fontSize="18px">{t('find-in')} </Text>
              <Button h="24px" display="flex" alignItems="center" color="#fff" bg="rgba(48, 58, 75, 0.7)" 
              p="0 8px" borderRadius="4px" fontSize="14px" textAlign="center" willChange="box-shadow"
              whiteSpace="nowrap" transition="box-shadow 0.2s, -webkit-box-shadow 0.2s"
              _hover={{
                bg: "#303A4B"
              }} 
              onClick={onOpen}>
                <Box mr="5px" className="fa fa-map-marker"></Box>
                <Text color="#fff">{!currentState? t('filter-all') : currentState}</Text>
              </Button>
            </HStack>
            {
              !search? null :
              <SearchBox {...search} />
            }
            {
              !buttonText? null :
              <button
                type="button"
                className="btn btn-warning text-dark btn-banner text-upper"
                onClick={buttonAction}
              >
                {buttonText}
              </button>
            }
          </VStack>
          <VStack width="30%" justifyContent="flex-end" display={{base: "none", lg: "flex"}}>
            <ImageView src="/res/images/girls.png" width="auto" height="300px"  />
          </VStack>
        </HStack>
      </Box>
      <Drawer placement="bottom" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay>
          <DrawerContent>
            <DrawerHeader borderBottomWidth="1px">
              <HStack w="100%" justifyContent="space-between">
                <HStack>
                  <Box mx="18px" className="fa fa-2x fa-map-marker" color="primary.900"></Box>
                  <Text color="#303A4B" fontSize="18px">{!currentState? t('filter-all') : currentState}</Text>
                </HStack>
                <IconButton icon={<CloseIcon />} variant="ghost" arial-label={t('common:close')} onClick={onClose} />
              </HStack>
            </DrawerHeader>
            <DrawerBody>
              {
                statesStatus != API_REQUEST_STATUS.fetched?
                <LoadingView />
                :
                <SimpleGrid columns={3} spacing={5} color="primary.900">
                  {
                    states.map(state => {
                      return (
                        <Box as={Link} onClick={e => {
                          e.preventDefault()
                          updateCurrentState(state, getPageLinks(state.sortname).countryLink)
                        }} key={state.sortname} h="20px" href={getPageLinks(state.sortname).countryLink}>
                          {state.name}
                        </Box>
                      )
                    })
                  }
                </SimpleGrid>
              }
            </DrawerBody>
          </DrawerContent>
        </DrawerOverlay>
      </Drawer>
    </>
  );
}

export default HeaderBannerCosmobox
