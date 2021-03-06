import useTranslation from "next-translate/useTranslation"
import { TITLE_SEPARATOR } from "../utils/constants"

import styles from '../styles/Upload.module.css'
import Head from "next/head"
import NavBar from "../components/header/NavBar"

import { FileDrop } from 'react-file-drop'
import { useEffect, useRef, useState } from "react"

import dynamic from "next/dynamic";
const OrderlyListVr = dynamic(import("../components/upload/OderlyListVr"))


const getItems = count =>
  Array.from({ length: count }, (v, k) => k).map(k => ({
    id: `item-${k}`,
    content: `item ${k}`
}));

const grid = 8;
const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: "none",
    padding: grid * 2,
    margin: `0 0 ${grid}px 0`,
  
    // change background colour if dragging
    background: isDragging ? "lightgreen" : "grey",
  
    // styles we need to apply on draggables
    ...draggableStyle
  });
  
const getListStyle = (isDraggingOver, itemsLength) => ({
    background: isDraggingOver ? "lightblue" : "lightgrey",
    padding: grid,
    width: 250
});

export default function ChallengeUpload({data}) {
    const { t } = useTranslation('challenge-upload')

    const [dragOver, setDragOver] = useState(false)
    const [uploadList, setUploadList] = useState(getItems(5))

    const [winReady, setwinReady] = useState(false);
    useEffect(() => {
        setwinReady(true);
    }, []);

    const uploadListUpdateHandler = update => {
        setUploadList(update)
    }

    
    const onFileInputChange = (event) => {
        const { files } = event.target;
        // do something with your files...
        processFiles(files)
    }

    const processFiles = files => {
        setDragOver(false)
        console.log("Files", files)

    }
    
    return(
        <div>
            <Head>
                <title>{t('title')} {TITLE_SEPARATOR} {t('header:site-name')}</title>
            </Head>
            <main>
                <NavBar user={data} />
                <section className="container">
                    <h1 className={styles.headline}>{t('title')}</h1>
                    <ul className={styles["upload-info-list"]}>
                        <li>{t('notes-1')}</li>
                        <li>{t('notes-2')}</li>
                    </ul>
                    <div className={styles["upload-form"]}>
                        <FileDrop
                        onFrameDragEnter={(event) => setDragOver(true)}
                        onFrameDragLeave={(event) => setDragOver(false)}
                        onFrameDrop={(event) => processFiles(event.dataTransfer.files)}
                        onDragOver={(event) => setDragOver(true)}
                        onDragLeave={(event) => {}}
                        onDrop={(files, event) => {}}
                        >
                            <label className="btn btn-primary" for="file-select">{t('select')}</label> &nbsp; <span>{t('ordragdrop')}</span>
                            <input
                            id="file-select"
                            style={{display: "none"}}
                            onChange={onFileInputChange}
                            type="file"
                            className="hidden"
                            multiple
                            />
                        </FileDrop>
                    </div>

                    {
                       !winReady? null :
                        <div className={styles['upload-list']}>
                            <OrderlyListVr list={uploadList} updateHandler={uploadListUpdateHandler} />
                        </div>
                    }


                    <div className={styles["dragover-overlay"]} style={{display: dragOver? "block" : "none"}}></div>
                </section>
            </main>
        </div>
    )
}

export async function getServerSideProps(context) {
    return {
      
      props: {
        data: {
          user: {
            username: "jinmi"
          }
        }
      }
    }
}