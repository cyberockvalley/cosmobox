
export const formRulesKeys = {
    sell: "sell",
    SingleProduct: 'single-product',
    ProfileSettings: 'profile-settings'
}

export const formRules = {
    [formRulesKeys.sell]: {
        title: {type: 'text', required: "error-enter-title", minChar: [2, "error-short-title"], maxChar: [70, "error-long-title"]},
        cat: {type: 'number', required: "error-select-cat", minValue: [0, "error-select-cat"]},
        subcat: {type: 'number', required: "error-select-subcat", minValue: [0, "error-select-subcat"]},
        price: {type: 'number', required: "error-enter-price", minValue: [1, 'price-min'], commaNum: true, maxDigits: [18, "error-big-price"]},
        description: {type: 'text', required: false, maxChar: [10000, "error-long-description"]},
        country: {type: 'number', required: "error-select-region", minValue: [0, "error-select-region"]},
        city: {type: 'number', required: "error-select-city", minValue: [0, "error-select-city"]},
        photos: {type: 'array', required: "error-add-photos", maxLength: [10, "error-too-many-photos"], validTypes: [["image/png", "image/jpg", "image/jpeg"], 'invalid-photos']},
        booster: {type: 'text', required: "error-select-booster"}

    },
    [formRulesKeys.SingleProduct]: {
        rating: {type: 'number', required: "error-no-rating", minValue: [1, "error-invalid-rating"], maxValue: [5, "error-invalid-rating"]},
        text: {type: 'text', required: false, maxChar: [500, "error-long-review"]},
        message: {type: 'text', required: "common:error-enter-message", minChar: [2, "common:error-short-message"], maxChar: [500, "common:error-long-message"]}
    },
    [formRulesKeys.ProfileSettings]: {
        name: {type: 'text', required: "error-enter-name", minChar: [1, "error-short-name"], maxChar: [30, "error-long-name"]},
        username: {
            type: 'text', 
            required: false, 
            maxChar: [30, "error-long-username"], 
            others: "error-username-invalid-chars"
        },
        telephone: {type: 'text', required: false, maxChar: [20, "error-invalid-number"]},
        bio: {type: 'text', required: false, maxChar: [150, "error-long-bio"]},
        photos: {type: 'array', required: "error-no-photo-sent", maxLength: [1, "error-too-many-photos"], validTypes: [["image/png", "image/jpg", "image/jpeg"], 'invalid-photos']}
    }
}
export const getCharsRem = (max, count) => {
    var rem = max - count
    return rem < 0? 0 : rem
}

const commaNum = num => {
    num += "";
    //remove non-digit characters
    num = num.replace(/D/g, "");
    //add commas before every 3 digits
    num = num.split(/(?=(?:d{3})+$)/).join(",");
    return num;
}

export const formFieldSet = (value, rules, invalidReturn, onSet, onType) => {
    var set = true; var newValue = value
    if(rules) {
        if(rules?.maxChar && value.length > rules.maxChar[0]) {
            set = false
    
        }
        if(rules.type == 'number') {
            newValue = newValue.toString().replace(/[,.]+/g, "")
            if(/[0-9]+/g.test(newValue)) {
                newValue = parseInt(newValue.toString())
                if(rules.commaNum) {
                    newValue = newValue.toLocaleString();

                }
                newValue.toString()

            } else {
                newValue = ""
            }

            if(rules.maxDigits && newValue.toString().replace(",", "").length > rules.maxDigits[0]) {
                set = false
            }
            if(newValue.length > 0 && rules.maxValue && parseInt(newValue.toString().replace(",", "")) > rules.maxValue[0]) {
                
                set = false

            }

        } else if(rules.type == 'array') {
            if(rules.maxLength && value.length > rules.maxLength[0]) {
                set = false

            }
        }

        if(rules.validTypes && onType) {
            if(rules.type == 'array') {
                var validItems = []
                newValue.forEach(item => {
                    //console.log("MIME", onType(item))
                    if(rules.validTypes[0].includes(onType(item))) {
                        validItems.push(item)
                    }
                })
                newValue = validItems

            } else {
                if(rules.validTypes[0].includes(onType(newValue))) {
                    set = false
                }
            }
            
        }

        if(onSet) {
            onSet(set? newValue : invalidReturn)

        } else {
            return set? newValue : invalidReturn
        }
        

    } else {
        if(onSet) {
            onSet(newValue)

        } else {
            return newValue
        }

    }
}
export const formFieldGet = (value, rules, nullValue, onError) => {
    switch(rules.type) {
        case 'text':
            if(rules.required && (value || "").length == 0) {
                if(onError) onError(rules.required || "")
                return nullValue

            } else if(rules.minChar && (value || "").length < rules.minChar[0]) {
                if(onError) onError(rules.minChar[1]? rules.minChar[1] : "", (value || "").length, rules.minChar[0])
                return nullValue

            } else {
                return value
            }
        case 'number': 
            if(rules.required && (String(value) || "").length == 0) {
                if(onError) onError(rules.required || "")
                return nullValue

            } else if(rules.minDigits && (String(value) || "").replace(",", "").length < rules.minDigits[0]) {
                if(onError) onError(rules.minDigits[1]? rules.minDigits[1] : "", (String(value) || "").replace(",", "").length, rules.minDigits[0])
                return nullValue

            } else if(rules.minValue && parseInt((String(value) || "0").replace(",", "")) < rules.minValue[0]) {
                if(onError) onError(rules.minValue[1]? rules.minValue[1] : "", parseInt((String(value) || "0").replace(",", "")), rules.minValue[0])
                return nullValue

            } else {
                return parseInt(String(value).replace(",", ""))
            }
        case 'array':
            if(rules.required && (value || []).length == 0) {
                if(onError) onError(rules.required || "")
                return nullValue

            } else if(rules.minLength && (value || []).length < rules.minLength[0]) {
                if(onError) onError(rules.minLength[1]? rules.minLength[1] : "", (value || []).length, rules.minLength[0])
                return nullValue

            } else {
                return value
            }
        default:
            return value
            
    }
}
export default function useFormRules(ruleKey) {
    if(!ruleKey) return formRulesKeys
    return formRules[ruleKey]
}