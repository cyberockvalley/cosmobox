
import MessageListItem from "./MessageListItem";
import Editor from "./Editor";
import { DB_PHOTOS_SEPERATOR } from "../../utils/constants";
import { buildProductLink, isClient } from "../../utils/functions";
import { getChatTimeText } from "./utils";
import { useEffect, useState } from "react";
import useTranslation from 'next-translate/useTranslation'
import i18n from "../../i18n";
import Swal from "sweetalert2";
import ImageView from "../ImageView";

const $ = require('jquery')

const SingleChat = ({t, sender, chat, messages, backHandler, editorMaxLength, editorSendHandler}) => {
  const {lang} = useTranslation()

  const [newMessages, setNewMessages] = useState([])
  const [sending, setSending] = useState(false)

  const handleEditorSend = messageVersions => {
    var time = JSON.parse(JSON.stringify(new Date()))

    setSending(true)
    Promise.resolve(editorSendHandler(messageVersions, time))
    .then(result => {
      setSending(false)
      //console.log("SingleChatPromise", result)
      if(result.ok) {
        var message = messageVersions.defaultMsg
        if(lang != i18n.defaultLocale && messageVersions[lang]) {
          message = messageVersions[lang]
        }
        setNewMessages([...newMessages, {
          text: message,
          createdAt: time
        }])

      } else {
        const {request, response, message} = result.error
        if(response.status) {
          if(response?.data.error) {
              Swal.fire({
                text: t(response.data.error),
                icon: "error",
                confirmButtonText: t('common:ok'),
                cancelButtonText: t('common:ok')
              })

          } else if(response?.data.errors) {
              var msgError = ""
              for( const [key, value] of Object.entries(response.data.errors)) {
                msgError += `${t(value)} <br />`
              }
              Swal.fire({
                html: msgError,
                icon: "error",
                confirmButtonText: t('common:ok'),
                cancelButtonText: t('common:ok')
              })
              
          } else {
            Swal.fire({
              text: t('common:error-try-again'),
              icon: "error",
              confirmButtonText: t('common:ok'),
              cancelButtonText: t('common:ok')
            })
          }

        } else if(request) {
            Swal.fire({
              text: t('common:network-error'),
              icon: "error",
              confirmButtonText: t('common:ok'),
              cancelButtonText: t('common:ok')
            })

        } else {
            Swal.fire({
              text: t('common:error-try-again'),
              icon: "error",
              confirmButtonText: t('common:ok'),
              cancelButtonText: t('common:ok')
            })

        }
      }
    })
  }

  useEffect(() => {
    if(isClient()) {
      $("#msg-list").animate({ scrollTop: $("#msg-list")[0]?.scrollHeight}, 1000)
    }
  }, [newMessages, messages])

  if(!chat) {
    return (
      <div className="col-sm-8 d-flex justify-content-center align-items-center flex-column">
        <div className="fa fa-3x fa-empty-set"></div>
        <div className="h2 p-0 m-0 opacity-3">
          {t('no-chat-selected-message')}
        </div>
      </div>
    )

  } else {
    return (
      <div className="col-sm-8 conversation">
        <div className="row heading align-items-center">
         <div onClick={backHandler} className="col-1  heading-dot">
            <i className="fa fa-arrow-left fa-2x" aria-hidden="true" />
          </div>
          <div className="col-2 heading-avatar d-flex align-items-center">
            <div className="heading-avatar-icon rounded" style={{width: 40, height: 40}}>
              {
                sender?.image?
                <ImageView isDefaultHost src={sender?.image} width={40} height={40} /> : null
              }
            </div>
          </div>
          <div className="col-8 heading-name">
            <a className="heading-name-meta">{sender?.username}</a>
            <span className="heading-online d-none">Online</span>
          </div>
          <div className="col-2  heading-dot pull-right d-none">
            <i className="fa fa-ellipsis-v fa-2x  pull-right" aria-hidden="true" />
          </div>
        </div>
        <div className="d-flex flex-column message" id="conversation">
          <div className="message-previous d-none">
            <div className="previous">
              <a onclick="previous(this)" id="ankitjain28" name={20}>
                Show Previous Message!
              </a>
            </div>
          </div>
          <div id="msg-list" className="py-3" style={{width: "100%", overflowY: "auto"}}>
            {
              (messages || []).map((message, index) => {
                return <MessageListItem pointer={message.productId? {
                  id: message.productId,
                  image: message.productPhotos.split(DB_PHOTOS_SEPERATOR)[0],
                  title: message.productTitle,
                  link: buildProductLink(message.productId, message.productTitle, message.productCatTextId, message.productSubcatTextId)
                } : null} type={message.from_id != sender?.id? "receiver" : "sender"} text={message.text} time={getChatTimeText(message.createdAt, t('yesterday'))} />
              })
            }
            {
              newMessages.map((message, index) => {
                return <MessageListItem type={"sender"} text={message.text} time={getChatTimeText(message.createdAt, t('yesterday'))} />
              })
            }

            <MessageListItem showSending={sending} />
          </div>
        </div>
        <Editor t={t} chat={chat} sender={sender} maxLength={editorMaxLength} onSend={handleEditorSend}></Editor>
      </div>
    );
  }
}

export default SingleChat;