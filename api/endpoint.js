
export const ENDPOINT_SUB_TYPES = {
    UploadFileAndJson: "UploadFileAndJson",
    PostJson: "PostJson"
}
const Endpoint = {
    Get: options => {
        return {
            type: "GET",
            options: options
        }
    },
    Post: options => {
        return {
            type: "POST",
            options: options
        }
    },
    PostJson: options => {
        var o = {...options, id: `json-${options.id}`, subType: ENDPOINT_SUB_TYPES.PostJson}
        return {
            type: "POST",
            subType: ENDPOINT_SUB_TYPES.PostJson,
            options: o
        }
    },
    UploadFileAndJson: options => {
        var o = {...options, id: `file-json-${options.id}`, subType: ENDPOINT_SUB_TYPES.UploadFileAndJson}
        return {
            type: "POST",
            subType: ENDPOINT_SUB_TYPES.UploadFileAndJson,
            options: o
        }
    }
}

export default Endpoint