import { signIn, useSession } from 'next-auth/client'
import useTranslation from 'next-translate/useTranslation'
import Head from 'next/head'
import LoadingView from '../../components/LoadingView'
import PageBody from '../../components/PageBody'
import { DB_PHOTOS_SEPERATOR, LISTING_BOOSTERS, PAYPAL_CLIENT_ID, CURRENCY_CODE, TITLE_SEPARATOR } from '../../utils/constants'


import InputBox from '../../views/InputBox'
import { useEffect, useRef, useState } from 'react'
import useFormRules, { formFieldSet, formFieldGet, getCharsRem } from '../../hooks/form-rules'
import { FileDrop } from 'react-file-drop'

import styles from '../../styles/SellPhotoUpload.module.css'
import { API_REQUEST_STATUS, useApiGet, apiPostFileJson } from '../../api/client'
import { extFromUrl, extToMime, getCurrentPackageDaysLeft, isFile, isString, notSet, textEmpty, timeDiff, timeDiffTypes } from '../../utils/functions'

import dynamic from "next/dynamic";
import Swal from 'sweetalert2'
import Overlay from '../../components/Overlay'
import ProgressBar from '../../components/animations/ProgressBar'
import { useRouter } from 'next/router'

import 'react-phone-input-2/lib/style.css'
import { Badge, Box, Button, Flex, HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Radio, RadioGroup, Stack, Text, VStack } from '@chakra-ui/react'
import { PayPalButton } from 'react-paypal-button-v2'
import Loading from '../../views/Loading'
import Link from '../../views/Link'

const OrderlyListHr = dynamic(import("../../components/upload/OderlyListHr"))


const getItemStyle = (isDragging, draggableStyle, item) => ({
    ...draggableStyle
});

const listStyle = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    overflowX: 'auto',
    padding: 10,
    width: '100%'
}
const getListStyle = (isDraggingOver, itemsLength) => (itemsLength == 0? {display: 'none'} : {
    ...listStyle,
    background: isDraggingOver ? "lightblue" : "lightgrey",
});

