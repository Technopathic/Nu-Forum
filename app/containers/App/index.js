/*
 *
 * App
 *
 */

import React, {Component} from 'react';
import { Switch, Route } from 'react-router-dom';

import Home from 'containers/Home';
import Categories from 'containers/Categories';
import Category from 'containers/Category';
import Detail from 'containers/Detail';
import Search from 'containers/Search';
import New from 'containers/New';
import NotFound from 'containers/NotFound';

import Snackbar from 'material-ui/Snackbar';
import Dialog, { DialogTitle } from 'material-ui/Dialog';
import Tabs, { Tab } from 'material-ui/Tabs';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/Button';

import './style.css';
import './styleM.css';

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      token:localStorage.getItem('token'),
      user:JSON.parse(localStorage.getItem('user')),
      snack: false,
      msg: "",
      email:"",
      username:"",
      password:"",
      authOpen:false,
      activeTab:0,
    }
  }

  handleRequestClose = () => { this.setState({ snack: false, msg: "" }); };
  showSnack = (msg) => { this.setState({ snack: true, msg: msg }); };

  handleUsername = (event) => {this.setState({username:event.target.value})}
  handleEmail = (event) => {this.setState({email:event.target.value})}
  handlePassword = (event) => {this.setState({password:event.target.value})}

  handleAuth = () => { this.setState({authOpen:!this.state.authOpen}) }
  handleTab = (event, value) => { this.setState({activeTab:value}) }

  signIn = () => {
    let _this = this;
    let data = new FormData();
    data.append('username', this.state.username);
    data.append('password', this.state.password);

    fetch('http://127.0.0.1:8000/signIn/', {
      method:'POST',
      body:data
    })
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
      if(json.error)
      {
        _this.showSnack(json.error);
      }
      else if(json.non_field_errors) {
        _this.showSnack("Incorrect Login Credentials.");
      }
      else if(json.token)
      {
        localStorage.setItem('token', json.token);
        this.setState({
          token:json.token
        })
        fetch('http://127.0.0.1:8000/user/', {
          method:'GET',
          headers: {'Authorization' : 'JWT ' + json.token}
        })
        .then(function(response) {
          return response.json();
        })
        .then(function(json) {
          localStorage.setItem('user', JSON.stringify(json.user));
          _this.setState({
            user:json.user,
            authOpen:false
          }, function() {
            _this.forceUpdate();
          })
          _this.showSnack("Welcome " + json.user.name);
        })
      }
    }.bind(this));
  };

  signUp = () => {
    let _this = this;
    let data = new FormData();
    data.append('email', this.state.email);
    data.append('username', this.state.username);
    data.append('password', this.state.password);

    fetch('http://127.0.0.1:8000/user/', {
      method:'POST',
      body:data
    })
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
      if(json.error)
      {
        _this.showSnack(json.error);
      }
      else if(json.success)
      {
        _this.signIn();
      }
    }.bind(this));
  };

  signOut = () => {
    let _this = this;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    this.showSnack("Good-bye!");
    this.setState({
      token:"",
      user:"",
    }, function() {
      setTimeout(function(){_this.context.router.history.push('/')}, 2000);
    })
  };

  handleAvatar = (event) => {
    let _this = this;
    let user = this.state.user;
    this.setState({
      isLoading:true
    })

    event.preventDefault();
    let reader = new FileReader();
    let file = event.target.files[0];

    reader.onloadend = () => {
      let data = new FormData();

      data.append('avatar', file);

      fetch("http://127.0.0.1:8000/user/", {
        method:'PUT',
        body:data,
        headers:{'Authorization':'JWT ' + this.state.token}
      })
      .then(function(response) {
        return response.json();
      })
      .then(function(json) {
        _this.showSnack('Avatar Uploaded!');
        user.avatar = json.avatar;

        this.setState({
          isLoading:false,
          user:user
        })
      }.bind(this))
    }

    reader.readAsDataURL(file);
  };

  render() {
    return (
      <div>

        <Switch>
          <Route exact path='/' render={ () => <Home app={this}/> }/>
          <Route path='/categories' render={() => <Categories app={this} /> }/>
          <Route path='/category/:slug' render={(props) => <Category {...props} app={this} /> }/>
          <Route path='/search' render={() => <Search app={this} /> }/>
          <Route path='/new' render={() => <New app={this} /> }/>
          <Route path='/:slug' render={(props) => <Detail {...props} app={this} /> } />
          <Route path='*' component={NotFound}/>
        </Switch>

        <Dialog onRequestClose={this.handleAuth} open={this.state.authOpen}>
          <Tabs value={this.state.activeTab} onChange={this.handleTab} fullWidth style={{background:"#0098FF", color:"#FFFFFF"}}>
            <Tab label="Sign In" />
            <Tab label="Sign Up" />
          </Tabs>
          {this.state.activeTab === 0 &&
            <div className="authBlock">
              <TextField label="Username" margin='normal'  fullWidth={true} onChange={this.handleUsername} value={this.state.username} />
              <TextField label="Password" margin='normal'  fullWidth={true} onChange={this.handlePassword} value={this.state.password} type="password"/>
              <FlatButton style={{marginTop:'15px', color:"#FFFFFF", background:"#0098FF", width:"100%"}} onClick={this.signIn}>Sign In</FlatButton>
            </div>
          }
          {this.state.activeTab === 1 &&
            <div className="authBlock">
              <TextField label="Username" margin='normal'  fullWidth={true} onChange={this.handleUsername} value={this.state.username}/>
              <TextField label="E-Mail" margin='normal' fullWidth={true} onChange={this.handleEmail} value={this.state.email}/>
              <TextField label="Password" margin='normal'  fullWidth={true} onChange={this.handlePassword} value={this.state.password} type="password"/>
              <FlatButton style={{marginTop:'15px', color:"#FFFFFF", background:"#0098FF", width:"100%"}} onClick={this.signUp}>Sign Up</FlatButton>
            </div>
          }
        </Dialog>
        <Snackbar
          open={this.state.snack}
          message={this.state.msg}
          autoHideDuration={3000}
          onRequestClose={this.handleRequestClose}
        />
      </div>
    );
  }
}

App.contextTypes = {
  router: React.PropTypes.object
};
