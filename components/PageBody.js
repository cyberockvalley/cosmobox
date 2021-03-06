import { Box } from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import Footer from './Footer'
import Header from './header'
import NavBar from './header/NavBar'

const PageBody = ({navType, children, excludeHeader, excludeFooter, className, ...props}) => {
    const { t } = useTranslation('common')

    const nav = excludeHeader? null : navType == PageBody.vars.NAV_TYPES.home? <Header banner={{
        primaryText: t('site-desc'),
        search: {
          placeholder: t('header:search-placeholder'),
          recentSearchesText: t('header:recent-searches')
        }
      }} /> : <NavBar />
    
    return(
        <div>
            {nav}
            <Box as="main" className={`container ${className || ''}`} {...props}>
                {children}
            </Box>
            {!excludeFooter? <Footer /> : null}
        </div>
    )
}

PageBody.vars = {
    NAV_TYPES: {
        home: "home",
        others: "others"
    }
}

export default PageBody