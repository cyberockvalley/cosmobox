import { Provider } from 'next-auth/client'

import Router from 'next/router'
import NProgress from 'nprogress'

import { ChakraProvider } from "@chakra-ui/react"
// 1. Import the extendTheme function
import { extendTheme } from "@chakra-ui/react"
// 2. Extend the theme to include custom colors, fonts, 
import themeFile from '../theme.json'
import { THEME } from '../utils/constants'
const colors = themeFile[THEME].colors
const theme = extendTheme({ colors })

if(process.env.NODE_ENV === 'production') {
  console.log = () => {}
}

Router.events.on('routeChangeStart', (url) => {
  console.log("ROUTE_CHANGE:", url)
  NProgress.start()
})
Router.events.on('routeChangeComplete', () => NProgress.done())
Router.events.on('routeChangeError', () => NProgress.done())

const App = ({ Component, pageProps }) => {
  const { session } = pageProps
  
  return (
    <Provider session={session}>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </Provider>
  )
}

export default App