export default function Sell({isEdit}) {
    const { t, lang } = useTranslation('sell')
    // Fetch the user client-side
    const [ session, loading ] = useSession()

    const router = useRouter()

    //the id of the product to edit
    const { product } = router.query
    const [willViewProduct, setWillViewProduct] = useState(false)

    const formRulesKeys = useFormRules()
    const formRule = useFormRules(formRulesKeys.sell)
    
    console.log("Sell:", "Query", router.query)
    
    const initValues = {
        title: "", 
        description: "", 
        price: "", 
        cat: -1,
        subcat: -1, 
        country: -1, 
        city: -1,
        photos: [],
        boosterExpiry: new Date()
    }
    console.log('Sell:', 'InitValues', initValues)
    //fetch product
    const [defaultValues, defaultValuesError, defaultValuesStatus, defaultValuesCommit, setDefaultValues] = useApiGet('product-edit-details', lang, {
        payload: {id: isEdit && product? product : null},
        initialData: {...initValues},
        requirements: {
            requiresPayloadOr: ["id"]
        },
        responseFilter: responseData => {
            console.log("Sell:", "responseFilter", responseData)
            const {title, description, price, cat, subcat, country, city, photos, boosterExpiry} = responseData
            var processedPhotos = typeof photos === "string"? photos.split(DB_PHOTOS_SEPERATOR) : []
            return {
                title: title,
                description: description,
                price: price,
                cat: cat,
                subcat: subcat,
                country: country,
                city: city,
                photos: processedPhotos,
                boosterExpiry: new Date(boosterExpiry)
            }
        }
    })
    
    console.log('Sell:', 'DefaultValues', defaultValues)

    //fetch country list
    const [countries, countriesError, countriesStatus] = useApiGet('countries', lang, {
        initialData: [],
        noLocale: true
    })
    //fetch sub category list
    const [cities, citiesError, citiesStatus, commitCitiesUpdate] = useApiGet('cities', lang, {
        payload: {state_id: null},
        initialData: [],
        requirements: {
            requiresPayloadOr: ["state_id"]
        }
    })

    //fetch category list
    const [cats, catsError, catsStatus] = useApiGet('cats', lang, {
        initialData: []
    })
    
    //fetch sub category list
    const [subcats, subcatsError, subcatsStatus, commitSubCatUpdate] = useApiGet('subcats', lang, {
        payload: {cat_id: null},
        initialData: [],
        requirements: {
            requiresPayloadOr: ["cat_id", "cat_text_id"]
        }
    })

    //cat state and subcats trigering
    const [cat, setCat] = useState(defaultValues?.cat || -1)
    useEffect(() => {
        if(!isNaN(cat) && parseInt(cat) > -1 && cat != cats[0]?.id) {
            commitSubCatUpdate({payload: {cat_id: cat}, path: ""})
        }
    }, [cat])
    //country/region state and cities trigering
    const [country, setCountry] = useState(defaultValues?.country || -1)
    useEffect(() => {
        if(!isNaN(country) && parseInt(country) > -1) {
            commitCitiesUpdate({payload: {state_id: country}, path: ""})
        }
    }, [country])

    //other form states
    const [city, setCity] = useState(defaultValues?.city || -1)
    const [subcat, setSubcat] = useState(defaultValues?.subcat || -1)

    const [title, setTitle] = useState(defaultValues?.title || "")
    const [description, setDescription] = useState(defaultValues?.description || "")
    const [price, setPrice] = useState(defaultValues?.price || -1)
    const [photos, setPhotos]  = useState(defaultValues?.photos || [])
    const [boosterExpiry, setBoosterExpiry] = useState(defaultValues?.boosterExpiry || new Date())

    useEffect(() => {console.log("Sell:", "Query!", router.query)
        var catId = cat > -1? cat : router.query.cat
        if(catId && !isNaN(catId)) {
            catId = parseInt(catId)

        } else {console.log("Sell:", "QueryCat!", router.query)
            catId = -1
        }
        var subcatId = subcat > -1? subcat : router.query.subcat
        if(subcatId && !isNaN(subcatId)) {
            subcatId = parseInt(subcatId)

        } else {
            subcatId = -1
        }
        var countryId = country > -1? country : router.query.country
        if(countryId && !isNaN(countryId)) {
            countryId = parseInt(countryId)

        } else {
            countryId = -1
        }
        var cityId = city > -1? city : router.query.city
        if(cityId && !isNaN(cityId)) {
            cityId = parseInt(cityId)

        } else {
            cityId = -1
        }
        setDefaultValues({
            ...(defaultValues || initValues),
            cat: catId,
            subcat: subcatId,
            country: countryId,
            city: cityId
        })
    }, [router])

    useEffect(() => {/*
        setTitle(defaultValues?.title)
        setPrice(defaultValues?.price)
        setDescription(defaultValues?.description)
        setCat(defaultValues?.cat)
        setSubcat(defaultValues?.subcat)
        setCountry(defaultValues?.country)
        setCity(defaultValues?.city)
        setPhotos(defaultValue.photos)*/
        setBoosterExpiry(defaultValues?.boosterExpiry || new Date())
        reset(defaultValues)
    }, [defaultValues])

    const [photoFiles, setPhotoFiles] = useState([])

    //form errors
    const [catError, setCatError] = useState("")
    const [subcatError, setSubcatError] = useState("")
    const [countryError, setCountryError] = useState("")
    const [cityError, setCityError] = useState("")
    const [titleError, setTitleError] = useState("")
    const [descriptionError, setDescriptionError] = useState("")
    const [priceError, setPriceError] = useState("")
    const [photosError, setPhotosError]  = useState("")
    const [boosterError, setBoosterError]  = useState("")

    const [booster, setBooster] = useState()
    const [showPayPalButton, setShowPayPalButton] = useState()
    const [paypalButtonReady, setPaypalButtonReady] = useState(false)
    const [boosterPaymentMade, setBoosterPaymentMade] = useState(0)

    const [catDescription, setCatDescription] = useState()

    
    var formHasError = false
    const fieldsMap = {
        title: {
            clearError: () => {
                setTitleError("")
            },
            set: value => {
                formFieldSet(value, formRule.title, null, newValue => {
                    if(!notSet(newValue)) setTitle(newValue)
                })
            },
            get: () => {
                return formFieldGet(title, formRule.title, null, (error, valueLength, expectedLength) => {
                    if(error && error.length > 0) {
                        formHasError = true
                        setTitleError(t(error))
                    }
                })
            },
            setError: error => {
                formHasError = true
                setTitleError(t(error))
            }
        },
        description: {
            clearError: () => {
                setDescriptionError("")
            },
            set: value => {
                formFieldSet(value, formRule.description, null, newValue => {
                    if(!notSet(newValue)) setDescription(newValue)
                })
            },
            get: () => {
                return formFieldGet(description, formRule.description, null, (error, valueLength, expectedLength) => {
                    if(error && error.length > 0) {
                        formHasError = true
                        setDescriptionError(t(error))
                    }
                })
            },
            setError: error => {
                formHasError = true
                setDescriptionError(t(error))
            }
        },
        price: {
            clearError: () => {
                setPriceError("")
            },
            set: value => {
                formFieldSet(value, formRule.price, null, newValue => {
                    if(!notSet(newValue)) setPrice(newValue)
                })
            },
            get: () => {
                return formFieldGet(price, formRule.price, null, (error, valueLength, expectedLength) => {
                    if(error && error.length > 0) {
                        formHasError = true
                        setPriceError(t(error))
                    }
                })
            },
            setError: error => {
                formHasError = true
                setPriceError(t(error))
            }
        },
        cat: {
            clearError: () => {
                setCatError("")
            },
            set: value => {
                formFieldSet(value, formRule.cat, null, newValue => {
                    if(!notSet(newValue)) {
                        setCat(newValue)
                    }
                })
            },
            get: () => {
                return formFieldGet(cat, formRule.cat, null, (error, valueLength, expectedLength) => {
                    if(error && error.length > 0) {
                        formHasError = true
                        setCatError(t(error))
                    }
                })
            },
            setError: error => {
                formHasError = true
                setCatError(t(error))
            }
        },
        subcat: {
            clearError: () => {
                setSubcatError("")
            },
            set: value => {
                formFieldSet(value, formRule.subcat, null, newValue => {
                    if(!notSet(newValue)) setSubcat(newValue)
                })
            },
            get: () => {
                if(cat == cats[0]?.id) return 0
                return formFieldGet(subcat, formRule.subcat, null, (error, valueLength, expectedLength) => {
                    if(error && error.length > 0) {
                        formHasError = true
                        setSubcatError(t(error))
                    }
                })
            },
            setError: error => {
                formHasError = true
                setSubcatError(t(error))
            }
        },
        country: {
            clearError: () => {
                setCountryError("")
            },
            set: value => {
                formFieldSet(value, formRule.country, null, newValue => {
                    if(!notSet(newValue)) setCountry(newValue)
                })
            },
            get: () => {
                return formFieldGet(country, formRule.country, null, (error, valueLength, expectedLength) => {
                    if(error && error.length > 0) {
                        formHasError = true
                        setCountryError(t(error))
                    }
                })
            },
            setError: error => {
                formHasError = true
                setCountryError(t(error))
            }
        },
        city: {
            clearError: () => {
                setCityError("")
            },
            set: value => {
                formFieldSet(value, formRule.city, null, newValue => {
                    if(!notSet(newValue)) setCity(newValue)
                })
            },
            get: () => {
                return formFieldGet(city, formRule.city, null, (error, valueLength, expectedLength) => {
                    if(error && error.length > 0) {
                        formHasError = true
                        setCityError(t(error))
                    }
                })
            },
            setError: error => {
                formHasError = true
                setCityError(t(error))
            }
        },
        photos: {
            clearError: () => {
                setPhotosError("")
            },
            set: (value, current) => {
                var newPhotos = [...(current? current : [])]
               
                value.forEach(photo => {
                    newPhotos.push({
                        id: `${Math.random()}`,
                        url: isString(photo)? photo : URL.createObjectURL(photo),
                        file: isFile(photo)? photo : null
                    })
                })
                
                
                formFieldSet(newPhotos, formRule.photos, null, newValue => {
                    if(!notSet(newValue)) setPhotos(newValue)

                }, (item) => {
                    /**
                     * Item is an obeject describing a photo, and this callback is used to return 
                     * the mime type of the item so that the validator can check if the mime is in the list
                     * of the valid mime types provided in this field's axccepted array types
                     * a photo object will have an id, an either a File object if it is just 
                     * a new photo not yet sendt to the server,
                     * or a url string if it has been uploaded to the server.
                     * This means we either get the mime from the file object or the extension in the url
                     * 
                     * An example of an uploaded photo,
                     * {id: "0.6865762915201352", url: "/uploads/1612452860621-1ff807f3-680X680.jpeg", file: null}
                     */
                    return item?.file?.type || extToMime(extFromUrl(item?.url))
                })
            },
            get: () => {
                return formFieldGet(photos, formRule.photos, null, (error, valueLength, expectedLength) => {
                    if(error && error.length > 0) {
                        formHasError = true
                        setPhotosError(t(error))
                    }
                })
            },
            setError: error => {
                formHasError = true
                setPhotosError(t(error))
            }
        },
        booster: {
            clearError: () => {
                setCityError("")
            },
            set: value => {console.log("onChange", "booster", value)
                if(Object.keys(LISTING_BOOSTERS).includes(value)) {
                    setBooster(value)
                }
            },
            get: () => {
                if(!booster || booster.length == 0) {
                    setBoosterError(t(formRule.booster.required))

                } else {
                    return booster
                }
            },
            setError: error => {
                formHasError = true
                setBoosterError(t(error))
            }
        }
        
    }

    const reset = values => {
        if(values) {
            for (const [key, value] of Object.entries(fieldsMap)) {
                if(value.set && !notSet(values[key])) value.set(values[key])
            }
        }
    }

    useEffect(() => {
        reset(defaultValues)
    }, [defaultValues])

    const handleChange = e => {
        fieldsMap[e.target.name].set(e.target.value)
    }


    const [uploadStatus, setUploadStatus] = useState('busy')
    const [uploadProgress, setUploadProgress] = useState(0)
    const [showUploadProgress, setShowUploadProgress] = useState(false)

    const [paypalPaymentInfo, setPayPalPaymentInfo] = useState()

    const onSubmit = async (e, pInfo) => {
        var paymentInfo = pInfo || paypalPaymentInfo
        var paymentMade = boosterPaymentMade
        try {
            e.preventDefault()
        } catch(error) {
            paymentMade = e
        }

        var form = {}
        for (const [key, value] of Object.entries(fieldsMap)) {
            form[key] = value.clearError()
            var cleaned = await value.get()
            if(!notSet(cleaned)) {
                form[key] = cleaned
                
            }
        }
        
        
        if(!formHasError) {
            //console.log("FORM:", form)
            console.log("FORM_PAY:", LISTING_BOOSTERS[booster].price, paymentMade, form)
            if(LISTING_BOOSTERS[booster].price > 0 && paymentMade != LISTING_BOOSTERS[booster].price) {
                setPaypalButtonReady(false)
                setShowPayPalButton(true)
                return
            }

            var formData = new FormData()

            const photoFiles = []
            const photoEditOrder = []
            var photos = []
            form?.photos?.forEach(photo => {
                if(photo.file) {
                    photoFiles.push(photo.file)
                    photoEditOrder.push("file")

                } else {
                    photoEditOrder.push("url")
                    photos.push(photo.url)

                }

            });
            
            console.log("paymentInfo", paymentInfo)
            /*
            paymentInfo = {
                captureId: "8KW354173V9775024",
                captureAmount: 4.99,
                captureCurrency: "EUR",
                captureCreatedAt: "2021-03-01T11:37:33Z"
            }*/
            var json = paymentInfo? {...form, paypal: paymentInfo} : {...form}
            

            var requestKey = "product-create"
            var successMsgKey = "upload-success-message"
            if(!isEdit) {
                delete json.photos
            } else {
                json.product_id = product
                json.photos = photos
                json.photo_urls_and_files_order = photoEditOrder
                requestKey = "product-edit"
                successMsgKey = "edit-success-message"
            }
            console.log("FORM:P", json, photoEditOrder, photoFiles)

            setShowUploadProgress(true)
            
            apiPostFileJson(requestKey, photoFiles, json, lang, (p) => {
                var level = parseFloat(p.loaded / p.total * 100).toFixed(0)
                setUploadProgress(level)
            })
            .then (({data}) => {
                setShowUploadProgress(false)
                setUploadProgress(0)
                Swal.fire({
                    text: t(successMsgKey),
                    icon: 'success',
                    allowOutsideClick: false,
                    confirmButtonText: t('common:ok'),
                    cancelButtonText: t('common:ok')
                })
                .then(() => {
                    setWillViewProduct(true)
                    router.push(`${data.link}?preview=1`)

                })
            })
            .catch(({request, response, message}) => {
                setShowUploadProgress(false)
                setUploadProgress(0)
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
                    console.log("apiPostFileJson('products')", "message", message)
                }
                
            })
        }
        
    }

    //files start
    const [dragOver, setDragOver] = useState(false)

    const [winReady, setwinReady] = useState(false);

    useEffect(() => {
        setwinReady(true);
    }, []);

    const uploadListUpdateHandler = update => {
        setPhotos(update)
    }

    const remove = index => {
        var items = [...photos]
        items.splice(index, 1)
        setPhotos(items)
    }
    
    const onUploadListItem = (item, index, isDragging) => {
        return (
            <div className={styles['upload-item']} style={{background: `url(${item.url})`, border: !isDragging ? "2px solid #70b93f" : "2px solid grey", backgroundSize: 'cover'}}>
                <div className={styles["upload-menu"]}>
                    <i onClick={() => remove(index)} className="fa fa-close"></i>
                </div>
            </div>
        )
    }
    
    const onFileInputChange = (event) => {
        const { files } = event.target;
        processFiles(files)
    }

    const processFiles = files => {
        setDragOver(false)
        files = [...files]
        
        fieldsMap.photos.set(files, photos)

    }
    //files end
    
    
    // Server-render loading state
    if ((!session && loading) || defaultValuesStatus == API_REQUEST_STATUS.fetching || willViewProduct) {
        return(
            <div>
                <Head>
                    <title>{t('page-title')} {TITLE_SEPARATOR} {t('header:site-name')}</title>
                </Head>
                <PageBody navType={PageBody.vars.NAV_TYPES.others}>
                    <LoadingView title={t('page-title')} message={t('common:fetching-user-data-message')} />
                </PageBody>
            </div>
        )
    }

    console.log("Sell:", "ProductLoad", defaultValuesStatus, defaultValuesError, defaultValues)
    if(defaultValuesError) {
        var errorMsg = ""
        if(defaultValuesError.error) {
            errorMsg = t(defaultValuesError.error)

        } else if(defaultValuesError.errors) {
            errorMsg = t(defaultValuesError.errors[Object.keys(defaultValuesError.errors)[0]])

        } else {
            errorMsg = t('common:error-try-again')
        }
        Swal.fire({
            text: errorMsg,
            confirmButtonText: t('common:ok'),
            cancelButtonText: t('common:ok')
        })
    }

    //take the user to the lofin page if the session is empty
    if (!session && !loading) {
        signIn()
    }

    // Once the user request finishes, show the user
    return (
    <div>
        <Head>
            <title>{t('page-title')} {TITLE_SEPARATOR} {t('header:site-name')}</title>
        </Head>
        <PageBody navType={PageBody.vars.NAV_TYPES.others}>
            <div className="page-content">
                <div className="d-flex justify-content-center align-items-center margin-b-20 h1 b text-cap">
                    {t(!isEdit? 'create-listing' : 'edit-listing')}
                </div>
                <div className="form-wrapper">
                    <div className="d-flex justify-content-between align-items-center margin-b-25">
                        <div className="h3 b text-cap">{t('listing-details')}</div>
                        <button onClick={() => reset(defaultValues)} className="btn btn-outline-success btn-sm text-cap">{t('common:reset-form')}</button>
                    </div>
                    <form onSubmit={onSubmit}>
                        <div className="form-group row">
                            <label for="title" className="required col-sm-2 col-form-label">{t('title')}:</label>
                            <InputBox error={titleError} className="col-sm-10">
                                <input onChange={handleChange} value={title} placeholder={t('title-placeholder')} id="title" name="title" type="text" className="form-control" />
                                <small class="form-text text-muted">{t('common:chars-remaining', {count: getCharsRem(formRule.title.maxChar[0],  title.length)})}</small>
                            </InputBox>
                        </div>

                        <div className={`form-group row ${cats?.length == 0? 'disabled-section' : ''}`}>
                            <label for="cat" className="required col-sm-2 col-form-label">{t('cat')}:</label>
                            <InputBox error={catError} className={`col-sm-10 ${catsStatus == API_REQUEST_STATUS.fetching? 'loading-section' : ''}`} attrs={{
                                'data-loading-msg': t('data-loading')
                            }}>
                                <select onChange={handleChange} value={cat} id="cat" name="cat" className="form-control">
                                    <option value="-1">---{t('cat-select')}---</option>
                                    {
                                        (cats || []).map((value, index) => {
                                            return <option key={index} value={value.id}>{value.name}</option>
                                        })
                                    }
                                </select>
                                {
                                    !cats || cat != cats[0]?.id? null : 
                                    <small class="form-text text-muted">{cats[0].description}</small>
                                }
                            </InputBox>
                        </div>

                        <div className={`form-group row ${subcats && subcats?.length == 0? 'disabled-section' : ''} ${cats && cat == cats[0]?.id? "d-none" : "flex"}`}>
                            <label for="subcat" className="required col-sm-2 col-form-label">{t('subcat')}:</label>
                            <InputBox error={subcatError} className={`col-sm-10 ${subcatsStatus == API_REQUEST_STATUS.fetching? 'loading-section' : ''}`} attrs={{
                                'data-loading-msg': t('data-loading')
                            }}>
                                <select onChange={handleChange} value={subcat} value={subcat} id="subcat" name="subcat" className="form-control">
                                    <option value="-1">---{t('select-subcat')}---</option>
                                    {
                                        (subcats || []).map((value, index) => {
                                            return <option key={index} value={value.id}>{value.name}</option>
                                        })
                                    }
                                </select>
                            </InputBox>
                        </div>

                        <div className="form-group row">
                            <label for="price" className="required col-sm-2 col-form-label">{t('price')}:</label>
                            <InputBox error={priceError} className="col-sm-10">
                                <input onChange={handleChange} value={price} placeholder={t('price-placeholder')} id="price" name="price" type="text" className="form-control" />
                            </InputBox>
                        </div>

                        <div className="form-group row">
                            <label for="description" className="col-sm-2 col-form-label">{t('description')}:</label>
                            <InputBox className="col-sm-10" error={descriptionError}>
                                <textarea onChange={handleChange} value={description} rows="3" placeholder={t('description-placeholder')} id="description" name="description" className="form-control" />
                                <small class="form-text text-muted">{t('common:chars-remaining', {count: getCharsRem(formRule.description.maxChar[0], description.length)})}</small>
                            </InputBox>
                        </div>

                        <div className={`form-group row ${countries?.length == 0? 'disabled-section' : ''}`}>
                            <label for="country" className="required col-sm-2 col-form-label">{t('region')}:</label>
                            <InputBox error={countryError} className={`col-sm-10 ${countriesStatus == API_REQUEST_STATUS.fetching? 'loading-section' : ''}`} attrs={{
                                'data-loading-msg': t('data-loading')
                            }}>
                                <select onChange={handleChange} value={country} id="country" name="country" className="form-control">
                                    <option value="-1">---{t('select-region')}---</option>
                                    {
                                        (countries || []).map((value, index) => {
                                            return <option key={index} value={value.id}>{value.name}</option>
                                        })
                                    }
                                </select>
                            </InputBox>
                        </div>

                        <div className={`form-group row ${cities?.length == 0? 'disabled-section' : ''}`}>
                            <label for="city" className="required col-sm-2 col-form-label">{t('city')}:</label>
                            <InputBox error={cityError} className={`col-sm-10 ${citiesStatus == API_REQUEST_STATUS.fetching? 'loading-section' : ''}`} attrs={{
                                'data-loading-msg': t('data-loading')
                            }}>
                                <select onChange={handleChange} value={city} id="city" name="city" className="form-control">
                                    <option value="-1">---{t('select-city')}---</option>
                                    {
                                        (cities || []).map((value, index) => {
                                            return <option key={index} value={value.id}>{value.name}</option>
                                        })
                                    }
                                </select>
                            </InputBox>
                        </div>
                        
                        <label for="file-select">{t('photos-label')}</label>
                        <InputBox error={photosError} className={styles["upload-form"]}>
                            <FileDrop
                            onFrameDragEnter={(event) => setDragOver(true)}
                            onFrameDragLeave={(event) => setDragOver(false)}
                            onFrameDrop={(event) => processFiles(event.dataTransfer.files)}
                            onDragOver={(event) => setDragOver(true)}
                            onDragLeave={(event) => {}}
                            onDrop={(files, event) => {}}
                            >
                                <label className="btn btn-primary" for="file-select">{t('select')}</label> &nbsp; <span>{t('ordragdrop')}</span>
                                <input
                                id="file-select"
                                style={{display: "none"}}
                                onChange={onFileInputChange}
                                type="file"
                                className="hidden"
                                multiple
                                />
                            </FileDrop>
                        </InputBox>
                        {
                        !winReady? null :
                            <div className={styles['upload-list']}>
                                <OrderlyListHr list={photos} itemKey="id" updateHandler={uploadListUpdateHandler} onItem={onUploadListItem} onListStyle={getListStyle} onItemStyle={getItemStyle} />
                            </div>
                        }

                        <div className={`form-group row `}>
                            <label className="required col-sm-12 col-form-label">{t('boost-listing')}:</label>
                            <InputBox error={boosterError} className={`col-sm-12`} attrs={{
                                'data-loading-msg': t('data-loading')
                            }}>
                                <RadioGroup name="booster" defaultValue={LISTING_BOOSTERS[Object.keys(LISTING_BOOSTERS)[0]].name}>
                                    <Stack spacing={4} direction="column">
                                        {
                                            Object.keys(LISTING_BOOSTERS).map((booster, index) => {
                                                return (
                                                    <Radio cursor="pointer"
                                                    colorScheme="green" onChange={handleChange} value={booster}>
                                                        <Badge cursor="pointer" colorScheme="green" p="1" fontWeight="bold">
                                                        {
                                                            index == 0?
                                                            t('package-none')
                                                            :
                                                            t("package-x-days", {count: LISTING_BOOSTERS[booster].days})
                                                        }
                                                        </Badge>
                                                    </Radio>
                                                )
                                            })
                                        }
                                    </Stack>
                                </RadioGroup>
                                <small class="form-text text-muted">{t('common:current-booster', {count: getCurrentPackageDaysLeft(boosterExpiry)})}</small>
                            </InputBox>
                        </div>

                        <div className="margin-t-25 d-flex justify-content-center align-items-center">
                            <button type="submit" className="btn btn-primary text-cap btn-lg">{t(!isEdit? 'submit-text' : 'submit-text-edit')}</button>
                        </div>
                    </form>
                </div>
                <VStack mt="15px" alignItems="center" fontSize="14px">
                    <Text as={Link} href="/tos" mb="5px" 
                    color="primary.900" 
                    _hover={{
                        color: "primary.900",
                        textDecor: "underline"
                    }}
                    >
                        {t('tos-ag')}
                    </Text>
                    <Text as={Link} href="/create-ad-tips" mb="5px" 
                    color="primary.900" 
                    _hover={{
                        color: "primary.900",
                        textDecor: "underline"
                    }}
                    >
                        <HStack>
                            <Box className="fa fa-info"></Box> 
                            {" "}
                            <Text color="primary.900">
                                {t('how-to-create')}
                            </Text>
                        </HStack>
                    </Text>
                </VStack>
            </div>
            <div className={styles["dragover-overlay"]} style={{display: dragOver? "block" : "none"}}></div>
            <Overlay show={showUploadProgress} outsideClickHandler={null} hasBg>
                <ProgressBar message={t('uploading-item')} style={{width: '100%', minWidth: '200px'}} level={uploadProgress} status={uploadStatus == 'error'? 'danger' : 'info'}  striped={uploadStatus == 'busy'? true : false} anim={uploadStatus == 'busy'? true : false} />
            </Overlay>
            <Modal isOpen={showPayPalButton} onClose={() => setShowPayPalButton(false)}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{t("x-booster-pay-desc", {count: LISTING_BOOSTERS[booster || ""]?.days || 0})}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pos="relative">
                        <PayPalButton
                            amount={LISTING_BOOSTERS[booster || ""]?.price || 0}
                            currency={CURRENCY_CODE}
                            onButtonReady={() => {
                                setPaypalButtonReady(true)
                            }}
                            onSuccess={(details, data) => {
                                console.log("PAY_DATA:", data)
                                console.log("PAY_DETAILS:", details)
                                var capture = details.purchase_units[0].payments.captures[0]
                                var paymentInfo = {
                                    captureId: capture.id,
                                    captureAmount: capture.amount.value,
                                    captureCurrency: capture.amount.currency_code,
                                    captureCreatedAt: capture.create_time
                                }
                                console.log("PAY_paymentInfo:", paymentInfo)
                                setPayPalPaymentInfo(paymentInfo)
                                setBoosterPaymentMade(LISTING_BOOSTERS[booster].price)
                                setShowPayPalButton(false)

                                Swal.fire({
                                    text: !details?.payer?.name?.given_name? t("payment-completed-no-name") : t("payment-completed-name", {name: details.payer.name.given_name}),
                                    icon: 'success',
                                    allowOutsideClick: false,
                                    confirmButtonText: t('common:ok'),
                                    cancelButtonText: t('common:ok')
                                })
                                .then(() => {
                                    //submit the form
                                    onSubmit(LISTING_BOOSTERS[booster].price, paymentInfo)
                                })
                            }}
                            options={{
                                clientId: PAYPAL_CLIENT_ID(),
                                currency: CURRENCY_CODE
                            }}
                            onError={() => {
                                Swal.fire('', t('common:error-try-again'), 'error')
                            }}
                        />
                        <Flex justifyContent="center" alignItems="center" zIndex="5" pos="absolute" 
                        display={!paypalButtonReady? "block" : "none"}>
                            <Loading
                                type={Loading.TYPES.threeDots}
                                color="#fea136"
                                height={100}
                                width={100}
                                visible={true}
                            />
                        </Flex>
                    </ModalBody>
                    <ModalFooter display="flex" alignItems="center" justifyContent="space-between">
                        <HStack alignItems="center">
                            <Loading
                                type={Loading.TYPES.puff}
                                color="#fea136"
                                height={30}
                                width={30}
                                visible={true}
                            />
                            <Box fontSize="12px" fontStyle="italic">
                                {t('paypal-close-warning')}
                            </Box>
                        </HStack>
                        <Button variant="ghost" size="lg" fontWeight="bold">{CURRENCY_CODE}{" "}{LISTING_BOOSTERS[booster || ""]?.price || 0}</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </PageBody>
    </div>
    )
}