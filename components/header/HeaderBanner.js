import React from "react";
import SearchBox from "../../widgets/search-box";

class HeaderBanner extends React.Component {
  constructor(props) {
    super(props)
  }
  
  render() {
    return (
      <div style={{display: "none"}} className="banner d-md-block">
        <div className="container">
          <div className="banner-text">
            {
              !this.props.primaryText? null :
              <div className="banner-heading">{this.props.primaryText}</div>
            }
            {
              !this.props.secondaryText? null :
              <div className="banner-sub-heading">{this.props.secondaryText}</div>
            }
            {
              !this.props.search? null :
              <SearchBox {...this.props.search} />
            }
            {
              !this.props.buttonText? null :
              <button
                type="button"
                className="btn btn-warning text-dark btn-banner  text-upper"
                onClick={this.props.buttonAction}
              >
                {this.props.buttonText}
              </button>
            }
          </div>
        </div>
      </div>
    );
  }
}

export default HeaderBanner;
