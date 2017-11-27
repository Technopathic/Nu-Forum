/*
 *
 * Detail
 *
 */

import React from 'react';
import Helmet from 'react-helmet';
import { Link } from 'react-router-dom';

import EyeIcon from 'react-icons/lib/md/visibility';
import ReplyIcon from 'react-icons/lib/md/chat-bubble-outline';
import CommentIcon from 'react-icons/lib/fa/mail-reply';
import FavIcon from 'react-icons/lib/fa/heart';
import ArrowIcon from 'react-icons/lib/fa/angle-double-left';
import Snackbar from 'material-ui/Snackbar';
import FlatButton from 'material-ui/Button';

import Drawer from 'material-ui/Drawer';

import {EditorState, ContentState, convertFromHTML, convertToRaw} from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

import Waypoint from 'react-waypoint';

import './style.css';
import './styleM.css';

export default class Detail extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      snack: false,
      msg: "",
      openBottomDrawer:false,
      replyContent:EditorState.createEmpty(),
      replyParent:0,
      topic:"",
      categories:[],
      replies:[],
      nextPage:1,
      lastPage:0,
      app:this.props.app
    }
  }

  handleRequestClose = () => { this.setState({ snack: false, msg: "" }); };
  showSnack = (msg) => { this.setState({ snack: true, msg: msg }); };

  componentWillMount() {
    this.getTopic();
  }

  componentWillReceiveProps(app) {
    this.setState({
      app:app.app
    }, function() {
      this.forceUpdate();
    })
  }

  handleBottomDrawer = (id = 0) => {
    this.setState({
      replyParent:id,
      openBottomDrawer:!this.state.openBottomDrawer
    })
  }

  handleReply = (editorState) => {this.setState({replyContent: editorState, editorState: editorState})};

  getTopic = () => {
    fetch("http://127.0.0.1:8000/showTopic/"+this.props.match.params.slug+"/", {
      method:'GET'
    })
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
      this.setState({
        topic:json.topic,
        categories:json.categories
      }, function() {
        //this.getReplies();
      })
    }.bind(this))
  }

  getReplies = () => {
    let nextPage = this.state.nextPage;
    let replies = this.state.replies;
    if(this.state.lastPage === 0) {
      fetch("http://127.0.0.1:8000/reply/"+this.state.topic.id+"/" + nextPage + "/", {
        method:'GET'
      })
      .then(function(response) {
        return response.json();
      })
      .then(function(json) {
        let nextPageNum = json.nextReplyNum;
        let lastPage = 0;
        if(json.nextReplyNum <= 0) {
          nextPageNum = this.state.nextPage;
          lastPage = this.state.nextPage;
        }
        for(let i = 0; i < json.replies.length; i++)
        {
          replies.push(json.replies[i]);
        }
        this.setState({
          nextPage:nextPageNum,
          lastPage:lastPage,
          replies:replies
        }, function() {
          this.forceUpdate();
        })
      }.bind(this))
    }
  }

  storeReply = () => {
    let _this = this;
    let data = new FormData();

    data.append('topicID', this.state.topic.id);
    data.append('replyContent', draftToHtml(convertToRaw(this.state.replyContent.getCurrentContent())));
    data.append('replyID', this.state.replyParent);

    fetch("http://127.0.0.1:8000/storeReply/", {
      method:'POST',
      body:data,
      headers:{'Authorization':'JWT ' + this.props.app.state.token}
    })
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
      if(json.error) {
        _this.showSnack(json.error);
      }
      else if(json.detail) {
        _this.props.app.handleAuth();
      }
      else if(json.reply) {
        _this.showSnack('Reply Posted!');
        _this.handleBottomDrawer();
        _this.getReplies();
      }
    }.bind(this))
  }

  renderMod = (reply) => {
    if(reply.profileID__roleID === 1)
    {
      return(
        <span className="replyModBlock">MOD</span>
      )
    }
  }

  renderChild = (reply, i, active) => {
    let replyStyle = { background:'#FFFFFF'};

    if(active === 0) {
      replyStyle.background = '#FFFFFF';
    } else {
      replyStyle.background = '#F4F4F4';
    }
    if(active === 0) { active = 1 } else { active = 0 }
    return(
      <div className="replyChildContainer" key={i} style={replyStyle}>
          <div className="replyBlock">
            <div className="replyAvatar">
              <img className="replyAvatarImg" src={'http://127.0.0.1:8000/media/' + reply.profileID__avatar}/>
            </div>
            <div className="replyInfo">
              <div className="replyTop">
                <div className="replyTopInfo">
                  <span className="replyName">{reply.profileID__name}</span>
                  {this.renderMod(reply)}
                  <span className="replyDate">{reply.replyDate}</span>
                </div>
                <div className="replyOptions">
                  {this.renderReplyButton(reply.id)}
                </div>
              </div>
              <div className="replyContent" dangerouslySetInnerHTML={{ __html: reply.replyContent }}/>
            </div>
          </div>
        {reply.childReplies.map((child, j) => (
          this.renderChild(child, j, active)
        ))}
      </div>
    )
  }

  renderTopicReply = () => {
    if(this.state.app.state.token) {
      return(
        <div className="detailTopicButton" onClick={() => this.handleBottomDrawer(0)}>Reply <CommentIcon style={{marginLeft:'5px'}}/></div>
      )
    } else {
      <div className="detailTopicButton" onClick={() => this.props.app.handleAuth()}>Reply <CommentIcon style={{marginLeft:'5px'}}/></div>
    }
  }

  renderReplyButton = (reply) => {
    if(this.state.app.state.token) {
      return(
        <div className="replyButton" onClick={() => this.handleBottomDrawer(reply)}>Reply</div>
      )
    } else {
      return(
        <div className="replyButton" onClick={() => this.props.app.handleAuth()}>Reply</div>
      )
    }
  }

  renderWaypoint = () => {
    if(this.state.topic) {
      return(
        <Waypoint onEnter={this.getReplies} />
      )
    } else {
      return(
        <div></div>
      )
    }
  }

  render() {
    return (
      <div className="container">
        <Helmet title="Detail" meta={[ { name: 'description', content: 'Description of Detail' }]}/>

        <header className="detailHeader">
          <div><ArrowIcon color="#0098ff" size={25} onClick={this.context.router.history.goBack}/></div>
          <div className="detailTitle">{this.state.topic.topicTitle}</div>
          <div className="detailDate">{this.state.topic.topicDate}</div>
        </header>

        <main>
          <div className="detailTopicContainer">
            <div className="detailTopic">
              <div className="detailTopicAvatar">
                <div style={{maxHeight:'120px', overflow:'hidden', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
                  <img className="detailAvatarImg" src={'http://127.0.0.1:8000/media/' + this.state.topic.profileID__avatar}/>
                </div>
                <div className="detailAvatarName">{this.state.topic.profileID__name}</div>
              </div>
              <div className="detailTopicInfo">
                <div className="detailTopicContent" dangerouslySetInnerHTML={{ __html: this.state.topic.topicContent }}/>
                <div className="detailTopicStats">
                  <div className="detailTopicViews">
                    <div className="topicBottom">
                      <span className="topicBottomBlock"><ReplyIcon style={{marginRight:'5px', fontSize:'1.2em'}}/> {this.state.topic.topicReplies}</span>
                      <span className="topicBottomBlock"><EyeIcon style={{marginRight:'5px', fontSize:'1.2em'}}/> {this.state.topic.topicViews}</span>
                    </div>
                    <div className="topicCategories">
                      {this.state.categories.map((category, i) => (
                        <Link key={i} to={'/category/' + category.categoryID__categorySlug} className="topicCategoryBlock" style={{background:category.categoryID__categoryColor, color:category.categoryID__categoryTextColor}}>{category.categoryID__categoryName}</Link>
                      ))}
                    </div>
                  </div>
                  <div className="detailTopicButtons">
                    {this.renderTopicReply()}
                    {/*<div className="detailTopicButton">0 <FavIcon style={{marginLeft:'5px'}}/></div>*/}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="detailReplyContainer">
            {this.state.replies.map((reply, i) => (
              <div className="replyBlockContainer" key={i}>
                  <div className="replyBlock">
                    <div className="replyAvatar">
                      <img className="replyAvatarImg" src={'http://127.0.0.1:8000/media/' + reply.profileID__avatar}/>
                    </div>
                    <div className="replyInfo">
                      <div className="replyTop">
                        <div className="replyTopInfo">
                          <span className="replyName">{reply.profileID__name}</span>
                          {this.renderMod(reply)}
                          <span className="replyDate">{reply.replyDate}</span>
                        </div>
                        <div className="replyOptions">
                          {this.renderReplyButton(reply.id)}
                        </div>
                      </div>
                      <div className="replyContent" dangerouslySetInnerHTML={{ __html: reply.replyContent }} />
                    </div>
                  </div>
                {reply.childReplies.map((child, j) => (
                  this.renderChild(child, j, 1)
                ))}
              </div>
            ))}
          </div>
          {this.renderWaypoint()}
        </main>

        <footer>
          <Drawer anchor="bottom" open={this.state.openBottomDrawer} onRequestClose={this.handleBottomDrawer}>
            <div className="drawerContainer">
              <div className="replyEditor">
                <Editor
                  editorState={this.state.replyContent}
                  toolbarClassName="home-toolbar"
                  wrapperClassName="home-wrapper"
                  editorClassName="rdw-editor-main"
                  onEditorStateChange={this.handleReply}
                  placeholder="Type your Reply Here..."
                  toolbar={{
                    inline: { inDropdown: true },
                    fontSize:{ className: "toolbarHidden",},
                    fontFamily:{className: "toolbarHidden",},
                    list: { inDropdown: true, options: ['unordered', 'ordered'] },
                    textAlign: { inDropdown: true,  options: ['left', 'center', 'right'] },
                    link: { inDropdown: true },
                    remove:{className: "toolbarHidden",},
                    emoji: {className: "toolbarHidden",},
                    history: {className: "toolbarHidden",},
                  }}
                />
                </div>
                <div className="replyDrawerOptions">
                  <FlatButton style={{width:"100%", maxWidth:'75%', color:"#FFFFFF", backgroundColor:"#0098ff"}} onClick={this.storeReply}>Submit Reply</FlatButton>
                  <FlatButton style={{width:"100%", maxWidth:'50%', marginTop:'20px', color:"#FFFFFF", backgroundColor:"#CCCCCC"}} onClick={this.handleBottomDrawer}>Close</FlatButton>
                </div>
              </div>
          </Drawer>
          <Snackbar
            open={this.state.snack}
            message={this.state.msg}
            autoHideDuration={3000}
            onRequestClose={this.handleRequestClose}
          />
        </footer>
      </div>
    );
  }
}

Detail.contextTypes = {
  router: React.PropTypes.object
};
