
const formatTel = (tel, prefix) => {
    return `${prefix && !tel.startsWith(prefix)? '+' : ''}${tel}`
}
export default function Telview({tel, prefix}) {

    return (<span>{formatTel(tel, prefix)}</span>)
}