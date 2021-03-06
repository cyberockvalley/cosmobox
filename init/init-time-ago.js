import en from 'javascript-time-ago/locale/en'
import it from 'javascript-time-ago/locale/it'
import ru from 'javascript-time-ago/locale/ru'

import TimeAgo from 'javascript-time-ago'

export const initTimeAgo = () => {
    TimeAgo.addLocale(en)
    TimeAgo.addLocale(it)
    TimeAgo.addLocale(ru)
}