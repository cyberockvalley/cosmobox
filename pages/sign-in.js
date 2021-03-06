import useTranslation from "next-translate/useTranslation";
import Head from "next/head";
import PageBody from "../components/PageBody";
import { TITLE_SEPARATOR } from "../utils/constants";
import Link from "../views/Link";

import styles from '../styles/Auth.module.css'
import { useEffect, useState } from "react";
import Overlay from "../components/Overlay";
import SignUp from "../components/SignUp";

import Swal from "sweetalert2";

import { signIn } from 'next-auth/client'
import useProviderButtons from "../hooks/provider-buttons";
import InputBox from "../views/InputBox";
import { useRouter } from "next/router";

import { useSession } from 'next-auth/client'
import getPageLinks from "../hooks/page-links";
import LoadingView from "../components/LoadingView";

export default function Auth({ isSignUp }) {
    const [session, loading] = useSession()
    useEffect(() => {

    }, [session])

    const { t } = useTranslation('auth')

    const providerButtons = useProviderButtons(false)

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')


    const router = useRouter()
    const {show_sign_up, username_error, password_error, error, signup_error, callbackUrl} = router.query

    const [showSignUp, setShowSignUp] = useState(isSignUp || (show_sign_up && Boolean(show_sign_up)))

    //for errors
    const [usernameError, setUsernameError] = useState(username_error || '')
    const [passwordError, setPasswordError] = useState(password_error || '')
    const [hasError, setHasError] = useState(false)
    

    useEffect(() => {
        //console.log("SignUp", show_sign_up, show_sign_up && Boolean(show_sign_up))
        if(show_sign_up && Boolean(show_sign_up)) {
            setShowSignUp(true)
        }
        if(username_error && username_error.length > 0) {
            setUsernameError(username_error)
            setHasError(true)
        }
        if(password_error && password_error.length > 0) {
            setPasswordError(password_error)
            setHasError(true)
        }
        if(error && error.length > 0) {
            Swal.fire('', error, 'error')
    
        }
        
        if(signup_error && signup_error.length > 0) {
            Swal.fire('', signup_error, 'error')
            .then(() => {
                setShowSignUp(true)
            })
    
        }
    }, [username_error, password_error, error, show_sign_up, signup_error])


    const handleSubmit = e => {
        e.preventDefault()

        //disable errors
        setUsernameError('')
        setPasswordError('')

        var hasError = false
        if(username.length == 0) {
            setUsernameError(t('error-enter-email'))
            hasError = true
        }

        if(password.length == 0) {
            setPasswordError(t('error-enter-password'))
            hasError = true
        }

        setHasError(hasError)
        if(!hasError) {
            signIn('sign-in-credentials', { username: username, password: password })

        }
    }

    const toggleAuth = e => {
        if(e) e.preventDefault()
        setShowSignUp(!showSignUp)
    }
    
    if(session) {
        const profilePageLink = getPageLinks(session?.user)?.profilePageLink
        if(callbackUrl) {
            router.replace(callbackUrl)

        } else {
            router.replace(profilePageLink)
        }

    }

    if (session || loading) {
        return(
            <div>
                <Head>
                    <title>{t(isSignUp? 'header:sign-up' : 'header:sign-in')} {TITLE_SEPARATOR} {t('header:site-name')}</title>
                </Head>
                <PageBody navType={PageBody.vars.NAV_TYPES.others} excludeHeader>
                    <LoadingView title={t(isSignUp? 'header:sign-up' : 'header:sign-in')} />
                </PageBody>
            </div>
        )
    }
    

    return(
        <div>
            <Head>
                <title>{t(isSignUp? 'header:sign-up' : 'header:sign-in')} {TITLE_SEPARATOR} {t('header:site-name')}</title>
            </Head>
            <PageBody navType={PageBody.vars.NAV_TYPES.others} excludeHeader>
                <div className="row page-content no-header">
                    <div className="col-12 col-sm-6 p-20 d-flex flex-column justify-content-center align-items-center">
                        <h1>
                            <Link className="navbar-brand" href="/">
                                <span>{t('header:site-name')}</span>
                            </Link>
                        </h1>
                        <h2>{t('common:site-desc')}</h2>
                    </div>
                    <div className="col-12 col-sm-6 flex-column d-flex justify-content-center align-items-center">
                        <div className={`${styles['form-wrapper']}`}>
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex flex-column justify-content-center align-items-center">
                                    <h3 className={styles["title"]}>
                                        {t('header:sign-in')}
                                    </h3>
                                </div>
                                <div className="d-flex flex-column justify-content-start align-items-center fa fa-2x fa-user-circle"></div>
                            </div>

                            <hr />

                            {
                                Object.values(providerButtons).length == 0? null :
                                <>
                                    <div className="oauth-buttons">
                                        {
                                            Object.values(providerButtons).map(button => (
                                                <div>{button}</div>
                                            ))
                                        }
                                    </div>

                                    <div className="d-none left-right-divider text-upper">{t('or')}</div>
                                </>
                            }

                            <form className={`d-none ${hasError? 'needs-validation' : ''}`} onSubmit={handleSubmit}>
                                
                                <InputBox className="form-group" error={usernameError}>
                                    <input type="email" className={`form-control form-control-lg`} name="email" placeholder={t('email')} onChange={e => {setUsername(e.target.value)}} />
                                </InputBox>

                                <InputBox className="form-group" error={passwordError}>
                                    <input type="password" className={`form-control form-control-lg`} name="password" placeholder={t('password')} onChange={e => {setPassword(e.target.value)}} />
                                </InputBox>

                                <button type="submit" className="btn btn-primary text-cap btn-lg w-100">{t('header:sign-in')}</button>

                                <div className="pad-10">
                                    <Link href="/account-recovery">
                                        {t('forgot-pass')}
                                    </Link>
                                </div>
                            </form>
                        </div>
                        <div className={styles['form-wrapper-bottom']}>
                            {t('no-account-yet')} <Link onClick={toggleAuth} href="">{t('header:sign-up')}</Link>
                        </div>
                    </div>
                </div>
            </PageBody>
            <Overlay show={showSignUp} allowScroll outsideClickHandler={isSignUp? null : () => {setShowSignUp(false)}}>
                <div className="margin-20">
                    <SignUp toggleAuth={toggleAuth} />
                </div>
            </Overlay>
        </div>
    )
}

//isSignUp props is passed from the sign-up page when the 
//sign-up page returns this sign-in page component as its component