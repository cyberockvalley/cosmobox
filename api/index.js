import { notSet, textEmpty } from "../utils/functions"
import { ENDPOINT_SUB_TYPES } from "./endpoint"
import fileUploader from './fileUploader'

const fs = require('fs')
const path = require('path')

const getTables = require("../database/get-tables")

export const STATUS_CODES = {
    OK: 200,
    BAD_REQUEST: 400,
    UNAUTHORISED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500

}

export const okResponse = (res, data) => {
    res.status(STATUS_CODES.OK).send(data)
}
export const badRequestResponse = (res, data) => {
    res.status(STATUS_CODES.BAD_REQUEST).send(data)
}
export const unAuthorisedResponse = (res, data) => {
    res.status(STATUS_CODES.UNAUTHORISED).send(data)
}
export const notFoundResponse = (res, data) => {
    res.status(STATUS_CODES.NOT_FOUND).send(data)
}
export const serverErrorResponse = (res, data, showError) => {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(showError? data : {error: 'server-error'})
}


// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
    return new Promise((resolve, reject) => {
      fn(req, res, (result) => {
        if (result instanceof Error) {
          return reject(result)
        }
  
        return resolve(result)
      })
    })
}

const deleteFiles = files => {
    files?.forEach(file => {
        fs.unlink(file?.path || file, (err) => {
            if (err) {
                console.log("DELETE_NOT_OK:", file?.path || file, err)

            } else {
                console.log("DELETED_OK:", file?.path || file)
            }
        })
        
    })
}

export const FILE_TOOLS = {
    deleteEngine: deleteFiles
}

const { getSession } = require('next-auth/client')

const API_ERRORS = {
    routeNotFound: "common:ROUTE_NOT_FOUND",
    fileSizeLimit: "common:LIMIT_FILE_SIZE",
    fileErrorX: "common:FILE_ERROR_UKNOWN",
    fileMaxTotalLimit: "common:LIMIT_UNEXPECTED_FILE",
    fileInvalidMime: "common:INVALID_MIME",
    fileMoreUploadExpected: "common:LIMIT_EXPECTED_FILE"
}

