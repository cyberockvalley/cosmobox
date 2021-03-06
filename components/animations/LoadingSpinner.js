
export default function LoadingSpinner({message, children, hide}) {

    return(
        <div className="d-flex flex-column justify-content-center align-items-center">
            <div className="d-flex justify-content-center align-items-center" style={{background: "#fff", padding: '20px'}}>
                <img style={{display: hide? 'none' : 'block'}} src="/res/images/spin.svg" width="50" height="50" />
                <div style={{marginLeft: 20}}>{message}</div>
            </div>
            <div className="d-flex justify-content-center align-items-center" style={{width: '100%'}}>
                {children}
            </div>
        </div>
    )
}