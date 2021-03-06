
import Search, { getServerSideProps as serverSideProps } from './index'

export default Search

export async function getServerSideProps(context) {
    return await serverSideProps(context)
}