
import Home, { getServerSideProps as serverSideProps } from '../index'

export default Home

export async function getServerSideProps(context) {
    return await serverSideProps(context)
}