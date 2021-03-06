import { Box } from "@chakra-ui/react"
import { DEFAULT_IMAGE_HOST } from '../utils/constants'
import ImageView from "./ImageView"

export default function BackgroundImage({src, isDefaultHost, host, children, style, childrenProps, ...props}) {

    return (
        <Box as="div" className="outer" style={style} {...props}>
            <ImageView
                layout="fill"
                className="object-center object-cover pointer-events-none"
                src={`${isDefaultHost && src.startsWith("/")? DEFAULT_IMAGE_HOST : host && src.startsWith("/")? host : ""}${src}`}
                
            />
            <Box as="div" className="content" {...childrenProps}>
                { children }
            </Box>

            <style jsx>{`
                .outer {
                    position: relative;
                    width: 100%;
                }
                .outer img {
                    position: absolute;
                    object-fit: cover;
                    object-position: center;
                }
                .outer img, .content {
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    width: 100%;
                    height: 100%;
                }
                .content {
                    padding-top: 5rem;
                    padding-bottom: 5rem;
                    font-weight: bold;
                    font-size: 2rem;
                    text-align: center;
                    position: relative;
                    z-index: 1;
                }
            `}</style>
        </Box>
    )
}