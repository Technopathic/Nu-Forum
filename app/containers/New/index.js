/*
 *
 * New
 *
 */

import React from 'react';
import Helmet from 'react-helmet';
import { Link } from 'react-router-dom';

import EyeIcon from 'react-icons/lib/md/visibility';
import ReplyIcon from 'react-icons/lib/md/chat-bubble-outline';
import TimeIcon from 'react-icons/lib/md/access-time';

import Waypoint from 'react-waypoint';

import Header from 'components/Header';

import './style.css';
import './styleM.css';

export default class New extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      topics:[],
      nextPage:1,
      lastPage:0,
      app:this.props.app
    }
  }

  componentWillMount() {
    //this.getNew();
  }

  componentWillReceiveProps(app) {
    this.setState({
      app:app.app
    }, function() {
      this.forceUpdate();
    })
  }

  getNew = () => {
    let nextPage = this.state.nextPage;
    let topics = this.state.topics;
    if(this.state.lastPage === 0) {
      fetch("http://127.0.0.1:8000/topic/15/"+nextPage+"/0/0/", {
        method:'GET'
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

  updateTopics = (topic) => {
    let topics = this.state.topics;
    topics.push(topic);

    this.setState({
      topics:topics
    }, function() {
      this.forceUpdate();
    })
  }

  render() {
    return (
      <div className="container">
        <Helmet title="New" meta={[ { name: 'description', content: 'Description of New' }]}/>

        <header>
          <Header activeLink="New" updateTopics={this.updateTopics} app={this.props.app}/>
        </header>

        <main className="mainContainer">

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
          <Waypoint onEnter={this.getNew} />

        </main>
      </div>
    );
  }
}

New.contextTypes = {
  router: React.PropTypes.object
};
