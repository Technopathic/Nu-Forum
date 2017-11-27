/*
 *
 * Search
 *
 */

import React from 'react';
import Helmet from 'react-helmet';
import { Link } from 'react-router-dom';

import EyeIcon from 'react-icons/lib/md/visibility';
import ReplyIcon from 'react-icons/lib/md/chat-bubble-outline';
import TimeIcon from 'react-icons/lib/md/access-time';


import Header from 'components/Header';

import Waypoint from 'react-waypoint';

import './style.css';
import './styleM.css';

export default class Search extends React.PureComponent {
  constructor() {
    super();
    this.state = {
      searchContent:"",
      topics:[],
      nextPage:1,
      lastPage:0
    }
  }

  handleSearch = (event) => {this.setState({searchContent:event.target.value})}

  getSearch = () => {
    if(this.state.searchContent) {
      let nextPage = this.state.nextPage;
      let topics = this.state.topics;
      if(this.state.lastPage === 0) {
        let data = new FormData();
        data.append("searchContent", this.state.searchContent);

        fetch("http://127.0.0.1:8000/search/15/"+nextPage+"/", {
          method:'POST',
          body:data
        })
        .then(function(response) {
          return response.json();
        })
        .then(function(json) {
          let nextPageNum = json.nextPageNum;
          let lastPage = 0;
          if(json.nextPageNum <= 0) {
            nextPageNum = this.state.nextPage;
            lastPage = this.state.nextPage;
          }
          for(let i = 0; i < json.topics.length; i++)
          {
            topics.push(json.topics[i]);
          }
          this.setState({
            nextPage:nextPageNum,
            lastPage:lastPage,
            topics:topics
          }, function() {
            this.forceUpdate();
          })
        }.bind(this))
      }
    }
  }

  keySearch = (event) => {
    if (event.keyCode === 13) {
      this.setState({
        nextPage:1,
        lastPage:0,
        topics:[]
      }, function() {
        this.getSearch();
      });
    }
  }

  render() {
    return (
      <div className="container">
        <Helmet title="Search" meta={[ { name: 'description', content: 'Description of Search' }]}/>

        <header>
          <Header activeLink="Search" app={this.props.app}/>
        </header>

        <main className="searchContainer">
          <div className="searchInputContainer">
            <input className="searchInput" type="text" placeholder="Search" value={this.state.searchContent} onChange={this.handleSearch}  onKeyDown={this.keySearch}/>
          </div>


          <div className="topicsContainer">
            {this.state.topics.map((topic, i) => (
              <Link to={'/' + topic.topicSlug} className="topicBlock" key={i}>
                <div className="topicAvatar">
                  <img className="topicAvatarImg" src={'http://127.0.0.1:8000/media/' + topic.profileID__avatar}/>
                </div>
                <div className="topicInfo">
                  <div className="topicTop">
                    <div className="topicTitle">{topic.topicTitle}</div>
                    <div className="topicCategories">
                      {topic.categories.map((category, j) => (
                        <Link key={j} to={'/category/' + category.categoryID__categorySlug} className="topicCategoryBlock" style={{background:category.categoryID__categoryColor, color:category.categoryID__categoryTextColor}}>{category.categoryID__categoryName}</Link>
                      ))}
                    </div>
                  </div>
                  <div className="topicBottom">
                    <span className="topicBottomBlock"><ReplyIcon style={{marginRight:'5px', fontSize:'1.1em'}}/> {topic.topicReplies}</span>
                    <span className="topicBottomBlock"><EyeIcon style={{marginRight:'5px', fontSize:'1.1em'}}/> {topic.topicViews}</span>
                    <span className="topicBottomBlock"><TimeIcon style={{marginRight:'5px', fontSize:'1.1em'}}/> {topic.topicDate}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Waypoint onEnter={this.getSearch} />



        </main>
      </div>
    );
  }
}

Search.contextTypes = {
  router: React.PropTypes.object
};
