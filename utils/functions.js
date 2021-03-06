import Swal from "sweetalert2"
import { CHAT_ID_SEPARATOR, GENERAL_MESSAGE_CHAT_ID, IMAGE_DIMENSIONS_SEPERATOR, IMAGE_FILENAME_AND_DIMENSIONS_SEPERATOR, NO_USERLINK_ID_PREFIX, USERLINK_PREFIX } from "./constants"

export const isClient = () => {
    return !(typeof window === 'undefined')
}
export const saveToStrorage = (key, value) => {
    if(isClient()) {
        window.localStorage.setItem(key, value)
    }
}

export const getFromStorage = (key, defaultValue) => {
    return isClient()? window.localStorage.getItem(key)? window.localStorage.getItem(key) : defaultValue? defaultValue : "" : defaultValue? defaultValue : ""
}

export const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const regexValidation = (valueToCheck, validationListKeysToCheck, allValidationList) => {
    var isValid = true
    var validationErrors = []
    validationListKeysToCheck.forEach(validationKey => {
        var validation = allValidationList[validationKey]
        if(!validation || validation.reg.test(valueToCheck) == validation.invalidBool) {
            isValid = false
            var error = validation && validation.error? validation.error : validationKey
            console.log("regexValidation", validationKey, validation, error)
            validationErrors.push(error)
        }
    });
    return {isValid: isValid, errors: validationErrors}
}

export const  getFullUrl = (req, fallback, query) => {
    let url
    //server side request object(req)
    if(req) {
      url = req.protocol + '://' + req.get('host') + req.originalUrl
      
    } //making sure we are on the client side
    else if(isClient()) {
      url = window.location.href
      
    } else {
      url = fallback
    }
    return url
}

export const arrayIsInArray = (arr1, arr2) => {
    return arr1.some(r=> arr2.includes(r))
}

