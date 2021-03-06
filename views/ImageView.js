
import Image from 'next/image'
import { DEFAULT_IMAGE_HOST } from '../utils/constants'

const myLoader = ({ src, width, quality }) => {
  return `https://example.com/${src}?w=${width}&q=${quality || 75}`
}


const ImageView = ({src, isDefaultHost, host, ...props}) => {
  return (
    <Image
      src={imageSrc({src: src, isDefaultHost: isDefaultHost, host: host})}
      {...props}
    />
  )
}

export const imageSrc = ({src, isDefaultHost, host}) => {
  return `${isDefaultHost && src.startsWith("/")? DEFAULT_IMAGE_HOST : host && src.startsWith("/")? host : ""}${src}`
}

export default ImageView