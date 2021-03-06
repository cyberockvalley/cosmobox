import { ChevronDownIcon } from "@chakra-ui/icons"
import { Box, Text, Flex, HStack, VStack, Button, IconButton } from "@chakra-ui/react"
import useTranslation from "next-translate/useTranslation"
import Head from "next/head"
import PageBody from "../components/PageBody"
import getPageLinks from "../hooks/page-links"
import { TITLE_SEPARATOR } from "../utils/constants"
import ImageView from "../views/ImageView"
import Link from "../views/Link"
import LocaleSwitch from "../components/header/LocaleSwitch"

const Section = ({reverse, child1, child2, ...props}) => {

  return (
    <Flex justifyContent="flex-start" flexWrap="wrap" direction={reverse? "row-reverse" : "row"} alignItems="center" {...props}>
      <Box w={{base: "100%", md: "50%"}}>
        {child1}
      </Box>
      <Box w={{base: "100%", md: "50%"}}>
        {child2}
      </Box>
    </Flex>
  )
}

const TextBlocks = ({header, children, ...props}) => {
    return (
        <VStack w="100%" alignItems="flex-start" {...props}>
            {
              !header? null :
              <Text fontStyle="normal" fontWeight="bold" fontSize="32px" fontWeight="bold" 
              lineHeight="40px" my="16px" mx="0px" color="#303A4B">
                {header}
              </Text>
            }
            <VStack justifyContent="flex-start" alignItems="flex-start">
                {children}
            </VStack>
        </VStack>
    )
}

const TextBlock = ({num, titleLink, title, text, children, ...props}) => {
  return (
    <Box {...props}>
      {
        !title? null :
        <HStack as={Text} alignItems="flex-start"
        fontSize="18px" fontWeight="bold" color="#464b4f" lineHeight="24px" mt="20px" mb="0px">
          {
            !num? null :
            <div><b>{num }.</b>{" "}</div>
          }
          <Text display="block" color={titleLink? "primary.900" : "#464b4f"} 
           as={titleLink? Link : Text} href={titleLink || ""} 
           _hover={{
            color: titleLink? "primary.900" : "#464b4f"
           }}
           >{title}</Text>
        </HStack>
      }
      <Box fontStyle="normal" fontWeight="normal" fontSize="18px" color="#464b4f" 
      color="#464b4f" display="block">
          {text || children}
      </Box>
    </Box>
  )
}

const JumpBlock = ({to, text, ...props}) => {
  return (
      <HStack as="a" href={`#${to}`} mb="8px" borderRadius="4px" minH="30px" px="10px" py="1px"
      pos="relative" cursor="pointer" letterSpacing="0.0075" 
      bg="#eef2f4" justifyContent="space-between" alignItems="center" fontWeight="bold"
      color="#303a4b" 
      _hover={{
        textDecor: "none",
        color: "#303a4b"
      }}
      {...props}>
          <Text color="#303a4b" fontSize="14px">{text}</Text>
          <IconButton color="rgb(189,189,189)" icon={<ChevronDownIcon />} variant="ghost" />
      </HStack>
  )
}

const About = () => {
    const {t} = useTranslation('about')

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
                        <Section child1={
                          <Box>
                            <TextBlocks header={t("section-1-header")} mb="30px">
                              <TextBlock text={t('section-1-text')} />
                            </TextBlocks>
                            <Box fontStyle="normal" fontSize="12px" lineHeight="20px" display="block"
                            mb="8px" color="#A6B8BD">
                              {t('summary')}
                            </Box>
                            <JumpBlock to="howToSell" text={t('how-to-sell')} />
                            <JumpBlock to="howToBuy" text={t('how-to-buy')} />
                            <JumpBlock to="safety" text={t('safety')} />
                          </Box>
                        }
                        
                        child2={
                          <Flex justifyContent="center" alignItems="center">
                            <ImageView isDefaultHost src="/res/images/first.svg" width="400px" height="400px" />
                          </Flex>
                        } />

                        <Section id="howToSell" reverse child1={
                          <VStack w="100%" alignItems="flex-start">
                            <TextBlocks header={t("how-to-sell")} my="30px">
                              <TextBlock 
                              num={1}
                              titleLink={getPageLinks().signUpPageLink}
                              title={t('reg-title')}
                              text={t('reg-text')} />

                              <TextBlock 
                                num={2}
                                title={t('pix-title')}
                                text={t('pix-text')} />

                              <TextBlock 
                                num={3}
                                titleLink={getPageLinks().sellPageLink}
                                title={t('sell-title')}
                                text={t('sell-text')} />

                              <TextBlock 
                                num={4}
                                title={t('msg-title')}
                                text={t('msg-text')} />

                            </TextBlocks>

                            <Button as={Link} href={getPageLinks().sellPageLink} alignSelf="center" size="lg" borderRadius="4px" color="#fff" bg="primary.900" textAlign="center" textTransform="uppercase">
                              {t('sell')}
                            </Button>
                          </VStack>
                          
                        }
                        
                        child2={
                          <Flex justifyContent="center" alignItems="center">
                            <ImageView isDefaultHost src="/res/images/second.svg" width="400px" height="400px" />
                          </Flex>
                        } />

                        <Section id="howToBuy" child1={
                          <VStack w="100%" alignItems="flex-start">
                            <TextBlocks header={t("how-to-buy")} my="30px">
                              <TextBlock 
                              num={1}
                              title={t('browse-title')}
                              text={t('browse-text')} />

                              <TextBlock 
                                num={2}
                                title={t('contact-title')}
                                text={t('contact-text')} />

                              <TextBlock 
                                num={3}
                                title={t('collect-title')}
                                text={t('collect-text')} />

                              <TextBlock 
                                num={4}
                                title={t('feedback-title')}
                                text={t('feedback-text')} />

                            </TextBlocks>

                            <Button as={Link} href="/" alignSelf="center" size="lg" borderRadius="4px" color="#fff" bg="primary.900" textAlign="center" textTransform="uppercase">
                              {t('buy')}
                            </Button>
                          </VStack>
                          
                        }
                        
                        child2={
                          <Flex justifyContent="center" alignItems="center">
                            <ImageView isDefaultHost src="/res/images/third.svg" width="400px" height="400px" />
                          </Flex>
                        } />


                        <Section id="safety" reverse child1={
                          <VStack w="100%" alignItems="flex-start">
                            <TextBlocks header={t("safety")} my="30px">
                              <TextBlock 
                              num={1}
                              title={t('gen-title')}
                              text={t('gen-text')} />

                              <TextBlock 
                                num={2}
                                title={t('personal-title')}>
                                <VStack w="100%" alignItems="flex-start">
                                  <Box>
                                    -{" "}{t('personal-text-1')}
                                  </Box>
                                  <Box>
                                    -{" "}{t('personal-text-2')}
                                  </Box>
                                  <Box>
                                    -{" "}{t('personal-text-3')}
                                  </Box>
                                  <Box>
                                    -{" "}{t('personal-text-4')}
                                  </Box>
                                </VStack>
                              </TextBlock>

                            </TextBlocks>
                          </VStack>
                          
                        }
                        
                        child2={
                          <Flex justifyContent="center" alignItems="center">
                            <ImageView isDefaultHost src="/res/images/fourth.svg" width="400px" height="400px" />
                          </Flex>
                        } />
                    </Box>
                </Flex>
                <style global jsx>{`
                body {color: #464b4f}
                `}</style>
            </PageBody>
        </div>
    )
}

export default About