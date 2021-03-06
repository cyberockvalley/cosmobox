import { Box, Button, HStack, Text, VStack } from "@chakra-ui/react"
import useTranslation from "next-translate/useTranslation"
import ImageView from "../../views/ImageView"
import Link from "../../views/Link"

const SiteAd = () => {
    const { t } = useTranslation('home')

    return(
    <HStack display={{base: "none", md: "flex"}} alignItems="center" my="15px" w="100%" h="250px">
        <HStack className="card" p="15px" alignItems="center" my="15px" flexGrow={1} h="100%">
        <Box>
            <ImageView src="/res/images/missile.png" width="200px" height="200px" />
        </Box>

        <VStack justifyContent="flext-start" alignItems="flex-start">

            <Text fontSize="lg" fontWeight="bold" mb="15px">
            {t('fly-ads')}
            </Text>
            <HStack alignItems="center" justifyContent="space-between">
            <Text fontSize="sm">
                {t('get-customers')}
            </Text>
            <Button size="lg" as={Link} href="/about" textDecoration="none"
            bg="#f98a1a" color="#fff" 
            _hover={{
                color: "#333",
                textDecoration: "none"
            }}>
                {t('find-out-more')}
            </Button>
            </HStack>

            <HStack w="100%" justifyContent="space-between" alignItems="center">
            <VStack>
                <Text fontSize="20px" fontWeight="600" color="#febf53">
                {t('common:x-million', {count: 2})}
                </Text>
                <Text fontSize="13px" color="#404040" textTransform="lowercase">
                {t('visits-per-month')}
                </Text>
            </VStack>

            <VStack>
                <Text fontSize="20px" fontWeight="600" color="#febf53">
                {t('common:x-million', {count: 25})}
                </Text>
                <Text fontSize="13px" color="#404040" textTransform="lowercase">
                {t('impression-per-month')}
                </Text>
            </VStack>

            <VStack>
                <Text fontSize="20px" fontWeight="600" color="#febf53">
                {t('common:x-thousand', {count: 300})}
                </Text>
                <Text fontSize="13px" color="#404040" textTransform="lowercase">
                {t('reg-users')}
                </Text>
            </VStack>
            </HStack>
        </VStack>

        </HStack>
        <VStack display={{md: "none", lg: "flex"}} as={Link} href="/sell" p="15px" className="card" justifyContent="space-between" 
        w="25%" h="100%" bg="#FFA010" 
        color="#fff" fontWeight="bold" textAlign="center"
        _hover={{
        color: "#333",
        textDecoration: "none"
        }}>
            <Box fontSize="1.1em">
                {t('question-something-to-sell')}
            </Box>
            <Box className="fa fa-plus-circle" fontSize="5em"></Box>
            <Box fontSize="1.1em">
                {t('post-free')}
            </Box>
        </VStack>
    </HStack>
    )
}

export default SiteAd