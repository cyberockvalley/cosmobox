import { text } from "body-parser"
import { useEffect, useState } from "react"

const lStyle = {
    marginBottom: '7px'
}
const checkText = (text, truncate) => {
    if(truncate && truncate.length < text?.length) {
        return {text: text.substring(0, truncate.length), hasMore: true}

    } else {
        return {text: text, hasMore: false}
    }
}
export default function TextView ({children, truncate, className, style, lineClassName, lineStyle}) {
    
    const [check, setCheck] = useState(checkText(children, truncate))

    const [textArray, setTextArray] = useState(check.text?.split("\n") || [])
    const [totalLines, setTotalLines] = useState(textArray.length)
    const [keyPrefix, setKeyPrefix] = useState(String(Math.random()))

    const hasMoreText = () => {
        return truncate?.moreText && truncate.moreText.length > 0
    }
    const addMore = line => {
        return <>{line} {check.hasMore? <span style={hasMoreText()? {cursor: 'pointer', fontSize: '70%'} : {fontSize: '70%'}} className={truncate.moreClass} onClick={hasMoreText()? () => setCheck(checkText(children, null)) : null}>... {truncate.moreText || ''}</span> : ''}</>
    }

    useEffect(() => {
        setCheck(checkText(children, truncate))
        setTextArray(checkText(children, truncate).text?.split("\n") || [])
        setTotalLines(textArray.length)
        setKeyPrefix(String(Math.random()))
    }, [children])
    
    return (
        <div className={className} style={style}>
            {
                textArray.map((line, index) => {
                    return <div key={`${keyPrefix}${index}`} className={lineClassName || ""} style={!lineClassName && !lineStyle? lStyle : lineStyle}>{index == totalLines - 1? addMore(line) : line}</div>
                })
            }
        </div>
    )
}