const SiteData = async  (req, res, options) => {
    if(!options.endpoints || options.endpoints.length == 0) {
        notFoundResponse(res, API_ERRORS.routeNotFound)

    } else {
        var allQueries = JSON.parse(JSON.stringify(req.query))
        var params = allQueries["v1"]
        var path = params[1] || ""
        params = params.length > 2? params.splice(2) : []
        delete allQueries["v1"]
        if(options.debug) {
            console.log("SiteData:", "path:", path, "params", params, "queries", allQueries)
        }

        var endpoint
        options.endpoints.forEach(point => {
            //check if the endpoint handles the request path using the request method
            if(options.debug) {console.log("Got_YA:__", 1, path, point.options.id, req.method.toUpperCase(), point.type.toUpperCase())}
            if(path == point.options.id && req.method.toUpperCase() == point.type.toUpperCase()) {
                endpoint = point
                return

            }
        })

        if(!endpoint) {if(options.debug) {console.log("Got_YA:!!", 1, endpoint)}
            notFoundResponse(res, {error: API_ERRORS.routeNotFound})

        } else {if(options.debug) {console.log("Got_YA:", 1, endpoint.type.toUpperCase())}
            var type = endpoint.type.toUpperCase()
            endpoint = endpoint.options
            let files

            const session = endpoint.sessionRequired? await getSession({req}) : null
            if(endpoint.sessionRequired && !session) {
                unAuthorisedResponse(res, {error: endpoint.sessionRequired})

            } else if(endpoint.subType == ENDPOINT_SUB_TYPES.UploadFileAndJson && type === "POST") {
                if(!endpoint.expectedFiles) {
                    const upload = fileUploader.multipleUpload("all")
                    upload(req, res, err => {
                        if (err instanceof fileUploader.MULTER_ERROR) {
                            if(err.code == "LIMIT_FILE_SIZE") {
                                badRequestResponse(res, {error: API_ERRORS.fileSizeLimit})

                            } else {
                                //clean up - delete files if uploaded
                                deleteFiles(req.files)
                                serverErrorResponse(res, {error: API_ERRORS.fileErrorX}, options.debug)
                            }

                        } else if (err) {
                            // An unknown error occurred when uploading.
                            //clean up - delete files if uploaded
                            deleteFiles(req.files)
                            serverErrorResponse(res, {error: API_ERRORS.fileErrorX}, options.debug)
    
                        } else {
                            // Everything went fine.
                            req.body = JSON.parse(req.body.json) || {}
    
                            processJson(type, allQueries, options, endpoint, req.files, session, req, res)
    
                        }
                    })

                } else {
                    const upload = fileUploader.customUpload("all", {
                        max: endpoint.expectedFiles?.max[0] || null,
                        maxFileSize: endpoint.expectedFiles?.maxFileSize[0] || null,
                        mimes: endpoint.expectedFiles?.mimes[0] || null,
                        uploadDir: endpoint.expectedFiles.uploadDir
                    })
                    var error = ""
                    upload(req, res, err => {
                        if (err instanceof fileUploader.MULTER_ERROR) {
                            // A Multer error occurred when uploading.
                            //console.log("MULTER_ERROR::", err.code, err.message)
                            switch (err.code) {
                                case "LIMIT_FILE_SIZE":
                                    error = endpoint.expectedFiles?.maxFileSize[1] || API_ERRORS.fileSizeLimit
                                    badRequestResponse(res, {error: error})
                                    break
                                case "LIMIT_UNEXPECTED_FILE":
                                    error = endpoint.expectedFiles?.max[1] || API_ERRORS.fileMaxTotalLimit
                                    badRequestResponse(res, {error: error})
                                    break
                                default:
                                    error = API_ERRORS.fileErrorX
                                    serverErrorResponse(res, {error: error}, options.debug)
                            }
                            
                        } else if (err) {
                            if(err.message == "INVALID_MIME") {
                                error = endpoint.expectedFiles?.mimes[1] || API_ERRORS.fileInvalidMime
                                badRequestResponse(res, {error: error})

                            } else {
                                // An unknown error occurred when uploading.
                                //clean up - delete files if uploaded
                                deleteFiles(req.files)
                                serverErrorResponse(res, {error: API_ERRORS.fileErrorX}, options.debug)
                            }

                        } else {
                            if(endpoint.expectedFiles?.required && req.files.length == 0) {
                                badRequestResponse(res, {error: endpoint.expectedFiles.required})

                            } else if(endpoint.expectedFiles?.min && endpoint.expectedFiles?.min[0] && req.files.length < endpoint.expectedFiles.min[0]) {
                                //delete the files
                                deleteFiles(req.files)
                                error = endpoint.expectedFiles?.min[1] || API_ERRORS.fileMoreUploadExpected
                                badRequestResponse(res, {error: error})

                            } else {
                                // Everything went fine. Now that the files has been validated with the rules,
                                //let's validate the json body
                                req.body = JSON.parse(req.body.json) || {}

                                processJson(type, allQueries, options, endpoint, req.files, session, req, res)
                            }
                            

                        }
                    })
                }

            } else {
                //parse body here since bodyParsing as been switched off, and the passing won't be handled
                //by the multipart parser(multer)
                const  bodyParser = require('body-parser')
                // Run bodyParser middleware
                await runMiddleware(req, res, bodyParser.json())
                processJson(type, allQueries, options, endpoint, files, session, req, res)
            }
            
        }
    }
}

