import ChatSearchBox from "./ChatSearchBox";
import ChatListItem from "./ChatListItem";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import getPageLinks from "../../hooks/page-links";
import ImageView from "../ImageView";

const ChatList = ({sender, t, chatId, chatClickHandler, profilePhoto, contactsProvider, menuHandler, searchHandler, chats}) => {

  const router = useRouter()
  const [chatsState, setChatsState] = useState(chats || [])
  useEffect(() => {
    setChatsState(chats)
  }, [chats])

  const [currentChatId, setCurrentChatId] = useState(chatId)
  const [currentChat, setCurrentChat] = useState()

  useEffect(() => {
    setCurrentChatId(chatId)
    
  }, [chatId])


  const handleChatClick = (chat, chatIndex) => {
    setCurrentChatId(chat.chat_id)
    setCurrentChat(chat)
    chatClickHandler(chat, chatIndex)
  }

  const closeChat = () => {
    router.replace(getPageLinks(sender).profilePageLink)
  }


  return (
    <div className="side-one">
      <div className="row heading">
        <div className="col-8 heading-avatar">
          <div className="heading-avatar-icon rounded" style={{width: 40, height: 40}}>
            <ImageView isDefaultHost src={profilePhoto} width={40} height={40} />
          </div>
        </div>
        <div className={`col-2 heading-compose pull-right ${!contactsProvider? 'opacity-0' : ''}`}>
          <i className="fa fa-comments fa-2x pull-right" aria-hidden="true" />
        </div>
        <div onClick={closeChat} className={`col-2 heading-dot  pull-right ${!menuHandler? 'd-nones' : ''}`}>
          <i className="fa fa-close fa-2x pull-right" aria-hidden="true" />
        </div>
      </div>
      {
        searchHandler?
        <ChatSearchBox></ChatSearchBox> : null
      }
      <div className="sideBar d-flex flex-column">
        {
          chatsState.map((chat, index) => {
            return <ChatListItem chatIndex={index} isSelected={chat.chat_id == currentChatId} t={t} chat={chat} key={`${chat?.chat_id}${chat?.createdAt}`} onClick={handleChatClick}></ChatListItem>
          })
        }
      </div>
    </div>
  )
}

export default ChatList;