export const removeStopwords = (str, separator) => {
    const STOP_WORDS = ['a', 'able', 'about', 'above', 'abroad', 'according', 'accordingly', 'across', 'actually', 'adj', 'after', 'afterwards', 'again', 'against', 'ago', 'ahead', "ain't", 'all', 'allow', 'allows', 'almost', 'alone', 'along', 'alongside', 'already', 'also', 'although', 'always', 'am', 'amid', 'amidst', 'among', 'amongst', 'an', 'and', 'another', 'any', 'anybody', 'anyhow', 'anyone', 'anything', 'anyway', 'anyways', 'anywhere', 'apart', 'appear', 'appreciate', 'appropriate', 'are', "aren't", 'around', 'as', "a's", 'aside', 'ask', 'asking', 'associated', 'at', 'available', 'away', 'awfully', 'b', 'back', 'backward', 'backwards', 'be', 'became', 'because', 'become', 'becomes', 'becoming', 'been', 'before', 'beforehand', 'begin', 'behind', 'being', 'believe', 'below', 'beside', 'besides', 'best', 'better', 'between', 'beyond', 'both', 'brief', 'but', 'by', 'c', 'came', 'can', 'cannot', 'cant', "can't", 'caption', 'cause', 'causes', 'certain', 'certainly', 'changes', 'clearly', "c'mon", 'co', 'com', 'come', 'comes', 'concerning', 'consequently', 'consider', 'considering', 'contain', 'containing', 'contains', 'corresponding', 'could', "couldn't", 'course', "c's", 'currently', 'd', 'dare', "daren't", 'definitely', 'described', 'despite', 'did', "didn't", 'different', 'directly', 'do', 'does', "doesn't", 'doing', 'done', "don't", 'down', 'downwards', 'during', 'e', 'each', 'edu', 'eg', 'eight', 'eighty', 'either', 'else', 'elsewhere', 'end', 'ending', 'enough', 'entirely', 'especially', 'et', 'etc', 'even', 'ever', 'evermore', 'every', 'everybody', 'everyone', 'everything', 'everywhere', 'ex', 'exactly', 'example', 'except', 'f', 'fairly', 'far', 'farther', 'few', 'fewer', 'fifth', 'first', 'five', 'followed', 'following', 'follows', 'for', 'forever', 'former', 'formerly', 'forth', 'forward', 'found', 'four', 'from', 'further', 'furthermore', 'g', 'get', 'gets', 'getting', 'given', 'gives', 'go', 'goes', 'going', 'gone', 'got', 'gotten', 'greetings', 'h', 'had', "hadn't", 'half', 'happens', 'hardly', 'has', "hasn't", 'have', "haven't", 'having', 'he', "he'd", "he'll", 'hello', 'help', 'hence', 'her', 'here', 'hereafter', 'hereby', 'herein', "here's", 'hereupon', 'hers', 'herself', "he's", 'hi', 'him', 'himself', 'his', 'hither', 'hopefully', 'how', 'howbeit', 'however', 'hundred', 'i', "i'd", 'ie', 'if', 'ignored', "i'll", "i'm", 'immediate', 'in', 'inasmuch', 'inc', 'indeed', 'indicate', 'indicated', 'indicates', 'inner', 'inside', 'insofar', 'instead', 'into', 'inward', 'is', "isn't", 'it', "it'd", "it'll", 'its', "it's", 'itself', "i've", 'j', 'just', 'k', 'keep', 'keeps', 'kept', 'know', 'known', 'knows', 'l', 'last', 'lately', 'later', 'latter', 'latterly', 'least', 'less', 'lest', 'let', "let's", 'like', 'liked', 'likely', 'likewise', 'little', 'look', 'looking', 'looks', 'low', 'lower', 'ltd', 'm', 'made', 'mainly', 'make', 'makes', 'many', 'may', 'maybe', "mayn't", 'me', 'mean', 'meantime', 'meanwhile', 'merely', 'might', "mightn't", 'mine', 'minus', 'miss', 'more', 'moreover', 'most', 'mostly', 'mr', 'mrs', 'much', 'must', "mustn't", 'my', 'myself', 'n', 'name', 'namely', 'nd', 'near', 'nearly', 'necessary', 'need', "needn't", 'needs', 'neither', 'never', 'neverf', 'neverless', 'nevertheless', 'new', 'next', 'nine', 'ninety', 'no', 'nobody', 'non', 'none', 'nonetheless', 'noone', 'one', 'nor', 'normally', 'not', 'nothing', 'notwithstanding', 'novel', 'now', 'nowhere', 'o', 'obviously', 'of', 'off', 'often', 'oh', 'ok', 'okay', 'old', 'on', 'once', 'one', 'ones', "one's", 'only', 'onto', 'opposite', 'or', 'other', 'others', 'otherwise', 'ought', "oughtn't", 'our', 'ours', 'ourselves', 'out', 'outside', 'over', 'overall', 'own', 'p', 'particular', 'particularly', 'past', 'per', 'perhaps', 'placed', 'please', 'plus', 'possible', 'presumably', 'probably', 'provided', 'provides', 'q', 'que', 'quite', 'qv', 'r', 'rather', 'rd', 're', 'really', 'reasonably', 'recent', 'recently', 'regarding', 'regardless', 'regards', 'relatively', 'respectively', 'right', 'round', 's', 'said', 'same', 'saw', 'say', 'saying', 'says', 'second', 'secondly', 'see', 'seeing', 'seem', 'seemed', 'seeming', 'seems', 'seen', 'self', 'selves', 'sensible', 'sent', 'serious', 'seriously', 'seven', 'several', 'shall', "shan't", 'she', "she'd", "she'll", "she's", 'should', "shouldn't", 'since', 'six', 'so', 'some', 'somebody', 'someday', 'somehow', 'someone', 'something', 'sometime', 'sometimes', 'somewhat', 'somewhere', 'soon', 'sorry', 'specified', 'specify', 'specifying', 'still', 'sub', 'such', 'sup', 'sure', 't', 'take', 'taken', 'taking', 'tell', 'tends', 'th', 'than', 'thank', 'thanks', 'thanx', 'that', "that'll", 'thats', "that's", "that've", 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'thence', 'there', 'thereafter', 'thereby', "there'd", 'therefore', 'therein', "there'll", "there're", 'theres', "there's", 'thereupon', "there've", 'these', 'they', "they'd", "they'll", "they're", "they've", 'thing', 'things', 'think', 'third', 'thirty', 'this', 'thorough', 'thoroughly', 'those', 'though', 'three', 'through', 'throughout', 'thru', 'thus', 'till', 'to', 'together', 'too', 'took', 'toward', 'towards', 'tried', 'tries', 'truly', 'try', 'trying', "t's", 'twice', 'two', 'u', 'un', 'under', 'underneath', 'undoing', 'unfortunately', 'unless', 'unlike', 'unlikely', 'until', 'unto', 'up', 'upon', 'upwards', 'us', 'use', 'used', 'useful', 'uses', 'using', 'usually', 'v', 'value', 'various', 'versus', 'very', 'via', 'viz', 'vs', 'w', 'want', 'wants', 'was', "wasn't", 'way', 'we', "we'd", 'welcome', 'well', "we'll", 'went', 'were', "we're", "weren't", "we've", 'what', 'whatever', "what'll", "what's", "what've", 'when', 'whence', 'whenever', 'where', 'whereafter', 'whereas', 'whereby', 'wherein', "where's", 'whereupon', 'wherever', 'whether', 'which', 'whichever', 'while', 'whilst', 'whither', 'who', "who'd", 'whoever', 'whole', "who'll", 'whom', 'whomever', "who's", 'whose', 'why', 'will', 'willing', 'wish', 'with', 'within', 'without', 'wonder', "won't", 'would', "wouldn't", 'x', 'y', 'yes', 'yet', 'you', "you'd", "you'll", 'your', "you're", 'yours', 'yourself', 'yourselves', "you've", 'z', 'zero']
    var res = []
    var words = str.split(separator)
    for(var i = 0; i < words.length; i++) {
       var word_clean = words[i].split(".").join("")
       if(!STOP_WORDS.includes(word_clean)) {
           res.push(word_clean)
       }
    }
    return(res.join(separator))
}  
export const slugify = (string, lang) => {
    const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
    const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------'
    const p = new RegExp(a.split('').join('|'), 'g')
    
    var slug = string.toString().toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
      .replace(/&/g, '-and-') // Replace & with 'and'

    slug = removeStopwords(slug, "-")

    slug = slug
      .replace(/[^\w\-]+/g, '') // Remove all non-word characters
      .replace(/\-\-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, '') // Trim - from end of text

    return slug
}