const processJson = (type, allQueries, options, endpoint, files, session, req, res) => {
    var errors = {}
    var hasErrors = false
    var inputData = {}
    
    if(endpoint.expectedData) {
        var allData
        if(type === "POST") {
            allData = req.body

        } else if(type === "GET") {
            allData = allQueries
        }
        if(endpoint.expectedData == "all") {
            inputData = allData
            
        } else {
            for(const [key, value] of Object.entries(endpoint.expectedData)) {
                var data; 
                data = allData[key]
                //value.clean checks the parameter and returns an object 
                //with property "value" when the parameter is valid,
                //and "error" when the parameter is not
                //the error can be anything, but a string referencing the error message,
                //is the best so as to pass to a trnslation function to get the localised message to the 
                //end user
    
                var cleanedData = textEmpty(data)? {} : value.clean? value.clean(data) : {value: data}
                //required parameters
                if(value.required && notSet(cleanedData.value)) {
                    var fieldHasError = true
                    //if the parameter has fallbacks to chhose from
                    //check the fallbacks and send back the first valid fallback,
                    //by valid, validity of each fallback parameter is checked by their clean method,
                    //which also returns "value" or error, but the error is not used, only the existence 
                    //of the "value" in the return object validate the fallback
                    if(value.requirementFallbacks) {
                        for(const [k, v] of Object.entries(value.requirementFallbacks)) {
                            var fallbackData = allData[k]
                            var fallBackCleanedData = textEmpty(fallbackData)? {} : v.clean? v.clean(fallbackData) : {value: fallbackData}
                            if(!notSet(fallBackCleanedData.value)) {
                                fieldHasError = false
                                inputData[key] = {
                                    fallback: {
                                        key: k,
                                        value: fallBackCleanedData.value
                                    }
                                }
                                break
                            }
                        }
                    }
                    if(fieldHasError) {
                        hasErrors = true
                        errors[key] = cleanedData.error || value.required || ""
                    }
                    
    
                } //optional parameters: if the parameter is set, but the cleaned data value is not set,
                //this means there is an error, and we should handle it
                else if(!notSet(data) && notSet(cleanedData.value) && notSet(value.defaultValue)) {
                    hasErrors = true
                    errors[key] = cleanedData.error || ""
    
                } else {
                    inputData[key] = !notSet(cleanedData.value)? cleanedData.value : value.defaultValue
                }
            }
        }
        //If there are errors, return the errors
        if(hasErrors) {
            //clean up - delete files if uploaded
            deleteFiles(req.files)
            badRequestResponse(res, {errors: errors})

        } else {
            return parseHeaders(options, inputData, endpoint, allQueries.locale, files, session, req, res)
        }

    } else {/*
        let inputData
        if(type === "POST") {
            inputData = req.body

        } else if(type === "GET") {
            inputData = allQueries
        }*/
        return parseHeaders(options, inputData, endpoint, allQueries.locale, files, session, req, res)
    }
}

