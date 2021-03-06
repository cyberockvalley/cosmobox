import { Box, Text, Flex, HStack, VStack, Button, IconButton, OrderedList, ListItem, UnorderedList } from "@chakra-ui/react"
import useTranslation from "next-translate/useTranslation"
import Head from "next/head"
import PageBody from "../components/PageBody"
import { TITLE_SEPARATOR } from "../utils/constants"
import ImageView from "../views/ImageView"
import Link from "../views/Link"
import TextView from "../views/TextView"
import LocaleSwitch from "../components/header/LocaleSwitch"

const Section = ({children, ...props}) => {
  return (
    <Box mb="25px" {...props}>
      {children}
    </Box>
  )
}

const TV = ({children, ...props}) => {
  return (
    <Box fontSize="13px" {...props}>
      <TextView>
        {children}
      </TextView>
    </Box>
  )
}

const LinkBox = ({href, children, ...props}) => {
  return (
    <Box as={Link} href={href} color="primary.900" cursor="pointer"
    _hover={{
      color:"primary.900",
      textDecor: "underline"
    }} 
    {...props}>
      {children}
    </Box>
  )
}

const TitleList = ({title, children, ...props}) => {
  return (
    <ListItem fontSize="13px" color="#464b4f" {...props}>
      <VStack alignItems="flex-start">
        {title}
        {children}
      </VStack>
    </ListItem>
  )
}