export const notSet = value => {
    return value === undefined || value === null 
}
export const textEmpty = value => {
    return notSet(value) || (typeof value == "string" && value.length == 0)
}

export const isFile = value => {
    return typeof value.name == 'string';
}
export const isString = value => {
    return typeof value == 'string';
}

export const buildProductLink = (id, title, catTextId, subCatTextId) => {
    return `/${catTextId}/${subCatTextId}/${notSet(id)? `${slugify(title || "")}` : `${slugify(title || "")}-${id}`}`
}

export const destroyProductLink = link => {
    var linkShreds = link.split("/")
    
    var i = linkShreds[0].length > 0? 0 : 1

    var slug = linkShreds[i + 2] || ""
    return {
        cat_text_id: linkShreds[i + 0],
        subcat_text_id: linkShreds[i + 1],
        slug: slug,
        id: slug.split("-").pop()
    }
}
const CURRENCY_MAP = {
    eur: '€'
}
export const currencyCodeToSymbol = code => {
    return CURRENCY_MAP[code.toLowerCase()] || code
}

export const formatMoney = (amount, locale, minFrac, maxFrac) => {
    return parseFloat(amount).toLocaleString(locale, {minimumFractionDigits: minFrac || 0, maximumFractionDigits: maxFrac || minFrac || 0})
}

export const imageUrlToDimension = (url, maxWidth, maxHeight) => {
    try {
        var dimns = url.split("/").pop().split('.').slice(0, -1).join(".").split(IMAGE_FILENAME_AND_DIMENSIONS_SEPERATOR).pop().split(IMAGE_DIMENSIONS_SEPERATOR)
        //console.log("PROD:2", dimns, url)
        return resizeImage({width: parseInt(dimns[0]), height: parseInt(dimns[1])}, maxWidth, maxHeight)

    } catch(e) {
        return null
    }

}

