import { map } from "jquery";

export default function InputBox({error, breakPoint, breakPointTextPrefix, className, children, attrs}) {
    return(
        <div className={`${className}`} {...attrs}>
            {children}
            {
                !error || error.length == 0? null :
                !breakPoint || breakPoint.length == 0 || error.trim().split(breakPoint).length < 2?
                <div class="invalid-feedback d-block">{error}</div>
                :
                <div class="invalid-feedback d-block">
                    {
                        error.trim().split(breakPoint).map(e => {
                            if(e.length > 0) {
                                return <>{breakPointTextPrefix}{e}<br /></>
                            }
                        })
                    }
                </div>
            }
        </div>
    )
}