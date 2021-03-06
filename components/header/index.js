import { THEME } from "../../utils/constants";
import HeaderBanner from "./HeaderBanner";
import HeaderBannerCosmobox from "./HeaderBannerCosmobox";
import HeaderNav from "./HeaderNav";
import NavBar from "./NavBar";

export default function Header({user, banner}) {
    return(
        <>
            <NavBar noSearchBar />
            {
                THEME == "fivebazar"?
                <HeaderBanner {...banner} />
                :
                <HeaderBannerCosmobox {...banner} />
            }
        </>
    )
}