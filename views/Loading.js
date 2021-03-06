
import Loader from "react-loader-spinner";

export default function Loading(props) {
    return <Loader {...props} />
}

Loading.TYPES = {
    audio: "Audio",
    bars: "Bars",
    ballTrinagle: "BallTriangle",
    circles: 'Circles',
    grid: "Grid",
    hearts: "Hearts",
    oval: "Oval",
    puff: "Puff",
    rings: 'Rings',
    tailSpin: 'TailSpin',
    threeDots: "ThreeDots"
}