import { useEffect } from "react"

import OutsideClickHandler from 'react-outside-click-handler';

export default function Overlay({hasBg, show, allowScroll, outsideClickHandler, children}) {
    useEffect(() => {
        const $ = require('jquery')
        if(!show) {
            $('html').removeClass('noscroll')
            $('body').removeClass('noscroll')

        } else {
            $('html').addClass('noscroll')
            $('body').addClass('noscroll')
        }
    }, [show])

    const styles = {
        background: "#fff", 
        padding: '20px',
        boxShadow: '0 2px 4px rgb(0 0 0 / 10%), 0 8px 16px rgb(0 0 0 / 10%)',
        borderRadius: "15px"
    }
    
    
    return(
        <div className="overlay" style={{overflowY: allowScroll? 'auto' : '', display: show? 'block' : 'none', cursor: outsideClickHandler? 'pointer' : 'default'}}>
            <div className="d-flex justify-content-center align-items-center" style={{width: '100%', height: '100%'}}>
                {
                    !children? null : 
                    <OutsideClickHandler onOutsideClick={() => outsideClickHandler? outsideClickHandler() : {}}>
                        {
                            hasBg?
                            <div style={styles}>{children}</div>
                            :
                            children
                        }
                    </OutsideClickHandler>
                }
            </div>
        </div>
    )
}