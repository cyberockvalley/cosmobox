import useTranslation from 'next-translate/useTranslation';
import L from 'next/link';

const linkNativeProps = ["href", "as", "passHref", "prefetch", "replace", "scroll", "shallow", "locale"]
export default function Link(props) {
    const { lang } = useTranslation()
    const aProps = {...props}
    delete aProps.href
    const shallow = !(props.shallow === undefined)? props.shallow : props.locale && props.locale != lang? true : false
    return (
        <L href={props.href} {...props.config} locale={props.locale || lang} shallow={shallow}>
            <a {...aProps}>
                {props.children}
            </a>
        </L>
    )
}