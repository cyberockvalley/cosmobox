import { Box, Text, Flex, HStack, VStack, UnorderedList, ListItem } from "@chakra-ui/react"
import useTranslation from "next-translate/useTranslation"
import Trans from 'next-translate/Trans'
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
    <Box as={TextView} fontSize="13px" {...props}>
      {children}
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

const Tos = () => {
    const {t} = useTranslation('tos')

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
                            <h1>{t('head-1')}</h1>
                          </Box>
                          <Trans i18nKey="tos:p-1" components={[<p />, <p />, <p />, <a href="/privacy"/>, <p />, <p />, <p />, <p />, <p />]} />
                        </Section>

                        <Section id="title1">
                          <Box>
                              <h3>1. {t('prov-title')}</h3>
                          </Box>
                          <UnorderedList spacing="15px" styleType="none" >
                            <TitleList title={<Text>{t('tos-1-1')}</Text>} />
                            <TitleList title={<Text>{t('tos-1-2')}</Text>} />
                            <TitleList title={<Text>{t('tos-1-3')}</Text>} />
                            <TitleList title={<Text>{t('tos-1-4')}</Text>} />
                            <TitleList title={<Text>{t('tos-1-5')}</Text>} />
                            <TitleList title={<Text>{t('tos-1-6')}</Text>} />
                          </UnorderedList>
                        </Section>

                        <Section id="title2">
                          <Box>
                              <h3>2. {t('res-title')}</h3>
                          </Box>
                          <Box mb="15px">
                            <TV fontSize="16px">
                            {t('tos-2-1')}
                            </TV>
                            <UnorderedList spacing="15px" styleType="none" >
                              <TitleList title={<Text>{t('tos-2-1-1')}</Text>} />
                              <TitleList title={<Text>{t('tos-2-1-2')}</Text>} />
                              <TitleList title={<Text>{t('tos-2-1-3')}</Text>} />
                              <TitleList title={<Text>{t('tos-2-1-4')}</Text>} />
                              <TitleList title={<Text>{t('tos-2-1-4')}</Text>} />
                              <TitleList title={<Text>{t('tos-2-1-5')}</Text>} />
                              <TitleList title={<Text>{t('tos-2-1-6')}</Text>} />
                            </UnorderedList>
                          </Box>
                          <Box mb="15px">
                            <TV fontSize="16px">
                            {t('tos-2-2')}
                            </TV>
                            <UnorderedList spacing="15px" styleType="none" >
                              <TitleList title={<Text>{t('tos-2-2-1')}</Text>} />
                              <TitleList title={<Text>{t('tos-2-2-2')}</Text>} />
                              <TitleList title={<Text>{t('tos-2-2-3')}</Text>} />
                              <TitleList title={<Text>{t('tos-2-2-4')}</Text>} />
                              <TitleList title={<Text>{t('tos-2-2-4')}</Text>} />
                              <TitleList title={<Text>{t('tos-2-2-5')}</Text>} />
                              <TitleList title={<Text>{t('tos-2-2-6')}</Text>} />
                              <TitleList title={<Text>{t('tos-2-2-7')}</Text>} />
                              <TitleList title={<Text>{t('tos-2-2-8')}</Text>} />
                              <TitleList title={<Text>{t('tos-2-2-9')}</Text>} />
                              <TitleList title={<Text>{t('tos-2-2-10')}</Text>} />
                              <TitleList title={<Text>{t('tos-2-2-11')}</Text>} />
                            </UnorderedList>
                          </Box>
                          <Box>
                            <TV fontSize="16px">
                            {t('tos-2-3')}
                            </TV>
                            <UnorderedList spacing="15px" styleType="none" >
                              <TitleList title={<Text>{t('tos-2-3-1')}</Text>} />
                              <TitleList title={<Text>{t('tos-2-3-2')}</Text>} />
                              <TitleList title={<Text>{t('tos-2-3-3')}</Text>} />
                            </UnorderedList>
                          </Box>
                        </Section>

                        <Section id="title3">
                          <Box>
                              <h3>3. {t('ad-pub-title')}</h3>
                          </Box>
                          <UnorderedList spacing="15px" styleType="none" >
                            {
                              [...Array(7).keys()].map((v, index) => {
                                return (
                                  <TitleList key={`tos-3-${index + 1}`} title={<Text>{t(`tos-3-${index + 1}`)}</Text>} />
                                )
                              })
                            }
                            <TitleList title={<Text>{t('tos-3-8')}</Text>}>

                              <UnorderedList spacing="5px" styleType="none" >
                                {
                                  [...Array(30).keys()].map((v, index) => {
                                    return (
                                      <TitleList key={`tos-3-8-${index + 1}`} title={<Text>{t(`tos-3-8-${index + 1}`)}</Text>} />
                                    )
                                  })
                                }
                              </UnorderedList>
                              
                            </TitleList>
                          </UnorderedList>
                        </Section>

                        <Section id="title4">
                          <Box>
                              <h3>4. {t('prop-right-title')}</h3>
                          </Box>
                          <UnorderedList spacing="15px" styleType="none" >
                            {
                              [...Array(6).keys()].map((v, index) => {
                                return (
                                  <TitleList key={`tos-4-${index + 1}`} title={<Text>{t(`tos-4-${index + 1}`)}</Text>} />
                                )
                              })
                            }
                          </UnorderedList>
                        </Section>

                        <Section id="title5">
                          <Box>
                              <h3>5. {t('prop-theft-notice')}</h3>
                          </Box>
                          <UnorderedList spacing="15px" styleType="none" >
                            {
                              [...Array(1).keys()].map((v, index) => {
                                return (
                                  <TitleList key={`tos-5-${index + 1}`} title={<Text>{t(`tos-5-${index + 1}`)}</Text>} />
                                )
                              })
                            }
                            <TitleList title={<Text>{t('tos-5-2')}</Text>}>

                              <UnorderedList spacing="5px" styleType="none" >
                                {
                                  [...Array(11).keys()].map((v, index) => {
                                    return (
                                      <TitleList key={`tos-5-2-${index + 1}`} title={<Text>{t(`tos-5-2-${index + 1}`)}</Text>} />
                                    )
                                  })
                                }
                              </UnorderedList>
                              
                            </TitleList>
                          </UnorderedList>
                        </Section>

                        <Section id="title6">
                          <Box>
                              <h3>6. {t('spam-pol-title')}</h3>
                          </Box>
                          <TV>
                            {t('spam-pol-text')}
                          </TV>
                        </Section>

                        <Section id="title7">
                          <Box>
                              <h3>7. {t('lim-liab-title')}</h3>
                          </Box>
                          <UnorderedList spacing="15px" styleType="none" >
                            {
                              [...Array(4).keys()].map((v, index) => {
                                return (
                                  <TitleList key={`tos-7-${index + 1}`} title={<Text>{t(`tos-7-${index + 1}`)}</Text>} />
                                )
                              })
                            }
                          </UnorderedList>
                        </Section>

                        <Section id="title8">
                          <Box>
                              <h3>8. {t('ind-title')}</h3>
                          </Box>
                          <UnorderedList spacing="15px" styleType="none" >
                            {
                              [...Array(2).keys()].map((v, index) => {
                                return (
                                  <TitleList key={`tos-8-${index + 1}`} title={<Text>{t(`tos-8-${index + 1}`)}</Text>} />
                                )
                              })
                            }
                            <TitleList title={<Text>{t('tos-8-3')}</Text>}>

                              <UnorderedList spacing="5px" styleType="none" >
                                {
                                  [...Array(6).keys()].map((v, index) => {
                                    return (
                                      <TitleList key={`tos-8-3-${index + 1}`} title={<Text>{t(`tos-8-3-${index + 1}`)}</Text>} />
                                    )
                                  })
                                }
                              </UnorderedList>
                              
                            </TitleList>
                          </UnorderedList>
                        </Section>

                        <Section id="title9">
                          <Box>
                              <h3>9. {t('app-title')}</h3>
                          </Box>
                          <UnorderedList spacing="15px" styleType="none" >
                            <TitleList title={<Text>{t('tos-9-1')}</Text>}>
                              <UnorderedList spacing="5px" styleType="none" >
                                {
                                  [...Array(3).keys()].map((v, index) => {
                                    return (
                                      <TitleList key={`tos-9-1-${index + 1}`} title={<Text>{t(`tos-9-1-${index + 1}`)}</Text>} />
                                    )
                                  })
                                }
                              </UnorderedList>
                            </TitleList>
                            {
                              [...Array(1).keys()].map((v, index) => {
                                return (
                                  <TitleList key={`tos-9-${index + 2}`} title={<Text>{t(`tos-9-${index + 2}`)}</Text>} />
                                )
                              })
                            }
                          </UnorderedList>
                        </Section>

                        <Section id="title10">
                          <Box>
                              <h3>10. {t('interact-title')}</h3>
                          </Box>
                          <UnorderedList spacing="15px" styleType="none" >
                            {
                              [...Array(1).keys()].map((v, index) => {
                                return (
                                  <TitleList key={`tos-10-${index + 1}`} title={<Text>{t(`tos-10-${index + 1}`)}</Text>} />
                                )
                              })
                            }
                          </UnorderedList>
                        </Section>

                        <Section id="title11">
                          <Box>
                              <h3>11. {t('others')}</h3>
                          </Box>
                          <UnorderedList spacing="15px" styleType="none" >
                            {
                              [...Array(3).keys()].map((v, index) => {
                                return (
                                  <TitleList key={`tos-11-${index + 1}`} title={<Text>{t(`tos-11-${index + 1}`)}</Text>} />
                                )
                              })
                            }
                          </UnorderedList>
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
                    text-transform: capitalize
                  }
                  p {font-size: 13px; margin-bottom: 7px}
                `}</style>
            </PageBody>
        </div>
    )
}

export default Tos