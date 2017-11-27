/**
*
* Header
*
*/

import React from 'react';
import { Link } from 'react-router-dom';

import RecentIcon from 'react-icons/lib/md/question-answer';
import NewIcon from 'react-icons/lib/md/clear-all';
import CategoryIcon from 'react-icons/lib/md/now-widgets';
import SearchIcon from 'react-icons/lib/md/search';
import UserIcon from 'react-icons/lib/fa/user';
import SignIcon from 'react-icons/lib/fa/user-plus';
import OutIcon from 'react-icons/lib/fa/sign-out';
import CreateIcon from 'react-icons/lib/md/create';

import FlatButton from 'material-ui/Button';
import Snackbar from 'material-ui/Snackbar';
import Drawer from 'material-ui/Drawer';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import Avatar from 'material-ui/Avatar';

import {EditorState, ContentState, convertFromHTML, convertToRaw} from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

import './style.css';
import './styleM.css';

export default class Header extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      snack: false,
      msg: "",
      openBottomDrawer:false,
      categories:[],
      threadTitle:"",
      threadContent:EditorState.createEmpty(),
      threadCategories:[],
      app:this.props.app,
      userDrawer:false,
    }
  }

  handleRequestClose = () => { this.setState({ snack: false, msg: "" }); };
  showSnack = (msg) => { this.setState({ snack: true, msg: msg }); };

  handleBottomDrawer = () => {
    this.setState({
      openBottomDrawer:!this.state.openBottomDrawer
    })
  }

  handleUserDrawer = () => {
    this.setState({
      userDrawer:!this.state.userDrawer
    })
  }

  handleThreadTitle = (event) => {this.setState({threadTitle: event.target.value})}
  handleThreadContent = (editorState) => {this.setState({threadContent: editorState, editorState: editorState})};
  handleCategory = (i) => {
    let categories = this.state.categories;
    let threadCategories = this.state.threadCategories;


    categories[i].isSelect = !categories[i].isSelect;

    if(threadCategories.indexOf(categories[i]) === -1) {
      threadCategories.push(categories[i].id);
    }
    else {
      threadCategories.splice(threadCategories.indexOf(categories[i].id), 1);
    }

    this.setState({
      categories:categories,
      threadCategories:threadCategories
    }, function() {
      this.forceUpdate();
    })
  }

  componentWillMount() {
    this.getCategories();
  }

  componentWillReceiveProps(app) {
    this.setState({
      app:app.app
    }, function() {
      this.forceUpdate();
    })
  }

  getCategories = () => {
    fetch("http://127.0.0.1:8000/category/", {
      method:'GET'
    })
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {

      let categories = json.categories;
      for (let i = 0; i < categories.length; i++) {
        categories[i].isSelect = false;
      }

      this.setState({
        categories:categories
      })
    }.bind(this))
  }

  storeThread = () => {
    let _this = this;

    let data = new FormData();
    data.append('threadTitle', this.state.threadTitle);
    data.append('threadContent', draftToHtml(convertToRaw(this.state.threadContent.getCurrentContent())));
    data.append('threadCategories', this.state.threadCategories);

    fetch("http://127.0.0.1:8000/storeTopic/", {
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
      else if(json.topic) {
        _this.showSnack('Thread Posted!');
        _this.handleBottomDrawer();
        _this.props.updateTopics(json.topic);
      }
    }.bind(this))
  }

  renderCategorySelect = (category, i) => {
    if(category.isSelect === true) {
      return(
        <div key={i} className="categorySelectBlock" style={{background:category.categoryColor, color:category.categoryTextColor, border:'1px solid #0098ff', boxShadow:'0px 0px 10px 0px rgba(76,182,255, 0.6)'}} onClick={() => this.handleCategory(i)}>{category.categoryName}</div>
      )
    }
    else {
      return(
        <div key={i} className="categorySelectBlock" style={{background:category.categoryColor, color:category.categoryTextColor}} onClick={() => this.handleCategory(i)}>{category.categoryName}</div>
      )
    }
  }

  renderUser = () => {
    let avatar = "";
    if(this.state.app.state.user) {
      avatar = this.state.app.state.user.avatar;
    }

    if(this.state.app.state.token && this.state.app.state.user) {
      return(
        <div className="navButton" onClick={this.handleUserDrawer}><img src={'http://127.0.0.1:8000/media/' + avatar} className="userAvatarNavbar"/> {this.state.app.state.user.name}</div>
      )
    }
    else {
      return(
        <div className="userContainer">
          <FlatButton style={{backgroundColor:"#0098ff", color:"#FFFFFF"}} onClick={this.props.app.handleAuth}>Sign In / Sign Up</FlatButton>
        </div>
      )
    }
  }

  renderNewThread = () => {
    if(this.props.app.state.token) {
      return(
        <div className="navButton" onClick={this.handleBottomDrawer}><CreateIcon className="headerIcon"/>New Thread</div>
      )
    }
  }

  renderMobileUser = () => {
    if(this.state.app.state.token) {
      return(
        <div className="mobileMenuButton" onClick={this.handleUserDrawer}><UserIcon/></div>
      )
    } else {
      return(
        <div className="mobileMenuButton" onClick={this.props.app.handleAuth}><SignIcon/></div>
      )
    }
  }

  renderMobileMenu = () => {
    let homeButton = "mobileMenuButton";
    let newButton = "mobileMenuButton";
    let categoriesButton = "mobileMenuButton";
    let searchButton = "mobileMenuButton";

    if(this.props.activeLink === "Home") {
      homeButton = "mobileMenuActive";
    }
    else if(this.props.activeLink === "New") {
      newButton = "mobileMenuActive";
    }
    else if(this.props.activeLink === "Categories") {
      categoriesButton = "mobileMenuActive";
    }
    else if(this.props.activeLink === "Search") {
      searchButton = "mobileMenuActive";
    }

    return(
      <div className="mobileMenu">
        <Link to={'/'} className={homeButton}><RecentIcon/></Link>
        <Link to={'/new'} className={newButton}><NewIcon/></Link>
        <Link to={'/categories'} className={categoriesButton}><CategoryIcon/></Link>
        <Link to={'/search'} className={searchButton}><SearchIcon/></Link>
        {this.renderMobileUser()}
      </div>
    )
  }

  render() {
    let homeButton = "navButton";
    let newButton = "navButton";
    let categoriesButton = "navButton";
    let searchButton = "navButton";

    if(this.props.activeLink === "Home") {
      homeButton = "navButtonActive";
    }
    else if(this.props.activeLink === "New") {
      newButton = "navButtonActive";
    }
    else if(this.props.activeLink === "Categories") {
      categoriesButton = "navButtonActive";
    }
    else if(this.props.activeLink === "Search") {
      searchButton = "navButtonActive";
    }

    let avatar = "";
    if(this.state.app.state.user) {
      avatar = this.state.app.state.user.avatar;
    }

    return (
      <div>
        <div className="headerComponent">
          <div className="siteName">Site Name</div>
          <div className="navbar">
            <Link to={'/'} className={homeButton}><RecentIcon className="headerIcon"/>Recent</Link>
            <Link to={'/new'} className={newButton}><NewIcon className="headerIcon"/>New</Link>
            <Link to={'/categories'} className={categoriesButton}><CategoryIcon className="headerIcon"/>Categories</Link>
            <Link to={'/search'} className={searchButton}><SearchIcon className="headerIcon"/>Search</Link>
            {this.renderNewThread()}
          </div>
          {this.renderMobileMenu()}
          {this.renderUser()}
          <Drawer anchor="bottom" open={this.state.openBottomDrawer} onRequestClose={this.handleBottomDrawer}>
            <div className="drawerContainer">
              <div className="replyEditor">
                <input className="threadTitleInput" value={this.state.threadTitle} placeholder="Thread Title" onChange={this.handleThreadTitle}/>
                <Editor
                  editorState={this.state.threadContent}
                  toolbarClassName="home-toolbar"
                  wrapperClassName="home-wrapper"
                  editorClassName="rdw-editor-main"
                  onEditorStateChange={this.handleThreadContent}
                  placeholder="Type your Thread Here..."
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
                <div className="categoryList">
                  {this.state.categories.map((category, i) => (
                    this.renderCategorySelect(category, i)
                  ))}
                </div>
                <FlatButton style={{width:"100%", maxWidth:'75%', backgroundColor:"#0098ff", color:"#FFFFFF"}} onClick={this.storeThread}>Submit New Thread</FlatButton>
                <FlatButton style={{width:"100%", maxWidth:'50%', marginTop:'20px', color:"#FFFFFF", backgroundColor:"#CCCCCC"}} onClick={this.handleBottomDrawer}>Close</FlatButton>
              </div>
            </div>
          </Drawer>
          <Drawer anchor="bottom" open={this.state.userDrawer} onRequestClose={this.handleUserDrawer}>
            <List>
              <ListItem button onClick={this.handleBottomDrawer}>
                <ListItemIcon>
                  <CreateIcon />
                </ListItemIcon>
                <ListItemText primary="New Thread" />
              </ListItem>
              <label htmlFor="avatar-file">
                <ListItem button>
                  <ListItemIcon>
                    <Avatar src={'http://127.0.0.1:8000/media/'+ avatar} />
                  </ListItemIcon>
                    <ListItemText primary="Change Avatar" />
                </ListItem>
              </label>
              <ListItem button onClick={this.props.app.signOut}>
                <ListItemIcon>
                  <OutIcon />
                </ListItemIcon>
                <ListItemText primary="Sign Out" />
              </ListItem>
            </List>
            <input type="file" onChange={this.props.app.handleAvatar} id="avatar-file" style={{display:'none'}}/>
          </Drawer>
          <Snackbar
            open={this.state.snack}
            message={this.state.msg}
            autoHideDuration={3000}
            onRequestClose={this.handleRequestClose}
          />
        </div>
      </div>
    );
  }
}

Header.contextTypes = {
  router: React.PropTypes.object
};
