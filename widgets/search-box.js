import { withRouter } from "next/router";
import React, { useState } from "react";
import { STORAGE_KEYS } from "../utils/constants";
import { getFromStorage, saveToStrorage } from "../utils/functions";
import Link from "../views/Link";

class SearchBox extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      searchHistory: [],
      trendingSearches: []
    }
  }

  getSearchHistory = () => {
    var h = getFromStorage(STORAGE_KEYS.searchHistory, [])
    if(h.length == 0) return [];
    return JSON.parse(h)
  }

  clearSearch = () => {
    saveToStrorage(STORAGE_KEYS.searchHistory, "")
    this.setState({searchHistory: []})
  }

  componentDidMount() {
    console.log("Tran", this.props.t)
    this.setState({searchHistory: this.getSearchHistory()})
    window.addEventListener('click', e => {
      if(e.target.id != "search") {
        this.setState({showDropdown: false})
      }
    })
  }

  handleChange = e => {
    this.state[e.target.name] = e.target.value
    this.setState({[e.target.name]: e.target.value})
  }

  submitForm = e => {
    e.preventDefault()
    if(this.state.s && this.state.s.length > 0) {
      saveToStrorage(STORAGE_KEYS.searchHistory, JSON.stringify([this.state.s.trim(), ...this.state.searchHistory]))
      this.props.router.push(`/search/${this.state.s.trim()}`)

    }
  }

  render() {
    return (
      <div className="btn-group search-box">
        <form
          onSubmit={this.submitForm}
          action="/search/"
          autoComplete="off"
          className="js-search-bar search-bar search-bar--jumbo search-bar--open"
          method="get"
          role="search"
        >
          <div className="input-group input-group-lg bar">
            <input
              onClick={() => this.setState({showDropdown: true})}
              autoCapitalize="none"
              autoComplete="off"
              autoFocus
              id="search"
              name="s"
              type="search" 
              className={`form-control ${this.state.showDropdown? "show-dropdown" :""}`}
              required="required"
              placeholder={this.props.placeholder}
              onChange={this.handleChange} />
            <div className="input-group-append">
              <span className={`input-group-text ${this.state.showDropdown? "show-dropdown" :""}`}><i className="fa fa-search"></i></span>
            </div>
          </div>

          <div className={`dropdown-menu ${this.state.showDropdown? "show" :""}`}
              onClick={() => this.setState({showDropdown: true})}>
            {
              this.state.searchHistory.length > 0?
              <>
                <div className="dropdown-item">
                  <div className="title">
                    <span>{this.props.recentSearchesText}</span>
                    <div onClick={this.clearSearch} className="fa fa-times-circle action"></div>
                  </div>
                  <div className="recent-searches">
                    {
                      this.state.searchHistory.map(search => (
                        <Link href={`/search/${search}`}>
                          <div className="text text-cap">{search}</div>
                          <span className="fa fa-search icon"></span>
                        </Link>
                      ))
                    }
                  </div>
                </div>
                <div className="dropdown-divider"></div>
              </> : null
            }
            {
              this.state.trendingSearches.length > 0?
              <>
                <div className="dropdown-item">
                  FFFF
                </div>
                <div className="dropdown-divider"></div>
              </> : null
            }
          </div>
        </form>
      </div>
    );
  }
}

export default withRouter(SearchBox);