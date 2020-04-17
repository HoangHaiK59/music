import React from "react";
import "./search.css";
import { axiosInstance } from "../../helper/axios";
import hash from '../../helper/hash';
import { request } from "request";
import { refreshAccessToken } from "../../helper/token";
import { SpotifyConstants } from "../../store/constants";
import { connect } from "react-redux";
import { Link } from "react-router-dom";


class Search extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      query: "",
      token: '',
      data: null,
      isRefresh: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleChange = event => {
    this.setState(event.target.value.length> 0 ? { query: event.target.value }: {query: event.target.value, data: null});
  };

  handleClick = event => {
    // this.setState(state => this.setState({toggle: !state.toggle}))
  };

  search() {
    let token = localStorage.getItem('token');
    let url = `https://api.spotify.com/v1/search?q=${this.state.query}&market=VN&type=album,artist,playlist,track`
    return fetch(url,
      {
        headers: {
          Authorization: 'Bearer ' + token
        }
      },
    )
  }

  componentDidMount() {
    let token = hash.access_token;
    let refresh_token = hash.refresh_token;
    if (token && refresh_token) {
      localStorage.setItem('token', token);
      localStorage.setItem('refresh_token', refresh_token);
      window.location.hash="";
      this.setState({ token: token })
    }

  }

  componentWillUnmount() {
    // document.removeEventListener('click', this.handleClick);
    // document
    // .getElementById("query")
    // .removeEventListener("click", this.handleClick);
  }

  componentWillUpdate() {

  }

  componentDidUpdate(prevProps, prevState) {

    if ((prevState.query !== this.state.query && this.state.query !== '') || this.state.isRefresh) {
      this.search()
      .then(res => {
        if(res.json().then(data => {
          if(data.error ) {
            refreshAccessToken()
            .then(res => res.json().then(resJson => {
              localStorage.setItem('token', resJson.access_token);
              this.props.setRefreshAction();
              this.setState({token: resJson.access_token, isRefresh: true});
             
            }))
          }else {
            this.setState({data: data, isRefresh: false})
          }
        }));
      })
    }

  }

  render() {
    return (
      <div className="container-fluid" style={{minHeight: '100%', backgroundColor: '#0f1424'}} >
        <div className="container-wrapper" >
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
                {
                  this.state.data.albums && <h4>Albums</h4>
                }
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="d-flex flex-row flex-wrap justify-content-start">
                  {
                    this.state.data.albums ? this.state.data.albums.items.map((item, id) => <div key={id} style={{ width: 250, height: '20rem' }}>
                      <div className="card" style={{width: '13rem', height: '18rem', background: '#383a3d'}}>
                      <img src={item.images['1'] ? item.images['1'].url : '/dvd.png'} className="card-img-top" alt="..." style={{}}/>
                        <div className="card-body">
                          <h5 className="card-title" style={{fontSize: '15px', color: '#fff'}}>{item.name}</h5>
                        </div>
                      </div>
                    </div>) : null
                  }
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                {
                  this.state.data.artists && <h4>Artists</h4>
                }
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="d-flex flex-row flex-wrap justify-content-start">
                  {
                    this.state.data.artists ? this.state.data.artists.items.map((item, id) => <div key={id} style={{ width: 250, height: '20rem' }}>
                      <div className="card" style={{width: '13rem', height: '18rem', background: '#383a3d'}}>
                      <img src={item.images['1'] ? item.images['1'].url : '/user.png'} className="card-img-top" alt="..." style={{}}/>
                        <div className="card-body">
                          <h5 className="card-title" style={{fontSize: '15px', color: '#fff'}}>{item.name}</h5>
                        </div>
                      </div>
                    </div>) : null
                  }
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                {
                  this.state.data.tracks && <h4>Tracks</h4>
                }
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="d-flex flex-row flex-wrap justify-content-start">
                  {
                    this.state.data.tracks ? this.state.data.tracks.items.map((item, id) => <div key={id} style={{ width: 250, height: '20rem'}}>
                      <div className="card" style={{width: '13rem', height: '18rem', background: '#383a3d'}}>
                      <img src={item.album.images['1'] ? item.album.images['1'].url : '/dvd.png'} className="card-img-top" alt="..." style={{}}/>
                        <div className="card-body">
                          <h5 className="card-title" style={{fontSize: '15px', color: '#fff'}}>{item.name}</h5>
                        </div>
                      </div>
                    </div>
                    ) : null
                  }
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                {
                  this.state.data.playlists && <h4>Playlists</h4>
                }
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="d-flex flex-row flex-wrap justify-content-start">
                  {
                    this.state.data.playlists ? this.state.data.playlists.items.map((item, id) => <div key={id} style={{width: 250, height: '20rem' }}>

                      <div className="card" style={{width: '13rem', height: '18rem', background: '#383a3d'}}>
                        <img src={item.images['0'] ? item.images['0'].url : '/dvd.png'} className="card-img-top" alt="..." style={{}}/>
                          <div className="card-body">
                            <Link to={`/playlists/${item.id}`} className="card-title" style={{fontSize: '15px', color: '#fff', textDecoration: 'none'}}>{item.name}</Link>
                          </div>
                        </div>
                      </div>) : null
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

const mapStateToProps = (state, ownProps) => {
  return {
    isRefresh: state.spotify.isRefresh
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setRefreshAction: () => {
      dispatch({type: SpotifyConstants.REFRESH_TOKEN})
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Search);
