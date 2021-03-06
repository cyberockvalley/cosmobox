import { useEffect, useState } from "react";
import { isClient } from "../../utils/functions";
import SideBar from "./SideBar";
import SingleChat from "./SingleChat";

const $ = require("jquery")

const ChatView = ({t, profilePhoto, sender, chats, messages, chatId, chatIdSetter, editorMaxLength, editorSendHandler}) => {

  const [chat, setChat] = useState()
  const [chatIndex, setChatIndex] = useState(-1)
  const [messagesState, setMessagesState] = useState(messages)

  const [chatsState, setChatsState] = useState(chats)
  useEffect(() => {
    setChatsState(chats)

  }, [chats])

  useEffect(() => {
    console.log("currentChat", "m", messages)
    setMessagesState(messages)

  }, [messages])

  useEffect(() => {
    if(chat) {
      chatIdSetter(chat.chat_id)
    }
  }, [chat])

  const handleChatSet = (chat, chatIndex) => {
    setChat(chat)
    setChatIndex(chatIndex)
  }

  const handleBack = () => {
    setChat(null)
    chatIdSetter(null)
  }

  const handleEditorSend = (message, time) => {
    var newChatsState = chatsState
    console.log("handleEditorSend:", newChatsState, chatIndex, newChatsState[chatIndex])
    newChatsState[chatIndex].createdAt = time
    setChatsState(newChatsState)
    console.log("handleEditorSend2:", newChatsState, chatIndex, newChatsState[chatIndex])
    return editorSendHandler({
      message: message,
      chat: newChatsState[chatIndex]
    })
  }

  return (
    <div className="container chat">
      <div className="row chat-one">
        <SideBar className={`side-bar ${chat? 'd-sm-block' : 'd-block'}`} t={t} sender={sender} profilePhoto={profilePhoto} chats={chatsState} chatIdSetter={chatIdSetter} chatId={chatId} chatSetter={handleChatSet}></SideBar>
        <SingleChat editorMaxLength={editorMaxLength} editorSendHandler={handleEditorSend} t={t} sender={sender} messages={messages} chat={chat} backHandler={handleBack}></SingleChat>
      </div>
    </div>
  )
}

if(isClient()) {
    $(function(){
        $(".heading-compose").click(function() {
          $(".side-two").css({
            "left": "0"
          });
        });
    
        $(".newMessage-back").click(function() {
          $(".side-two").css({
            "left": "-100%"
          });
        });
    }) 
}

export default ChatView