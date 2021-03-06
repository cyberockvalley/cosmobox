
const ContactListItem = () => (
  <div className="row sideBar-body">
    <div className="col-sm-3 col-xs-3 sideBar-avatar">
      <div className="avatar-icon">
        <img src="https://bootdey.com/img/Content/avatar/avatar1.png" />
      </div>
    </div>
    <div className="col-sm-9 col-xs-9 sideBar-main">
      <div className="d-flex flex-column">
        <div className="row">
          <div className="col-sm-8 col-xs-8 sideBar-name">
            <span className="name-meta">John Doe</span>
          </div>
          <div className="col-sm-4 col-xs-4 pull-right sideBar-time">
            <span className="time-meta pull-right">18:18</span>
          </div>
        </div>
        <div>
          
        </div>
      </div>
    </div>
  </div>
);

export default ContactListItem;
