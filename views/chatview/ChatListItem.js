import { useEffect, useState } from "react";
import { userName } from "../../utils/functions"
import { getChatTimeText } from "./utils";

const ChatListItem = ({chat, t, onClick, isSelected, chatIndex}) => {

  const [isSelectedState, setIsSelectedState] = useState(isSelected)

  const [chatState, setChatState] = useState(chat)
  useEffect(() => {
    setChatState(chat)
  }, [chat])

  const [chatTime, setChatTime] = useState(chat?.createdAt)
  useEffect(() => {
    setChatTime(chat?.createdAt)

  }, chat?.createdAt)

  useEffect(() => {
    if(isSelected) {
      onClick(chat, chatIndex)
    }
  }, [isSelected])

  return (
    <div className={`row sideBar-body ${isSelected? 'chat-selected' : ''}`} onClick={() => onClick(chat, chatIndex)}>
      <div className="col-sm-3 col-3 sideBar-avatar">
        <div className="avatar-icon">
          <img src={chatState?.chatterImage} />
        </div>
      </div>
      <div className="col-sm-9 col-9 sideBar-main">
        <div className="d-flex flex-column">
          <div className="row">
            <div className="col-sm-8 col-8 sideBar-name">
              {
                chatState?.is_general?
                <span className="name-meta text-cap">{t('header:site-name')}</span>
                :
                <span className="name-meta text-lower">{userName(chatState?.chatterUsername, chatState?.chatterId)}</span>
              }
            </div>
            <div className="col-sm-4 col-4 pull-right sideBar-time">
              {
                !chatTime? null :
                <span className="time-meta pull-right text-lower">{getChatTimeText(chatTime, t('yesterday'))}</span>
              }
            </div>
          </div>
          <div className="ofx-hidden more-text">
            {chat.text}
          </div>
        </div>
      </div>
    </div>
  )
}


export default ChatListItem;
