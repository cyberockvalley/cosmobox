import Document, { Html, Head, Main, NextScript } from 'next/document'
import BodySvg from '../components/BodySvg'


class SiteDocument extends Document {
    render() {
        return (
            <Html>
                <Head>
                    <link rel="stylesheet" media="all" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" />
                    <link rel="stylesheet" media="all" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossOrigin="anonymous" />
                    <link rel="stylesheet" media="all" href="/res/css/global.min.css" />
                    <link rel="stylesheet" media="all" href="/res/css/nprogress.min.css" />
                    <link rel="icon" type="image/x-icon" href={`/logo-cosmobox.png`} />
                    <link rel="apple-touch-icon" href={`/logo-cosmobox.png`} />
                </Head>
                <body>
                    <BodySvg />
                    <Main />
                    <NextScript />
                    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossOrigin="anonymous"></script>
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossOrigin="anonymous"></script>
                    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossOrigin="anonymous"></script>
                    <script src="/res/js/global.js"></script>
                </body>
            </Html>
        )
    }
}

export default SiteDocument