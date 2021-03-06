import { options } from "next-auth/client";
import Swal from "sweetalert2";

const getAttrs = attrs => {
    var attrsText = ""
    Object.keys(attrs).forEach(attrKey => {
        attrsText += `${attrKey}="${attrs[attrKey]}" `
    })
    return attrsText
}
export default {
    fire: options => {
        var swalOptions = {...options}
        var formFields = options.formFields
        delete swalOptions.formFields

        var html = ""
        var fieldsMap = {}
        formFields.forEach(field => {
            var cls = String(field.class || "")
            if(cls.length > 0) delete field.class
            if(field.isTextArea) {
                var value = String(field.value || "")
                if(value.length > 0) delete field.value
                html += `<textarea class="swal2-input ${cls}" ${getAttrs(field)}>${value}</textarea>\n`

            } else {
                html += `<input class="swal2-input ${cls}" ${getAttrs(field)} />\n`
            }
            //get the value
            if(field.id) {
                fieldsMap[field.id] = field
            }

        });console.log("SwalForm", html)
        swalOptions.html = html
        swalOptions.preConfirm = () => {
            var errors = ""
            var returnValue = {}
            Object.keys(fieldsMap).forEach(mapKey => {
                var val = Swal.getPopup().querySelector(`#${mapKey}`).value
                if(!val && fieldsMap[mapKey].required) {
                    errors += `${fieldsMap[mapKey].required}<br />`

                } else if(val) {
                    returnValue[mapKey] = val
                }
            })
            if(errors.length > 0) {
                Swal.showValidationMessage(errors)

            }
            return returnValue
        }
        return Swal.fire(swalOptions)
    }
}