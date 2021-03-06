import Masonry, {ResponsiveMasonry} from "react-responsive-masonry"

import styles from '../../styles/Masonry.module.css'
import ImageView from "../../views/ImageView"

const Photo = ({ photo }) => {
    console.log("Photo", photo)
    return (
        <div className={styles.image}>
            <ImageView
                isDefaultHost
                src={photo.url}
                width={photo.width}
                height={photo.height}
                layout="responsive"
                alt=""
            />
        </div>
    )
}
export default function Photos({photos}) {
    if(!photos || !Array.isArray(photos)) return null
    return(
        <ResponsiveMasonry columnsCountBreakPoints={{350: 1, 750: 2, 900: 3, 1200: 4}}>
            <Masonry gutter={10}>
                {
                    photos.map((photo, i) => {
                        return <Photo photo={photo} key={i} />
                    })
                }
            </Masonry>
        </ResponsiveMasonry>
    )
}