const Privacy = () => {
    const {t} = useTranslation('privacy')

    return (
        <div>
            <Head>
                <title>{t('title')} {TITLE_SEPARATOR} {t('header:site-name')}</title>
            </Head>
            <PageBody navType={PageBody.vars.NAV_TYPES.others} excludeHeader mx="0px" px="0px" maxW="100%">
                <Flex position="relative" direction="column" w="100%" h="100%">
                    <HStack borderBottom="1px solid #d9e0e2"
                    px="40px" py="15px" bg="#fff" justifyContent="space-between"  alignItems="center">
                        <HStack alignItems="center" as={Link} href="/" 
                          _hover={{
                            color: "initial",
                            textDecor: "none"
                          }}>
                          <Box mr="8px">
                            <ImageView width="40px" height="40px" src={`/logo-cosmobox.png`} />
                          </Box>
                          <Text fontSize="20px" fontWeight="bold" lineHeight="1.1" color="#464b4f">
                              {t('title')}
                          </Text>
                        </HStack>

                        <LocaleSwitch />
                    </HStack>
                    <Box className="container" bg="#fff" w="100%" my="25px">
                        <Section>
                          <Box>
                            <h1 style={{textTransform: "capitalize"}}>{t('head-1')}</h1>
                          </Box>
                          <TV>
                          {t('p-1')}
                          </TV>
                        </Section>

                        <Section>
                          <Box>
                            <h3>{t('head-2')}</h3>
                          </Box>
                          <VStack alignItems="flex-start" pl="15px">
                            <LinkBox href="#title1" textTransform="uppercase" fontWeight="bold">
                              1. {" "}{t('p-2-title-1')}
                            </LinkBox>
                            <LinkBox href="#title2" textTransform="uppercase" fontWeight="bold">
                              2. {" "}{t('p-2-title-2')}
                            </LinkBox>
                            <LinkBox href="#title3" textTransform="uppercase" fontWeight="bold">
                              3. {" "}{t('p-2-title-3')}
                            </LinkBox>
                            <LinkBox href="#title4" textTransform="uppercase" fontWeight="bold">
                              4. {" "}{t('p-2-title-4')}
                            </LinkBox>
                            <LinkBox href="#title5" textTransform="uppercase" fontWeight="bold">
                              5. {" "}{t('p-2-title-5')}
                            </LinkBox>
                            <LinkBox href="#title6" textTransform="uppercase" fontWeight="bold">
                              6. {" "}{t('p-2-title-6')}
                            </LinkBox>
                            <LinkBox href="#title7" textTransform="uppercase" fontWeight="bold">
                              7. {" "}{t('p-2-title-7')}
                            </LinkBox>
                            <LinkBox href="#title8" textTransform="uppercase" fontWeight="bold">
                              8. {" "}{t('p-2-title-8')}
                            </LinkBox>
                            <LinkBox href="#title9" textTransform="uppercase" fontWeight="bold">
                              9. {" "}{t('p-2-title-9')}
                            </LinkBox>
                            <LinkBox href="#title10" textTransform="uppercase" fontWeight="bold">
                              10. {" "}{t('p-2-title-10')}
                            </LinkBox>
                            <LinkBox href="#title11" textTransform="uppercase" fontWeight="bold">
                              11. {" "}{t('p-2-title-11')}
                            </LinkBox>
                          </VStack>
                        </Section>

                        <Section id="title1">
                          <Box>
                              <h3 style={{textTransform: "uppercase"}}>1. {t('p-2-title-1')}</h3>
                          </Box>
                          <TV>
                          {t('p-2-text-1')}
                          </TV>
                        </Section>

                        <Section id="title2">
                          <Box>
                              <h3 style={{textTransform: "uppercase"}}>2. {t('p-2-title-2')}</h3>
                          </Box>
                          <TV>
                          {t('p-2-text-2')}
                          </TV>
                          <OrderedList spacing="15px">
                            <TitleList title={<Text>{t('p-2-ls-1-title')}</Text>}>
                              <TV>{t('p-2-ls-1-item-1')}</TV>
                              <TV>{t('p-2-ls-1-item-2')}</TV>
                              <TV>{t('p-2-ls-1-item-3')}</TV>
                            </TitleList>

                            <TitleList title={<Text>{t('p-2-ls-2-title')}</Text>}>
                              <TV>{t('p-2-ls-2-item-1')}</TV>
                            </TitleList>

                            <TitleList title={<Text>{t('p-2-ls-3-title')}</Text>}>
                              <TV>{t('p-2-ls-3-item-1')}</TV>
                            </TitleList>
                          </OrderedList>
                        </Section>

                        <Section id="title3">
                          <Box>
                              <h3 style={{textTransform: "uppercase"}}>3. {t('p-2-title-3')}</h3>
                          </Box>
                          <TV>
                          {t('p-2-text-3')}
                          </TV>
                          <OrderedList spacing="15px">
                            <TitleList title={<Text>{t('p-3-ls-1-title')}</Text>} />
                            <TitleList title={<Text>{t('p-3-ls-2-title')}</Text>} />
                            <TitleList title={<Text>{t('p-3-ls-3-title')}</Text>} />
                            <TitleList title={<Text>{t('p-3-ls-4-title')}</Text>} />
                          </OrderedList>
                        </Section>

                        <Section id="title4">
                          <Box>
                              <h3 style={{textTransform: "uppercase"}}>4. {t('p-2-title-4')}</h3>
                          </Box>
                          <TV>
                          {t('p-2-text-4')}
                          </TV>
                          <OrderedList spacing="15px">
                            <TitleList title={<Text>{t('p-4-ls-1-title')}</Text>}>
                              <TV>{t('p-4-ls-1-item-1')}</TV>
                            </TitleList>

                            <TitleList title={<Text>{t('p-4-ls-2-title')}</Text>}>
                              <TV>{t('p-4-ls-2-item-1')}</TV>
                            </TitleList>

                            <TitleList title={<Text>{t('p-4-ls-3-title')}</Text>}>
                              <TV>{t('p-4-ls-3-item-1')}</TV>
                            </TitleList>

                            <TitleList title={<Text>{t('p-4-ls-4-title')}</Text>}>
                              <TV>{t('p-4-ls-4-item-1')}</TV>
                            </TitleList>

                            <TitleList title={<Text>{t('p-4-ls-5-title')}</Text>}>
                              <TV>{t('p-4-ls-5-item-1')}</TV>
                            </TitleList>

                            <TitleList title={<Text>{t('p-4-ls-6-title')}</Text>}>
                              <TV>{t('p-4-ls-6-item-1')}</TV>
                            </TitleList>
                          </OrderedList>
                        </Section>

                        <Section id="title5">
                          <Box>
                              <h3 style={{textTransform: "uppercase"}}>5. {t('p-2-title-5')}</h3>
                          </Box>
                          <TV>
                          {t('p-2-text-5')}
                          </TV>
                          <OrderedList spacing="15px">
                            <TitleList title={<Text>{t('p-5-ls-1-title')}</Text>} />

                            <TitleList title={<Text>{t('p-5-ls-2-title')}</Text>} />

                            <TitleList title={<Text>{t('p-5-ls-3-title')}</Text>}>
                              <TV>{t('p-5-ls-3-item-1')}</TV>
                            </TitleList>
                          </OrderedList>
                        </Section>

                        <Section id="title6">
                          <Box>
                              <h3 style={{textTransform: "uppercase"}}>6. {t('p-2-title-6')}</h3>
                          </Box>
                          <TV>
                            {t('p-2-text-6')}
                          </TV>
                          <OrderedList spacing="15px">
                            <TitleList title={<Text>{t('p-6-ls-1-title')}</Text>}>
                              <TV>{t('p-6-ls-1-item-1')}</TV>
                              <UnorderedList spacing="15px" styleType="none">
                                <TitleList title={<Text></Text>}>
                                  <TV>{t('p-6-ls-1-item-1-1')}</TV>
                                  <TV>{t('p-6-ls-1-item-1-2')}</TV>
                                  <TV>{t('p-6-ls-1-item-1-3')}</TV>
                                </TitleList>
                              </UnorderedList>
                            </TitleList>

                            <TitleList title={<Text>{t('p-6-ls-2-title')}</Text>}>
                              <TV>{t('p-6-ls-2-item-1')}</TV>
                            </TitleList>

                            <TitleList title={<Text>{t('p-6-ls-3-title')}</Text>}>
                              <TV>{t('p-6-ls-3-item-1')}</TV>
                            </TitleList>
                          </OrderedList>
                        </Section>

                        <Section id="title7">
                          <Box>
                              <h3 style={{textTransform: "uppercase"}}>7. {t('p-2-title-7')}</h3>
                          </Box>
                          <TV>
                          {t('p-2-text-7')}
                          </TV>
                        </Section>

                        <Section id="title8">
                          <Box>
                              <h3 style={{textTransform: "uppercase"}}>8. {t('p-2-title-8')}</h3>
                          </Box>
                          <TV>
                          {t('p-2-text-8')}
                          </TV>
                        </Section>

                        <Section id="title9">
                          <Box>
                              <h3 style={{textTransform: "uppercase"}}>9. {t('p-2-title-9')}</h3>
                          </Box>
                          <TV>
                          {t('p-2-text-9')}
                          </TV>
                        </Section>

                        <Section id="title10">
                          <Box>
                              <h3 style={{textTransform: "uppercase"}}>10. {t('p-2-title-10')}</h3>
                          </Box>
                          <TV>
                          {t('p-2-text-10')}
                          </TV>
                        </Section>

                        <Section id="title11">
                          <Box>
                              <h3 style={{textTransform: "uppercase"}}>11. {t('p-2-title-11')}</h3>
                          </Box>
                          <TV>
                          {t('p-2-text-11')}
                          </TV>
                        </Section>
                        
                    </Box>
                </Flex>
                <style jsx>{`
                  body {color: #464b4f}
                  a, a:hover {color: #70b93f; text-decoration: none}
                  .h1, h1 {
                    font-size: 2em;
                  }
                  .h3, h3 {
                    font-size: 1.5em;
                  }
                  .h1, .h2, .h3, .h4, .h5, .h6, h1, h2, h3, h4, h5, h6 {
                    font-family: inherit;
                    font-weight: 500;
                    line-height: 1.1;
                    color: inherit;
                    margin: .67em 0;
                  }
                `}</style>
            </PageBody>
        </div>
    )
}

export default Privacy