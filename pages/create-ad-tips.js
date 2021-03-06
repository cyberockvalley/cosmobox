import { Box, Text, Flex, HStack, VStack, Button } from "@chakra-ui/react"
import useTranslation from "next-translate/useTranslation"
import Head from "next/head"
import PageBody from "../components/PageBody"
import { TITLE_SEPARATOR } from "../utils/constants"
import ImageView from "../views/ImageView"
import Link from "../views/Link"
import LocaleSwitch from "../components/header/LocaleSwitch"

const Item = ({icon, title, body}) => {
    return (
        <HStack alignItems="center" py="15px" px="0px" mb="15px" borderRadius="11px" boxShadow="0 3px 5px 0 rgb(50 50 50 / 18%)">
            <VStack justifyContent="center" px="10px">
                <ImageView isDefaultHost src={icon} width="94px" height="107px" />
            </VStack>
            <VStack justify="center" alignItems="flex-start">
                <Text fontSize="16px" fontWeight="bold" color="#464b4f">
                    {title}
                </Text>
                <Text fontSize="16px" color="#464b4f">
                    {body}
                </Text>
            </VStack>
        </HStack>
    )
}
const CreateAdTips = () => {
    const {t} = useTranslation('create-ad-tips')

    return (
        <div>
            <Head>
                <title>{t('title')} {TITLE_SEPARATOR} {t('header:site-name')}</title>
            </Head>
            <PageBody navType={PageBody.vars.NAV_TYPES.others} mx="0px" px="0px" maxW="100%" pt="55px">
                <Flex position="relative" direction="column" w="100%" h="100%">
                    <HStack borderBottom="1px solid #d9e0e2"
                    px="40px" py="15px" bg="#fff" justifyContent="space-between"  alignItems="center">
                        <HStack alignItems="center">
                          <Box mr="8px">
                            <svg className={"light-bulb"} style={{ width: "32px", height: "32px", maxWidth: "32px", maxHeight: "32px", fill: "rgb(114, 183, 71)", stroke: "inherit" }}>
                                <use xlinkHref={`#light-bulb`}></use>
                            </svg>
                          </Box>
                          <Text fontSize="20px" fontWeight="bold" lineHeight="1.1" color="#464b4f">
                              {t('title')}
                          </Text>
                        </HStack>
                    </HStack>
                    <Box w="100%" pl="25px" pr="60px" bg="#fbfbfb" mb="15px">
                        <Text mt="20px" mb="30px" fontWeight="600" textAlign="center" fontSize="16px" color="#464b4f">
                            {t("sub-header")}
                        </Text>
                        <Box>
                            <Item icon="/res/images/tips-attention.png" 
                                title={t("headline-head")}
                                body={t("headline-body")} />
                            <Item icon="/res/images/tips-relevant-price.png" 
                                title={t("price-head")}
                                body={t("price-body")} />
                            <Item icon="/res/images/tips-detailed-description.png" 
                                title={t("desc-head")}
                                body={t("desc-body")} />
                            <Item icon="/res/images/tips-picture.png" 
                                title={t("photo-head")}
                                body={t("photo-body")} />
                            <Item icon="/res/images/tips-answer-calls.png" 
                                title={t("calls-head")}
                                body={t("calls-body")} />
                            <Item icon="/res/images/tips-check-location.png" 
                                title={t("loc-head")}
                                body={t("loc-body")} />
                            <Item icon="/res/images/tips-pay-little.png" 
                                title={t("pay-head")}
                                body={t("pay-body")} />
                        </Box>
                    </Box>
                    <HStack justifyContent="center" alignItems="center">
                        <Button as={Link} href="/sell" color="#fff" bg="primary-secondary" size="lg" textTransform="capitalize">
                            {t("sell-now")}
                        </Button>
                    </HStack>
                </Flex>
            </PageBody>
        </div>
    )
}

export default CreateAdTips