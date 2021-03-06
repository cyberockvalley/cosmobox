import { Box } from "@chakra-ui/react"
import useTranslation from "next-translate/useTranslation"
import { FACEBOOK_PAGE_LINK, INSTAGRAM_PAGE_LINK, TWITTER_PAGE_LINK } from "../utils/constants"
import Link from "../views/Link"


export default function Footer() {
    const { t } = useTranslation('footer')

    return(
        <footer style={{width: "100%"}}>
            <Box as="div" className="footer" w="100%" px={{base: "20px", md: "20%"}}>
                <div className="footer-title">{t('list-ad')} {t('header:site-name')}</div>
                <div className="footer-grids">
                    <div className="footer-grid">
                        <div className="fa fa-check-square" style={{fontSize: '6em'}}></div>
                        <div style={{marginRight: "10px"}}>{t('easy')}</div>
                    </div>
                    <div className="footer-grid">
                        <div className="fa fa-clock-o" style={{fontSize: '6em'}}></div>
                        <div>{t('fast')}</div>
                    </div>
                    <div className="footer-grid">
                        <div className="fa fa-lock" style={{fontSize: '6em'}}></div>
                        <div>{t('secure')}</div>
                    </div>
                </div>
            </Box>
            <div className="row footer-color-grid-wrapper">
                <div className="col-1 footer-color-grid"></div>
                <div className="col-1 footer-color-grid"></div>
                <div className="col-1 footer-color-grid"></div>
                <div className="col-1 footer-color-grid"></div>
                <div className="col-1 footer-color-grid"></div>
                <div className="col-1 footer-color-grid"></div>
                <div className="col-1 footer-color-grid"></div>
                <div className="col-1 footer-color-grid"></div>
                <div className="col-1 footer-color-grid"></div>
                <div className="col-1 footer-color-grid"></div>
                <div className="col-1 footer-color-grid"></div>
                <div className="col-1 footer-color-grid"></div>
            </div>
            <div className="footer-links-wrapper container">
                <div className="footer-links-external">
                    <a target="_blank" href={FACEBOOK_PAGE_LINK}>
                        <i className="fa fa-2x fa-facebook"></i>
                    </a>
                    <a target="_blank" href={INSTAGRAM_PAGE_LINK}>
                        <i className="fa fa-2x fa-instagram"></i>
                    </a>
                    <a target="_blank" href={TWITTER_PAGE_LINK}>
                        <i className="fa fa-2x fa-twitter"></i>
                    </a>
                </div>
                <div className="footer-links-internal container">
                    <div className="footer-links-internal-box">
                        <Link href="/about">
                            {t("about-us")}
                        </Link>
                        <Link href="/contact">
                            {t("contact-us")}
                        </Link>
                        <Link href="/privacy">
                            {t("privacy-policy")}
                        </Link>
                        <Link href="/tos">
                            {t("tos")}
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}