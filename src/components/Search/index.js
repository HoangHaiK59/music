import React from "react";
import "./search.css";
import { axiosInstance } from "../../helper/axios";
import hash from '../../helper/hash';
import { request } from "request";

class Search extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      query: "",
      token: '',
      data: null
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleChange = event => {
    this.setState({ query: event.target.value });
  };

  handleClick = event => {
    // this.setState(state => this.setState({toggle: !state.toggle}))
  };

  search(event) {

  }

  componentDidMount() {
    let token = hash.access_token;
    localStorage.setItem('token', token);
    if (token) {
      this.setState({ token: token })
    }

  }

  componentWillUnmount() {
    // document.removeEventListener('click', this.handleClick);
    // document
    // .getElementById("query")
    // .removeEventListener("click", this.handleClick);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.query !== this.state.query) {
      let url = `https://api.spotify.com/v1/search?q=${this.state.query}&market=VN&type=album,artist,playlist,track`
      fetch(url,
        {
          headers: {
            Authorization: 'Bearer ' + this.state.token
          }
        },

      )
        .then(res => {
          res.json().then(data => this.setState({ data: data }))
        })
    }
  }

  render() {
    return (
      <div className="container-fluid" style={{ position: 'absolute', top: '10%', width: '100%', height: '100%' }}>
        <div className="container-wrapper">
          {/* {this.state.toggle && <input onClick={this.handleClick} style={{width: '90%'}}
            id="query"
            type="text"
            onChange={this.handleChange}
            value={this.state.query}/>} */}
          <div id="bloodhound">
            <input
              className="typeahead"
              onClick={this.handleClick}
              id="query"
              type="text"
              onChange={this.handleChange}
              value={this.state.query}
              placeholder="Search Track, Artist..."
            />
          </div>
        </div>
        {
          this.state.data && <div className="container-fluid">
            <div className="row">
              <div className="col-md-12">
                <div className="d-flex flex-row flex-wrap justify-content-between">
                  {
                    this.state.data.albums ? this.state.data.albums.items.map((item, id) => <div key={id} style={{ width: 400, height: 400 }}>
                      <div className="d-flex flex-column">
                        <img src={item.images['1'].url} style={{ width: item.images['1'].width, height: item.images['1'].heigth }} alt="" />
                      </div>
                    </div>): null
                  }
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    );
  }
}

export default Search;
