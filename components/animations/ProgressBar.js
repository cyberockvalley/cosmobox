
export default function ProgressBar({style, striped, status, level, anim, message, button}) {

    return(
        <div className="d-flex flex-column justify-content-center align-items-center" style={style || {width: '100%'}}>
        <div className="d-flex justify-content-center align-items-center">{message || ""}</div>
            <div className="progress" style={{width: '100%'}}>
                <div className={`progress-bar ${anim? 'progress-bar-animated' : ''} ${status? `bg-${status}` : ''} ${striped? 'progress-bar-striped' : ''}`} style={{width: `${level || 100}%`}}></div>
            </div>
            {
                !button? null :
                <button style={{marginTop: 15}} className={`btn ${status? `btn-${status}` : ''}`} onClick={button.clickHandler}>{button.text || ""}</button>
            }
        </div>
    )
}