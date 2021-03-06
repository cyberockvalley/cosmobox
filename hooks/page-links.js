import { userLink } from "../utils/functions";


export default function getPageLinks(arg) {
    return {
        signInPageLink: "/sign-in",
        signUpPageLink: "/sign-up",
        profilePageLink: userLink(arg?.username, arg?.id),//takes user object
        sellPageLink: "/sell",
        sellEditPageLink: `/sell/${arg}`,//takes product id
        countryLink: `/group/${(String(arg) || "#").toLowerCase()}`//takes country sortname
    }
}