
import { FacebookLoginButton, GoogleLoginButton } from "react-social-login-buttons";

import { signIn } from 'next-auth/client'
import useTranslation from "next-translate/useTranslation";

export default function useProviderButtons(isSignUp) {

    const { t } = useTranslation('auth')

    return {
        facebook: <FacebookLoginButton onClick={() => signIn('facebook')}>{t(isSignUp? 'fb-sign-up-btn-text' : 'fb-sign-in-btn-text')}</FacebookLoginButton>,
        google: <GoogleLoginButton  onClick={() => signIn('google')}>{t(isSignUp? 'gg-sign-up-btn-text' : 'gg-sign-in-btn-text')}</GoogleLoginButton>
    }
}