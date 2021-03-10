
import Image from 'next/image'
import { DEFAULT_IMAGE_HOST } from '../utils/constants'
import getConfig from 'next/config'
import { extractHostname } from '../utils/functions'
const myLoader = ({ src, width, quality }) => {
  return `https://example.com/${src}?w=${width}&q=${quality || 75}`
}

const { publicRuntimeConfig } = getConfig()
const domains = publicRuntimeConfig.domains

const ImageView = ({src, isDefaultHost, host, ...props}) => {
  const imgSrc = imageSrc({src: src, isDefaultHost: isDefaultHost, host: host})
  if((imgSrc.startsWith("http://") || imgSrc.startsWith("https://")) && !domains.includes(extractHostname(imgSrc))) {
    return (
      <img src={imgSrc} {...props} />
    )
  }
  return (
    <Image
      src={imgSrc}
      {...props}
    />
  )
}

export const imageSrc = ({src, isDefaultHost, host}) => {
  return `${isDefaultHost && src.startsWith("/")? DEFAULT_IMAGE_HOST : host && src.startsWith("/")? host : ""}${src}`
}

export default ImageView