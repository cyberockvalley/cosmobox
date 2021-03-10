import useTranslation from "next-translate/useTranslation"
import Link from "../../views/Link"
import { useRouter } from "next/router"

import { FileDrop } from 'react-file-drop'
import { useState } from "react"
import LocaleSwitch from "./LocaleSwitch"
import Swal from "sweetalert2"

import { signIn, signOut, useSession } from 'next-auth/client'
import LoadingBalls from "../animations/LoadingBalls"
import getPageLinks from "../../hooks/page-links"
import { getFullUrl, userLink } from "../../utils/functions"
import { Text } from "@chakra-ui/react"
import ImageView from "../../views/ImageView"
import { NO_PROFILE_PIC, PROFILE_PHOTO_SIZE_SM, THEME } from "../../utils/constants"

const { signInPageLink } = getPageLinks()

const $ = require('jquery')

export default function NavBar({noSearchBar}) {
    const { t, lang } = useTranslation('header')
    const [session, loading] = useSession()

    const router = useRouter()
    
    const { s } = router.query
    const [collapsed, setCollapsed] = useState()
    const [search, setSearch] = useState(s || "")

    const [hideStateLinks, setHideStateLinks] = useState(false)

    const [totalMessages, setTotalMessages] = useState(0)

    const handleChange = (e) => {
      setSearch(e.target.value)
    }
  
    const handleSearch = (e) => {
      e.preventDefault()
      if(search.length > 0) {
        closeNavbar();
        router.push(`/search/${search.trim()}`)
      }
    }
  
    const signOutWarning = e => {
      e.preventDefault()
      Swal.fire({
        text: t('sign-out-warning'), 
        icon: 'warning',
        confirmButtonText: t('common:yes'),
        cancelButtonText: t('common:cancel'),
        showCancelButton: true
      })
      .then(result => {
        if(result.isConfirmed) {
          signOut()
        }
      })
  
    }
    const toggleNavbar = () => {
      setCollapsed(!collapsed)
    }
    const closeNavbar = () => {
      if (!collapsed) {
        toggleNavbar();
      }
    }

    var stateLinks;
    if(!session && loading) {
      stateLinks = <LoadingBalls />

    } else if(!session) {
      //if the user is not logged in
      stateLinks = (
      <ul className={`navbar-nav navbar-right ${hideStateLinks? 'd-md-none' : ''}`}>
        <li className="nav-item">
          <Link href="/sign-in" className="nav-link text-cap" onClick={e => {
            e.preventDefault()
            signIn()
          }}>
            {t('sign-in')}
          </Link>
        </li>
        <li className="nav-item">
          <Link href="/sign-up" className="nav-link text-cap">
            {t('sign-up')}
          </Link>
        </li>
        <li className="nav-item dropdown">
          <LocaleSwitch />
        </li>
        <li className="nav-item ml-3">
          <Link href="/sign-in" className="nav-item btn btn-primary navbar-btn text-cap" role="button" onClick={e => {
            e.preventDefault()
            signIn()
          }}>
            {t('sell')}
          </Link>
        </li>
      </ul>
      )

    } else {
      stateLinks = (
      <ul className={`navbar-nav navbar-right ${hideStateLinks? 'd-md-none' : ''}`}>
        <li className="nav-item dropdown">
          <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <ImageView isDefaultHost className="profile-image-round" style={{display: "inline", width: PROFILE_PHOTO_SIZE_SM, height: PROFILE_PHOTO_SIZE_SM, maxWidth: PROFILE_PHOTO_SIZE_SM, maxHeight: PROFILE_PHOTO_SIZE_SM}} width={PROFILE_PHOTO_SIZE_SM} height={PROFILE_PHOTO_SIZE_SM} src={session.user?.image || NO_PROFILE_PIC} />
          </a>
          <div className="dropdown-menu" aria-labelledby="navbarDropdown">
            <Link href={userLink(session.user.username, session.user.id)} className="dropdown-item text-cap">
              <div className="d-flex align-items-center">
                <i className="fa fa-user-circle margin-r-5"></i>
                <div>{t('profile')}</div>
              </div>
            </Link>
            <Link href={`${userLink(session.user.username, session.user.id)}?saves=1`} className="dropdown-item text-cap">
              <div className="d-flex align-items-center">
                <i className="fa fa-heart margin-r-5"></i>
                <div>{t('saved')}</div>
              </div>
            </Link>
            <Link href="/profile/messages" className="dropdown-item text-cap">
              <div className="d-flex align-items-center">
                <i className="fa fa-envelope margin-r-5"></i>
                <div>{t('messages')}</div>
              </div>
            </Link>
            <Link href="/profile/settings" className="dropdown-item text-cap">
              <div className="d-flex align-items-center">
                <i className="fa fa-cog margin-r-5"></i>
                <div>{t('settings')}</div>
              </div>
            </Link>
            
            <div className="dropdown-divider"></div>

            <Link href="/api/auth/signout" onClick={signOutWarning} className="dropdown-item text-cap">
              {t('sign-out')}
            </Link>
          </div>
        </li>
        <li className="nav-item dropdown">
          <LocaleSwitch />
        </li>
        <li className="nav-item ml-3">
          <Link className="nav-item btn btn-primary navbar-btn text-upper" href="/sell" role="button">{t('sell')}</Link>
        </li>
      </ul>
      )
    }
    
    return(
    <nav id="banner" className="card-shadow navbar navbar-expand-md navbar-dark nav-bg-dark fixed-top">
        <div className="d-flex flex-grow-1 align-items-center">
          <Link href="/" className="navbar-brand d-flex align-items-center">
            <ImageView width="40px" height="40px" src={`/logo-cosmobox.png`} />
            <div className="ml-1">
              {t('site-name')}
            </div>
          </Link>
        </div>
        <button
          className="navbar-toggler order-0"
          type="button"
          data-toggle="collapse"
          data-target="#navbar7"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div
          className="navbar-collapse collapse flex-shrink-1 flex-grow-0"
          id="navbar7"
        >
          <form className={`mr-2 my-auto w-100 d-inline-block ${noSearchBar? "opacity-0" : ""}`} onSubmit={handleSearch} onMouseEnter={() => setHideStateLinks(!noSearchBar)} onMouseLeave={() => setHideStateLinks(false)}>
            <div className="input-group">
              <input
                type="text"
                value={search}
                onChange={handleChange}
                className="form-control border border-right-0"
                placeholder={`${t('search-placeholder')}...`}
              />
              <span className="input-group-append">
                <button
                  className="btn btn-outline-light border border-left-0"
                  type="submit"
                >
                  <i className="fa fa-search" />
                </button>
              </span>
            </div>
          </form>
          {stateLinks}
        </div>
    </nav>
    )
}