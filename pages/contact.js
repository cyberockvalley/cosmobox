import { Box, Text, Flex, HStack, VStack, Button } from "@chakra-ui/react"
import useTranslation from "next-translate/useTranslation"
import Head from "next/head"
import PageBody from "../components/PageBody"
import { TITLE_SEPARATOR } from "../utils/constants"
import ImageView from "../views/ImageView"

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
const Contact = () => {
    const {t} = useTranslation('contact')

    return (
        <div>
            <Head>
                <title>{t('title')} {TITLE_SEPARATOR} {t('header:site-name')}</title>
            </Head>
            <PageBody navType={PageBody.vars.NAV_TYPES.others} mx="0px" px="0px" maxW="100%" pt="55px">
                <Flex position="relative" direction="column" w="100%" h="100%" pt="50px">
                    <Box w="100%" pl="25px" pr="60px" bg="#fbfbfb" mb="15px">
                        <Box>
                            <Item icon="/res/images/tips-answer-calls.png" 
                                title={t("head")}
                                body={t("body")} />
                        </Box>
                    </Box>
                </Flex>
            </PageBody>
        </div>
    )
}

export default Contact