const parseHeaders = async (options, body, endpoint, requestLocale, files, session, req, res) => {
    var errors = {}
    var hasErrors = false
    var inputData = {}
    
    if(endpoint.expectedHeaders) {
        var allData = req.headers

        if(endpoint.expectedHeaders == "all") {
            inputData = allData
            
        } else {
            for(const [key, value] of Object.entries(endpoint.expectedHeaders)) {
                var data; 
                data = allData[key]
                //value.clean checks the parameter and returns an object 
                //with property "value" when the parameter is valid,
                //and "error" when the parameter is not
                //the error can be anything, but a string referencing the error message,
                //is the best so as to pass to a trnslation function to get the localised message to the 
                //end user
    
                var cleanedData = textEmpty(data)? {} : value.clean? value.clean(data) : {value: data}
                //required parameters
                if(value.required && notSet(cleanedData.value)) {
                    var fieldHasError = true
                    //if the parameter has fallbacks to chhose from
                    //check the fallbacks and send back the first valid fallback,
                    //by valid, validity of each fallback parameter is checked by their clean method,
                    //which also returns "value" or error, but the error is not used, only the existence 
                    //of the "value" in the return object validate the fallback
                    if(value.requirementFallbacks) {
                        for(const [k, v] of Object.entries(value.requirementFallbacks)) {
                            var fallbackData = allData[k]
                            var fallBackCleanedData = textEmpty(fallbackData)? {} : v.clean? v.clean(fallbackData) : {value: fallbackData}
                            if(!notSet(fallBackCleanedData.value)) {
                                fieldHasError = false
                                inputData[key] = {
                                    fallback: {
                                        key: k,
                                        value: fallBackCleanedData.value
                                    }
                                }
                                break
                            }
                        }
                    }
                    if(fieldHasError) {
                        hasErrors = true
                        errors[key] = cleanedData.error || value.required || ""
                    }
                    
    
                } //optional parameters: if the parameter is set, but the cleaned data value is not set,
                //this means there is an error, and we should handle it
                else if(!notSet(data) && notSet(cleanedData.value)) {
                    hasErrors = true
                    errors[key] = cleanedData.error || ""
    
                } else {
                    inputData[key] = !notSet(cleanedData.value)? cleanedData.value : value.defaultValue
                }
            }
        }
        //If there are errors, return the errors
        if(hasErrors) {
            //clean up - delete files if uploaded
            deleteFiles(req.files)
            badRequestResponse(res, {errors: errors})

        } else {
            return sendResponse(options, inputData, body, endpoint, requestLocale, files, session, req, res)
        }

    } else {
        //let inputData = allData
        return sendResponse(options, inputData, body, endpoint, requestLocale, files, session, req, res)
    }
}

const renameFiles = async (files, onNewFilename) => {
    var newFilePromises = []
    files.forEach(file => {
        newFilePromises.push(
            new Promise((resolve, reject) => {
                var filenameChunks = file.filename.split('.')
                var noExtFilename = filenameChunks.slice(0, -1).join('.')
                var ext = filenameChunks.pop()
                var newFilename = onNewFilename({noExtFilename: noExtFilename, filePath: file.path}) + `.${ext}`
                var newFilepath = path.join(file.destination, newFilename)
                try {
                    fs.renameSync(file.path, newFilepath)
                    resolve({...file, filename: newFilename, path: newFilepath})

                } catch(e) {
                    reject(e)
                }
            })
        )
    })
    try {
        return await Promise.all(newFilePromises)

    } catch(e) {
        console.log("FilenameCatch", e)
        return null
    }
}

const sendResponse = async (options, headers, data, endpoint, requestLocale, files, session, req, res) => {
    if(requestLocale && requestLocale == options.defaultLocale || (options.locales && !options.locales.includes(requestLocale))) {
        requestLocale = null
    }
    const tables = getTables(options.database, endpoint.requiredTables || [], requestLocale, options.database.defaultLocale)

    if(!endpoint.respond) {
        deleteFiles(req.files)
        okResponse(res, 'ok')

    } else {
        if(endpoint?.expectedFiles?.fileOp?.rename && files && files.length > 0) {
            var newFiles = await renameFiles(files, endpoint.expectedFiles.fileOp.rename)
            if(!newFiles) {
                deleteFiles(files)
                serverErrorResponse(res, 'FILE_OP_RENAME', options.debug)

            } else {
                files = newFiles
            }
        }
        endpoint.respond({session: session, expectedHeaders: headers, expectedData: data, tables: tables, expectedFiles: files})
        .then(result => {
            if(result.status && result.status != STATUS_CODES.OK) deleteFiles(req.files)
            if(result.status && result.status == STATUS_CODES.INTERNAL_SERVER_ERROR) {
                serverErrorResponse(res, result.data, options.debug)

            } else {
                res.status(result.status || 200).send(result.data || "")
            }
            
        })
        .catch(e => {
            deleteFiles(req.files)
            serverErrorResponse(res, e, options.debug)
        })
    }
    
}

export default SiteData