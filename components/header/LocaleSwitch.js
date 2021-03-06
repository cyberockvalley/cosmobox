
import useTranslation from "next-translate/useTranslation";

import i18nConfig from '../../i18n'
import Link from "../../views/Link";

import ReactCountryFlag from "react-country-flag"
import { useRouter } from "next/router";
import Pagination from "../../views/Pagination";

const { locales } = i18nConfig

const LANG_NAMES = {
    en: "English",
    it: "Italiano",
    es: "Espano",
    fr: "Francias",
    ru: "Russian"
}

const FLAG_NAMES = {
    en: "US",
    it: "it",
    es: "es",
    fr: "fr",
    ru: "ru"
}

const LocaleSwitch = () => {
  const { t, lang } = useTranslation('header')
  const router = useRouter()
  return (
      <>
        <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <span>{t('change-lang')}</span> &nbsp;
            <ReactCountryFlag countryCode={FLAG_NAMES[lang]} svg />
        </a>
        <div className="dropdown-menu" aria-labelledby="navbarDropdown">
            {
                locales.map(lng => {
                    if(lng == lang) return
                    return (
                        <Link shallow={false} id={lng} href={router.asPath} locale={lng} key={lng} className="dropdown-item" style={{display: "flex", justifyContent: "space-between", alignItems: 'center'}}>
                            <div>
                                {LANG_NAMES[lng]}
                            </div> &nbsp;
                            <div>
                                <ReactCountryFlag countryCode={FLAG_NAMES[lng]} svg />
                            </div>
                        </Link>
                    )
                })
            }
        </div>
      </>
  )
}

export default LocaleSwitch