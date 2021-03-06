
const NewChatContactSearchBox = () => (
  <div className="row composeBox">
    <div className="col-sm-12 composeBox-inner">
      <div className="form-group has-feedback">
        <input
          id="composeText"
          type="text"
          className="form-control"
          name="searchText"
          placeholder="Search People"
        />
        <span className="glyphicon glyphicon-search form-control-feedback" />
      </div>
    </div>
  </div>
);

export default NewChatContactSearchBox;