export const resizeImage = (dimns, maxWidth, maxHeight) => {
    if(!maxWidth || !maxHeight) return dimns
    var r = Math.min(maxWidth / dimns.width, maxHeight / dimns.height);
    //console.log("PROD:3", r, maxWidth / dimns.width, maxHeight / dimns.height)
    return { width: dimns.width * r, height: dimns.height * r };
}

export const href = url => {
    window.location.href = url
}

export const hrefBlank = url => {
    var a = document.createElement('a');
    a.target="_blank";
    a.href=url;
    a.click();
}

export const tel = number => {
    hrefBlank(`tel:${number}`)
}

export const showSignInAlert = (t) => {
    Swal.fire({
        text: t('common:require-login-message'),
        icon: 'info',
        showCancelButton: true,
        cancelButtonText: t('common:cancel'),
        confirmButtonText: t('header:sign-in')
    })
    .then(result => {
        if(result.isConfirmed) {
            signIn()
        }
    })
}

export const userName = (username, id) => {
    return `${USERLINK_PREFIX}${username || `${NO_USERLINK_ID_PREFIX}${id}`}`
}

export const userLink = (username, id) => {
    return `/${userName(username, id)}`
}

export const getFilterClause = (start, clauses, joiner, newClause) => {
    return clauses + (clauses.toUpperCase().startsWith(start.toUpperCase())? ` ${joiner} ` : `${start.toUpperCase()} `) + newClause
}

export const imageFileToUrl = (file, onUrl) => {
    var blob = new Blob([file], { type: file.type });
    var blobUrl = URL.createObjectURL(blob);

    var xhr = new XMLHttpRequest;
    xhr.responseType = 'blob';

    xhr.onload = function() {
    var recoveredBlob = xhr.response;

    var reader = new FileReader;

    reader.onload = function() {
        var blobAsDataUrl = reader.result;
       onUrl(blobAsDataUrl)
    };

    reader.readAsDataURL(recoveredBlob);
    };

    xhr.open('GET', blobUrl);
    xhr.send();
}

export const createChatId = (id1, id2, isGeneral) => {
    if(isGeneral) return GENERAL_MESSAGE_CHAT_ID
    try {
        var a = [parseInt(String(id1).trim()), parseInt(String(id2).trim())]
        a.sort()
        return a.join(CHAT_ID_SEPARATOR)

    } catch(e) {
        return null
    }
}

export const extFromUrl = url => {
    return url.split(".").pop()
}
export const extToMime = ext => {
    var types = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif"
    }
    return types[ext.toLowerCase()]
}

export const timeDiffTypes = {
    mill: 1,
    sec: 1000,
    min: 1000 * 60,
    hour: 1000 * 60 * 60,
    day: 1000 * 60 * 60 * 24,
    week: 1000 * 60 * 60 * 24 * 7,
    month_28: 1000 * 60 * 60 * 24 * 30,
    month_30: 1000 * 60 * 60 * 24 * 30,
    month_31: 1000 * 60 * 60 * 24 * 30,
    quarter: (1000 * 60 * 60 * 24 * 365) / 4,
    year: 1000 * 60 * 60 * 24 * 365

}
export const timeDiff = (bigDate, smallDate, type, negativeValue) => {
    var diffMill = bigDate.getTime() - smallDate.getTime()
    if(!type && !negativeValue) {
        return diffMill
    }
    if(diffMill < 0) {
        if(negativeValue !== undefined) return negativeValue
        return diffMill
    }
    if(type && Object.values(timeDiffTypes).includes(type)) {console.log("DIFF:", Math.round(diffMill / type))
        return Math.round(diffMill / type)
    }
    return diffMill
}

export const getCurrentPackageDaysLeft = (boosterExpiry) => {
    return timeDiff(boosterExpiry, new Date(), timeDiffTypes.day, 0)
}