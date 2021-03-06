
export const getLocaleColName = (name, locale) => {
    if(!locale) return name
    return `${name}_${locale}`
}