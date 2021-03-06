
const multer = require('multer');
const mime = require('mime-types')
const uniqueFilename = require('unique-filename')

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/uploads")
    },
    filename: function (req, file, cb) {
      cb(null, uniqueFilename("", Date.now()) + '.' + mime.extension(file.mimetype))
    }
})

const buildStorage = uploadDir => {
    return multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, uploadDir || "./public/uploads")
        },
        filename: function (req, file, cb) {
          cb(null, uniqueFilename("", Date.now()) + '.' + mime.extension(file.mimetype))
        }
    })
}

const buildFilter = mimes => {
    if(!Array.isArray(mimes)) mimes = []
    return (req, file, cb) => {
        if (mimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('INVALID_MIME'));
        }
    }
}

const maxFileSize = 1024 * 1024 * 50//size in bytes
const singleUpload = filename => {
    return multer({ storage: storage, limits: {fileSize: maxFileSize} }).single(filename)
}
const multipleUpload = (filename, maxLength) => {
    return multer({ storage: storage, limits: {fileSize: maxFileSize} }).array(filename, maxLength)
}

const customUpload = (filename, options) => {
    var storage = options?.uploadDir? buildStorage(options.uploadDir) : storage
    var limits = options?.maxFileSize? {fileSize: options.maxFileSize} : {}
    var filter = options?.mimes? buildFilter(options.mimes) : null
    
    return multer({ storage: storage, limits: limits, fileFilter: filter }).array(filename, options.max)
}

const fileUploader = {}
fileUploader.singleUpload = singleUpload
fileUploader.multipleUpload = multipleUpload
fileUploader.customUpload = customUpload
fileUploader.MULTER_ERROR = multer.MulterError

module.exports = fileUploader