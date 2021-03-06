import { Box } from "@chakra-ui/react"

export default function EmptyView({message}) {
    return(
        <div style={{minHeight: "300px"}} className="w-100 h-100 d-flex flex-column justify-content-center align-items-center">
            <Box color="#fea136" className="fa fa-3x fa-binoculars mb-1"></Box>
            <div>{message || ""}</div>
        </div>
    )
}