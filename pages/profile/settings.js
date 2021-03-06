import { signIn, useSession } from 'next-auth/client'
import useTranslation from 'next-translate/useTranslation'
import Head from 'next/head'
import LoadingView from '../../components/LoadingView'
import PageBody from '../../components/PageBody'
import { DEFAULT_PHONE_COUNTRY, NO_PROFILE_PIC, PROFILE_PHOTO_SIZE_SM, TITLE_SEPARATOR, USERLINK_PREFIX, USERNAME_VALIDITY_REGEX } from '../../utils/constants'

import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { useEffect, useState } from 'react'

import InputBox from '../../views/InputBox'

import { imageFileToUrl, notSet, userName } from '../../utils/functions'
import Link from '../../views/Link'


import { apiPostJson, apiPostFileJson } from '../../api/client'

import useFormRules, { formFieldSet, formFieldGet, formRulesKeys, getCharsRem, formRules } from '../../hooks/form-rules'
import Loading from '../../views/Loading'
import Overlay from '../../components/Overlay'
import Swal from 'sweetalert2'
import ImageView from '../../views/ImageView'

const $ = require('jquery')

const TABS = {
    profile: 0,
    password: 1
}
export default function Settings() {
    const { t, lang } = useTranslation('settings')
    // Fetch the user client-side
    const [ session, loading ] = useSession()

    const [tab, setTab] = useState(TABS.profile)

    const formRule = useFormRules(formRulesKeys.ProfileSettings)

    const getDefaultValues = () => {
        return {
            name: session?.user?.name || "" , 
            username: session?.user?.username || "", 
            telephone: session?.user?.telephone || "", 
            bio: session?.user?.bio || "", 
            email: session?.user?.email || ""
        }
    }
    
    const [name, setName] = useState("")
    const [nameError, setNameError] = useState("")

    const [username, setUsername] = useState("")
    const [usernameError, setUsernameError] = useState("")

    const [telephone, setTelephone] = useState("")
    const [telephoneError, setTelephoneError] = useState("")

    const [email, setEmail] = useState("")
    const [emailError, setEmailError] = useState("")

    const [bio, setBio] = useState("")
    const [bioError, setBioError] = useState("")

    const [updateProgress, setUpdateProgress] = useState(false)

    const [photoState, setPhotoState] = useState("")


    var formHasError = false
    const fieldsMap = {
        name: {
            clearError: () => {
                setNameError('')
            },
            set: value => {
                formFieldSet(value, formRule.name, null, newValue => {
                    if(!notSet(newValue)) {
                        setName(newValue)
                    }
                })
            },
            get: () => {
                return formFieldGet(name, formRule.name, null, (error, valueLength, expectedLength) => {
                    if(error && error.length > 0) {
                        formHasError = true
                        setNameError(t(error))
                    }
                })
            },
            setError: error => {
                formHasError = true
                setNameError(t(error))
            }
        },
        username: {
            clearError: () => {
                setUsernameError('')
            },
            set: value => {
                if(value.trim().startsWith(USERLINK_PREFIX)) return
                formFieldSet(value, formRule.username, null, newValue => {
                    if(!notSet(newValue)) {
                        setUsername(newValue)
                    }
                })
            },
            get: () => {
                return formFieldGet(username, formRule.username, null, (error, valueLength, expectedLength) => {
                    if(error && error.length > 0) {
                        formHasError = true
                        setUsernameError(t(error))
                    }
                })
            },
            setError: error => {
                formHasError = true
                setUsernameError(t(error))
            }
        },
        bio: {
            clearError: () => {
                setBioError('')
            },
            set: value => {
                formFieldSet(value, formRule.bio, null, newValue => {
                    if(!notSet(newValue)) {
                        setBio(newValue)
                    }
                })
            },
            get: () => {
                return formFieldGet(bio, formRule.bio, null, (error, valueLength, expectedLength) => {
                    if(error && error.length > 0) {
                        formHasError = true
                        setBioError(t(error))
                    }
                })
            },
            setError: error => {
                formHasError = true
                setBioError(t(error))
            }
        },
        telephone: {
            clearError: () => {
                setTelephone('')
            },
            set: value => {setTelephone(value);/*
                formFieldSet(value, formRule.telephone, null, newValue => {
                    if(!notSet(newValue)) {
                        setTelephone(newValue)
                        console.log("RESET:", "tel2", newValue);
                    }
                })*/
            },
            get: () => {
                return formFieldGet(telephone, formRule.telephone, null, (error, valueLength, expectedLength) => {
                    if(error && error.length > 0) {
                        formHasError = true
                        setTelephoneError(t(error))
                    }
                })
            },
            setError: error => {
                formHasError = true
                setTelephoneError(t(error))
            }
        },
    }
    const handleChange = e => {
        fieldsMap[e.target.name].set(e.target.value)
    }
    const reset = values => {
        for (const [key, value] of Object.entries(fieldsMap)) {
            if(value.set && !notSet(values[key])) value.set(values[key])
        }
    }

    useEffect(() => {
        reset(getDefaultValues())
        setPhotoState(session?.user?.image)

    }, [session])
    
    

    // Server-render loading state
    if (!session && loading) {
        return(
            <div>
                <Head>
                    <title>{t('header:settings')} {TITLE_SEPARATOR} {t('header:site-name')}</title>
                </Head>
                <PageBody navType={PageBody.vars.NAV_TYPES.others}>
                    <LoadingView title={t('header:settings')} message={t('common:fetching-user-data-message')} />
                </PageBody>
            </div>
        )
    }

    //take the user to the lofin page if the session is empty
    if (!session && !loading) {
        signIn()
    }

    const onSubmit = async e => {
        e.preventDefault()

        var form = {}
        for (const [key, value] of Object.entries(fieldsMap)) {
            form[key] = value.clearError()
            var cleaned = await value.get()
            if(cleaned) {
                form[key] = cleaned
                
            }
        }
        
        if(!formHasError) {
            console.log("FORM:", form)
            var newForm = {...form}
            var removed = 0
            for(const [key, value] of Object.entries(form)) {
                if(value?.length == 0 || getDefaultValues()[key] && getDefaultValues()[key] == value) {
                    delete newForm[key]
                    removed += 1
                }
            }
            
            if(removed == Object.keys(form).length) return
            form = newForm

            setUpdateProgress(true)
            apiPostJson('update-profile', form, lang)
            .then (({data}) => {
                setUpdateProgress(false)
                Swal.fire('', t('update-success-message'), 'success')
            })
            .catch(({request, response, message}) => {
                setUpdateProgress(false)
                if(response.status) {
                    if(response?.data.error) {
                        Swal.fire('', t(response.data.error), 'error')

                    } else if(response?.data.errors) {
                        //Set into states for fields to display their individial errors
                        //Swal.fire('', t(JSON.stringify(response.data.errors)), 'error')
                        for( const [key, value] of Object.entries(response.data.errors)) {
                            if(fieldsMap[key]) {
                                fieldsMap[key].setError(value)
                            }
                        }

                    } else {
                        Swal.fire('',  t('common:error-try-again'), 'error')
                    }

                } else if(request) {
                    Swal.fire('', t('common:network-error'), 'error')

                } else {
                    console.log("apiPostJson('products')", "message", message)
                }
                
            })
        }
        
    }

    const profilePhotoMenu = () => {
        if(!session?.user?.image) {
            uploadProfilePhoto()

        } else {
            Swal.fire({
                input: 'select',
                showCancelButton: 'true',
                cancelButtonText: t('common:cancel'),
                confirmButtonText: t('common:yes'),
                inputOptions: {
                    'upload': t("upload-profile-photo"),
                    'remove': t("remove-profile-photo")
                }
            })
            .then(r => {
                console.log("Photo:", r)
                if(r.value) {
                    if(r.value == 'upload') {
                        uploadProfilePhoto()

                    } else if(r.value == 'remove') {
                        removeProfilePhoto()
                    }
                }
            })
        }
    }

    const removeProfilePhoto = () => {
        apiPostJson('remove-profile-photo', {}, lang)
        .then (({data}) => {
            setPhotoState("")
            setUpdateProgress(false)
            Swal.fire('', t('removed-success-message'), 'success')
        })
        .catch(({request, response, message}) => {
            setUpdateProgress(false)
            if(response.status) {
                if(response?.data.error) {
                    Swal.fire('', t(response.data.error), 'error')

                } else {
                    Swal.fire('',  t('common:error-try-again'), 'error')
                }

            } else if(request) {
                Swal.fire('', t('common:network-error'), 'error')

            } else {
                console.log("removeProfilePhoto", "message", message)
            }
            
        })
    }
    const uploadProfilePhoto = () => {
        $("#file").trigger('click')
    }

    const fileHandler = e => {
        var file = e.target.files[0]
        setUpdateProgress(true)
        apiPostFileJson('upload-profile-photo', [file], {}, lang)
        .then (({data}) => {
            imageFileToUrl(file, url => {
                setPhotoState(url)
                setUpdateProgress(false)
                
                Swal.fire('', t('upload-success-message'), 'success')
            })
        })
        .catch(({request, response, message}) => {
            setUpdateProgress(false)
            if(response.status) {
                if(response?.data.error) {
                    Swal.fire('', t(response.data.error), 'error')

                } else {
                    Swal.fire('',  t('common:error-try-again'), 'error')
                }

            } else if(request) {
                Swal.fire('', t('common:network-error'), 'error')

            } else {
                console.log("removeProfilePhoto", "message", message)
            }
            
        })
    }

    const onPasswordSubmit = async () => {
        e.preventDefault()

        
        
    }

    // Once the user request finishes, show the user
    return (
    <div>
        <Head>
            <title>{t('header:settings')} {TITLE_SEPARATOR} {t('header:site-name')}</title>
        </Head>
        <PageBody navType={PageBody.vars.NAV_TYPES.others}>
            <div className="page-content">
                <div className="container card" style={{minHeight: 400}}>
                    <div className="row h-100">

                        <div className="border-right border-bottom col-md-3 d-flex flex-row flex-md-column justify-content-around justify-content-md-start align-items-center align-items-md-start">
                            <div onClick={() => setTab(TABS.profile)} className="action p-3 w-100" style={{borderLeft: tab == TABS.profile? '2px solid #000' : 0}}>
                                <div className={`h3 my-0 text-cap ${tab != TABS.profile? 'opacity-2' : ''}`}>
                                    {t('edit-profile')}
                                </div>
                            </div>
                            <div onClick={() => setTab(TABS.password)} className="d-nones action p-3 w-100" style={{borderLeft: tab == TABS.password? '2px solid #000' : 0}}>
                                <div className={`h3 my-0 text-cap ${tab != TABS.password? 'opacity-2' : ''}`}>
                                    {t('change-password')}
                                </div>
                            </div>
                        </div>

                        <div className="col-md-9 p-3 border">
                            <form onSubmit={onSubmit} className={`pb-5 ${tab == TABS.profile? '' : 'd-none'}`}>
                                <div className="d-flex justify-content-between align-items-center margin-b-25">
                                    <div className="h3 b text-cap">{t('edit-profile')}</div>
                                    <button onClick={(e) => {
                                        e.preventDefault(); reset(getDefaultValues())
                                    }} className="btn btn-outline-success btn-sm text-cap">{t('common:reset-form')}</button>
                                </div>

                                <InputBox className="row form-group">
                                    <div className="col-3 align-self-end">
                                        <div className="py-1 pl-1 d-flex justify-content-end align-items-center">
                                            <ImageView isDefaultHost className="profile-image-round" width={PROFILE_PHOTO_SIZE_SM} height={PROFILE_PHOTO_SIZE_SM} src={photoState || NO_PROFILE_PIC} />
                                            <input onChange={fileHandler} type="file" id="file" className="d-none" />
                                        </div>
                                    </div>
                                    <div className="col-9">
                                        <div className=" my-0">
                                            {userName(session?.user?.username, session?.user?.id)}
                                        </div>
                                        <div>
                                            <Link className="text-cap my-0" onClick={profilePhotoMenu} href="#">
                                                {t('change-profile-photo')}
                                            </Link>
                                        </div>
                                    </div>
                                </InputBox>

                                <div className="form-group row">
                                    <label for="name" className="required col-sm-3 col-form-label">{t('name')}:</label>
                                    <InputBox error={nameError} className="col-sm-9">
                                        <input onChange={handleChange} value={name} placeholder={t('name-placeholder')} id="name" name="name" type="text" className="form-control" />
                                        <small class="form-text text-muted">{t('common:chars-remaining', {count: getCharsRem(formRule.name.maxChar[0],  name?.length)})}</small>
                                    </InputBox>
                                </div>

                                <div className="form-group row">
                                    <label for="username" className="col-sm-3 col-form-label">{t('username')}:</label>
                                    <InputBox error={usernameError} className="col-sm-9">
                                        <input onChange={handleChange} value={username} placeholder={t('username-placeholder')} id="username" name="username" type="text" className="form-control" />
                                        <small class="form-text text-muted">{t('common:chars-remaining', {count: getCharsRem(formRule.username.maxChar[0],  username?.length)})}</small>
                                    </InputBox>
                                </div>

                                <div className="form-group row">
                                    <label for="bio" className="col-sm-3 col-form-label">{t('bio')}:</label>
                                    <InputBox error={bioError} className="col-sm-9">
                                        <textarea onChange={handleChange} value={bio} rows="3" placeholder={t('bio-placeholder')} id="bio" name="bio" type="text" className="form-control" />
                                        <small class="form-text text-muted">{t('common:chars-remaining', {count: getCharsRem(formRule.bio.maxChar[0],  bio?.length)})}</small>
                                    </InputBox>
                                </div>

                                <div className="form-group row mb-5">
                                    <label for="telephone" className="col-sm-3 col-form-label">{t('tel')}:</label>
                                    <InputBox error={telephoneError} className="col-sm-9">
                                        <PhoneInput
                                            name="telephone"
                                            country={DEFAULT_PHONE_COUNTRY}
                                            value={telephone}
                                            onChange={phone => setTelephone(phone)}
                                            placeholder={t('tel-placeholder')}
                                            enableSearch={true}
                                        />
                                    </InputBox>
                                </div>

                                <div className="form-group row mt-5">
                                    <div className="col-sm-3 col-form-label"></div>
                                    <div className="col-sm-9">
                                        <button type="submit" className="btn btn-primary text-cap">{t('common:submit-text')}</button>
                                    </div>
                                </div>
                            </form>
                            <form onSubmit={onPasswordSubmit} className={`pb-5 ${tab == TABS.password? '' : 'd-none'}`}>
                                <div className="d-flex justify-content-between align-items-center margin-b-25">
                                    <div className="h3 b text-cap">{t('change-password')}</div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <Overlay show={updateProgress} outsideClickHandler={null} hasBg>
                <Loading
                    type={Loading.TYPES.ballTrinagle}
                    color="#fea136"
                    height={50}
                    width={50}
                    visible={true}
                />
            </Overlay>
        </PageBody>
    </div>
    )
}