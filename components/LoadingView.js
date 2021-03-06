import useTranslation from "next-translate/useTranslation"
import LoadingBalls from "./animations/LoadingBalls"


export default function LoadingView({title, message}) {
    const { t } = useTranslation('common')

    return(
        <div className="loading-view">
            {
                title? <h1>{title}</h1> : null
            }
            <div className="i">
                {
                    message? message : `${t('please-wait')}...`
                }
            </div>
            <LoadingBalls />
        </div>
    )
}