/*
 *
 * Categories
 *
 */

import React from 'react';
import Helmet from 'react-helmet';
import { Link } from 'react-router-dom';

import Header from 'components/Header';

import './style.css';
import './styleM.css';

export default class Categories extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      categories:[],
      categoryImage:"",
      categoryName:"",
      app:this.props.app
    }
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
      this.setState({
        categories:json.categories
      })
    }.bind(this))
  }

  storeCategory = () => {
    let _this = this;
    let data = new FormData();

    data.append('categoryName', this.state.categoryName);
    data.append('categoryImage', this.state.categoryImage);

    fetch("", {
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
        _this.showSnack('Category Added.');
      }
    })
  }

  render() {
    return (
      <div className="container">
        <Helmet title="Categories" meta={[ { name: 'description', content: 'Description of Categories' }]}/>

        <header>
          <Header activeLink="Categories" app={this.props.app}/>
        </header>

        <main className="categoriesMain">
          {this.state.categories.map((category, i) => (
            <Link to={'/category/'+ category.categorySlug} className="categoriesBlock" key={i}>
              <div className="categoriesImage">
                <img className="categoryImage" src={'http://127.0.0.1:8000/media/' + category.categoryImage} />
              </div>
              <div className="categoriesInfo">
                <span className="categoriesName">{category.categoryName}</span>
                <span className="categoriesCount">{category.categoryCount}</span>
              </div>
            </Link>
          ))}
        </main>

      </div>
    );
  }
}

Categories.contextTypes = {
  router: React.PropTypes.object
};
