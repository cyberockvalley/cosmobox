
import { NO_PROFILE_PIC } from "../../utils/constants";
import ChatList from "./ChatList";
import NewChatContactList from "./NewChatContactList";

const SideBar = ({t, chatSetter, className, profilePhoto, chats, chatId, sender}) => (
  <div className={`col-sm-4 side ${className}`}>
    <ChatList sender={sender} t={t} chatId={chatId} profilePhoto={profilePhoto} chats={chats} chatClickHandler={chatSetter}></ChatList>
    <NewChatContactList></NewChatContactList>
  </div>
);

export default SideBar;
