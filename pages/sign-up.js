import Auth from './sign-in'

export default Auth


export async function getStaticProps(context) {
    return {
        props: {
            isSignUp: true
        }
    }
}