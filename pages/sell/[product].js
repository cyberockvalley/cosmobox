
import Sell from './index'

export default Sell

export async function getStaticProps(context) {
    return {
        props: {isEdit: true}
    }
}

export const getStaticPaths = async () => {

    return {
        paths: [], //indicates that no page needs be created at build time
        fallback: 'blocking' //indicates the type of fallback
    }
}