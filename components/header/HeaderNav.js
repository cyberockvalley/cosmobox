import useTranslation from "next-translate/useTranslation";
import Link from "../../views/Link";
import LocaleSwitch from "./LocaleSwitch";


const HeaderNav = ({user}) => {
  const { t, lang } = useTranslation('header')
  return (
    <nav
      className="navbar navbar-expand-md navbar-dark fixed-top"
      id="banner"
    >
      <div className="container">
        {}
        <Link className="navbar-brand" href="/">
          <span>{t('site-name-break-1')}</span> {t('site-name-break-2')}
        </Link>
        {}
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#collapsibleNavbar"
        >
          <span className="navbar-toggler-icon" />
        </button>
        {}
        <div className="collapse navbar-collapse" id="collapsibleNavbar">
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <a className="nav-link text-cap" href="/sell">
                {t('sell')}
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-cap" href="/sign-in">
                {t('sign-in')}
              </a>
            </li>
            <li className="nav-item dropdown">
              <LocaleSwitch />
            </li>
            <li className="nav-item">
              <Link className="nav-item btn btn-primary navbar-btn text-upper" href={!user? "/sign-up" : "/upload"} role="button">{t(!user? 'join' : 'upload')}</Link>
            </li>
          </ul>
          
        </div>
      </div>
    </nav>
  );
}

export default HeaderNav;
