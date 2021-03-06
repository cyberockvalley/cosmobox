import { signIn } from 'next-auth/client'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import useProviderButtons from '../hooks/provider-buttons'
import styles from '../styles/Auth.module.css'
import { PASSWORD_VALIDITY_TYPES, PASSWORD_VALIDITY_TYPES_USED, TEXT_BREAK_POINT } from '../utils/constants'
import { regexValidation } from '../utils/functions'
import InputBox from '../views/InputBox'

export default function SignUp({toggleAuth}) {

    const { t } = useTranslation('auth')

    const providerButtons = useProviderButtons(true)

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [firstname, setFirstname] = useState('')
    const [lastname, setLastname] = useState('')

    const router = useRouter()
    const { signup_username_error, signup_password_error, signup_firstname_error, signup_lastname_error, signup_error} = router.query

    //for errors
    const [usernameError, setUsernameError] = useState(signup_username_error || '')
    const [passwordError, setPasswordError] = useState(signup_password_error || '')
    const [firstnameError, setFirstnameError] = useState(signup_firstname_error || '')
    const [lastnameError, setLastnameError] = useState(signup_lastname_error || '')
    const [hasError, setHasError] = useState(false)
    

    useEffect(() => {
        if(signup_username_error && signup_username_error.length > 0) {
            setUsernameError(signup_username_error)
            setHasError(true)
        }
        if(signup_password_error && signup_password_error.length > 0) {
            setPasswordError(signup_password_error)
            setHasError(true)
        }
        if(signup_firstname_error && signup_firstname_error.length > 0) {
            setFirstnameError(signup_firstname_error)
            setHasError(true)
        }
        if(signup_lastname_error && signup_lastname_error.length > 0) {
            setLastnameError(signup_lastname_error)
            setHasError(true)
        }
    }, [signup_username_error, signup_password_error, signup_firstname_error, signup_lastname_error])

    const handleSubmit = e => {
        e.preventDefault()

        //disable errors
        setUsernameError('')
        setPasswordError('')
        setFirstnameError('')
        setLastnameError('')

        var hasError = false
        if(username.length == 0) {
            setUsernameError(t('error-enter-email'))
            hasError = true
        }

        if(password.length == 0) {
            setPasswordError(t('PASS_ERROR_EMPTY'))
            hasError = true

        } else {
            const validity = regexValidation(password, PASSWORD_VALIDITY_TYPES_USED, PASSWORD_VALIDITY_TYPES)
            if(!validity.isValid) {
                var errors = ""
                validity.errors.forEach(error => {
                    errors += `${t(error)}${TEXT_BREAK_POINT}`
                });
                setPasswordError(errors)
            }
        }

        if(firstname.length == 0) {
            setFirstnameError(t('error-enter-firstname'))
            hasError = true
        }

        setHasError(hasError)
        if(!hasError) {
            signIn('sign-up-credentials', { username: username, password: password, firstname: firstname, lastname: lastname})

        }
    }

    return(
        <div className={`${styles['form-wrapper']}`}>
            <div className="d-flex justify-content-between align-items-start">
                <div className="d-flex flex-column justify-content-center align-items-center">
                    <h3 className={styles["title"]}>
                        {t('header:sign-up')}
                    </h3>
                    <div className={styles["sub-title"]}>{t('sign-up-subtitle')}</div>
                </div>
                <div className="d-flex flex-column justify-content-start align-items-center fa fa-2x fa-times action" onClick={() => toggleAuth()}></div>
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
                <div className="form-row form-group">
                    <InputBox className="col" error={firstnameError}>
                        <input type="text" className="form-control form-control-lg" placeholder={t('firstname')} onChange={e => {setFirstname(e.target.value)}} />
                    </InputBox>
                    <InputBox className="col" error={lastnameError}>
                        <input type="text" className="form-control form-control-lg" placeholder={t('lastname-optional')} onChange={e => {setLastname(e.target.value)}} />
                    </InputBox>
                </div>
                <InputBox className="form-group" error={usernameError}>
                    <input type="email" className="form-control form-control-lg" name="email" placeholder={t('email')} onChange={e => {setUsername(e.target.value)}} />
                </InputBox>
                <InputBox className="form-group" error={passwordError} breakPoint={TEXT_BREAK_POINT} breakPointTextPrefix="***">
                    <input type="password" className="form-control form-control-lg" name="password" placeholder={t('password')} onChange={e => {setPassword(e.target.value)}} />
                </InputBox>

                <button type="submit" className="btn btn-primary text-cap btn-lg w-100">{t('header:sign-up')}</button>
            </form>
        </div>
    )
}