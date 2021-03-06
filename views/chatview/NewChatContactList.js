
import NewChatContactSearchBox from "./NewChatContactSearchBox";
import ContactListItem from "./ContactListItem";

const NewChatContactList = () => (
  <div className="side-two">
    <div className="row newMessage-heading">
      <div className="row newMessage-main">
        <div className="col-sm-2 col-xs-2 newMessage-back">
          <i className="fa fa-arrow-left" aria-hidden="true" />
        </div>
        <div className="col-sm-10 col-xs-10 newMessage-title">New Chat</div>
      </div>
    </div>
    <NewChatContactSearchBox></NewChatContactSearchBox>
    <div className="row compose-sideBar">
      <ContactListItem></ContactListItem>
    </div>
  </div>
);

export default NewChatContactList;
