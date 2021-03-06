const queryString = require('query-string')

import useTranslation from 'next-translate/useTranslation'
import { useEffect, useState } from 'react'
import useSwr from 'swr'
import { notSet, textEmpty } from '../utils/functions'
import { useFetch } from './useFetch'

const axios = require('axios').default;

const hasThese = (supplied, requirements) => {
    var queries = supplied? Object.keys(supplied) : []
    if(requirements && queries.length == 0 && 
        (
            requirements?.requiresPayloadOr?.length > 0 
            || 
            requirements?.requiresPayloadAnd?.length > 0
        ) 
    ) {
        return false


    }

    var hasRequirement = true
    //check OR Reqirements
    if(requirements?.requiresPayloadOr?.length > 0) {
        var has = false

        for(var qIndex in queries) {
            if(requirements.requiresPayloadOr.includes(queries[qIndex]) && !notSet(supplied[queries[qIndex]])) {
                has = true
                break
            }
        }
        hasRequirement = has
    }

    //check AND Reqirements
    if(requirements?.requiresPayloadAnd?.length > 0) {
        var has = true

        for(var qIndex in queries) {
            if(!requirements.requiresPayloadAnd.includes(queries[qIndex]) && !notSet(supplied[queries[qIndex]])) {
                has = false
                break
            }
        }
        hasRequirement = has
    }

    return hasRequirement

}

const hasSupplies = (options) => {
    if(!options) return false
    const { payload, path, locale, requirements } = options

    return !(!payload && requirements?.payloadRequired || textEmpty(path) && requirements?.pathRequired || textEmpty(locale) && requirements?.localeRequired)

}

const getUrl = (key, apiPath, payload, locale) => {
    payload = notSet(payload) || !(typeof payload === "object")? {locale: locale? locale : ""}
    :
    {...payload, locale: locale? locale : ""}
    if(textEmpty(apiPath)) {
        apiPath = ""

    } else {
        if(!apiPath.startsWith("/")) apiPath = `/${apiPath}`
        if(apiPath.endsWith("/")) apiPath = apiPath.substring(0, apiPath.length - 1)
    }
    const url = `/api/v1/${key}${apiPath}?${queryString.stringify(payload)}`
    console.log("getUrl", url)
    return url
}

const useApiGet = (key, locale, options) => {
    const { payload, path, requirements } = options

    const initialData = options?.initialData || null
    const initialState = {
        payload: payload,
        path: path,
        requirements: requirements
    }

    const [state, setState] = useState(initialState)
    
    const [updateNow, setUpdateNow] = useState(true)

    var load = hasSupplies(state) && hasThese(state.payload, state.requirements)
    console.log("HAS_REQ:", load, hasThese(state.payload, state.requirements), state.payload, state.requirements)
    const { lang } = useTranslation()
    const [returnData, setReturnData] = useState()
    const [data, error, status, updateUrl] = useFetch(load? getUrl(key, state.path, state.payload, options?.noLocale? null : lang) : null, initialData)
    useEffect(() => {
        if(data) {
            if(options?.responseFilter) {
                setReturnData(options.responseFilter(data))
    
            } else {
                setReturnData(data)
            }
        }
    }, [data])
    const commit = (newState) => {
        setState({...state, ...newState})
        setUpdateNow(!updateNow)
    }
    useEffect(() => {
        var load = hasSupplies(state) && hasThese(state.payload, state.requirements)
        if(!load) return
        apiLog("CLIENT", "UPDATEX", getUrl(key, state.path, state.payload, options?.noLocale? null : lang))
        updateUrl(getUrl(key, state.path, state.payload, options?.noLocale? null : lang))

    }, [updateNow, lang])

    return [returnData, error, status, commit, setReturnData]
}


const apiPostJson = (key, json, locale) => {

    return axios.post(`/api/v1/json-${key}?locale=${locale}`, json, {
        headers: {'Content-Type': 'application/json' }
    })
    
}

const apiPostFileJson = (key, files, json, locale, onUploadProgress) => {
    var formData = new FormData()
    files?.forEach(file => {
        formData.append("all", file);
    })
    formData.append("json", JSON.stringify(json))

    return axios.post(`/api/v1/file-json-${key}?locale=${locale}`, formData, {
        headers: {'Content-Type': 'multipart/form-data' },
        onUploadProgress: onUploadProgress
    })
    
}

const API_REQUEST_STATUS = {
    idle: 'idle',
    fetching: 'fetching',
    fetched: 'fetched',
    error: 'error'
}

const useApiOptions = {
    debug: true
}

function apiLog() {
    if(useApiOptions.debug) {
        console.log(Array.prototype.slice.call(arguments))
    }
}

module.exports = {
    useApiGet, apiPostJson, apiPostFileJson, apiLog, API_REQUEST_STATUS
}