import React from "react";
import "./search.css";
import { refreshAccessToken } from "../../helper/token";
import { SpotifyConstants } from "../../store/constants";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlayCircle, faPauseCircle, faVolumeUp } from '@fortawesome/free-solid-svg-icons';


class Search extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      query: "",
      data: null,
      albums: null,
      artists: null,
      tracks: null,
      playlists: null
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleChange = event => {
    this.setState(event.target.value.length > 0 ? { query: event.target.value } : { query: event.target.value, data: null });
  };

  handleClick = event => {
    // this.setState(state => this.setState({toggle: !state.toggle}))
  };

  search() {
    let url = `https://api.spotify.com/v1/search?q=${this.state.query}&market=VN&type=album,artist,playlist,track`
    return fetch(url,
      {
        headers: {
          Authorization: 'Bearer ' + this.props.access_token
        }
      },
    ).then(res => res.status === 200 ? res.json() : null)
  }

  mouseMove(id, type) {
    if (type === 1) {
      const items = this.state.albums.items.map((item, index) => {
        if (id === index) {
          return { ...item, active: true }
        }
        return item;
      });


      this.setState({ albums: { ...this.state.albums, items: items } })
    } else if (type === 2) {
      const items = this.state.artists.items.map((item, index) => {
        if (id === index) {
          return { ...item, active: true }
        }
        return item;
      });


      this.setState({ artists: { ...this.state.artists, items: items } })
    } else if (type === 3) {
      const items = this.state.tracks.items.map((item, index) => {
        if (id === index) {
          return { ...item, active: true }
        }
        return item;
      });


      this.setState({ tracks: { ...this.state.tracks, items: items } })
    } else {
      const items = this.state.playlists.items.map((item, index) => {
        if (id === index) {
          return { ...item, active: true }
        }
        return item;
      });


      this.setState({ playlists: { ...this.state.playlists, items: items } })
    }

  }

  mouseLeave(id, type) {
    if (type === 1) {
      const items = this.state.albums.items.map((item, index) => {
        if (id === index) {
          return { ...item, active: false }
        }
        return item;
      });


      this.setState({ albums: { ...this.state.albums, items: items } })
    } else if (type === 2) {
      const items = this.state.artists.items.map((item, index) => {
        if (id === index) {
          return { ...item, active: false }
        }
        return item;
      });


      this.setState({ artists: { ...this.state.artists, items: items } })
    } else if (type === 3) {
      const items = this.state.tracks.items.map((item, index) => {
        if (id === index) {
          return { ...item, active: false }
        }
        return item;
      });


      this.setState({ tracks: { ...this.state.tracks, items: items } })
    } else {
      const items = this.state.playlists.items.map((item, index) => {
        if (id === index) {
          return { ...item, active: false }
        }
        return item;
      });


      this.setState({ playlists: { ...this.state.playlists, items: items } })
    }
  }

  componentDidMount() {

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

    if ((prevState.query !== this.state.query && this.state.query !== '')) {
      this.search()
        .then(data => {
          if (data === null) {
            refreshAccessToken()
              .then(res => res.json().then(resJson => {
                this.props.setAccessToken(resJson.access_token)
              }))
          } else {
            this.setState({
              albums: { ...data.albums, items: data.albums.items.map(item => ({ ...item, active: false, playing: false })) },
              artists: { ...data.artists, items: data.artists.items.map(item => ({ ...item, active: false, playing: false })) },
              tracks: { ...data.tracks, items: data.tracks.items.map(item => ({ ...item, active: false, playing: false })) },
              playlists: { ...data.playlists, items: data.playlists.items.map(item => ({ ...item, active: false, playing: false })) }
            })
          }
        }
        )
    }

  }

  render() {
    return (
      <div className="container-fluid" style={{ minHeight: '100%', backgroundColor: '#0f1424' }} >
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
          (this.state.albums && this.state.playlists) && <div className="container-fluid">
            <div className="row">
              <div className="col-md-12">
                {
                  this.state.albums && <h4>Albums</h4>
                }
                <div className="dropdown-divider" style={{ borderColor: '#272729' }}></div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="d-flex flex-row flex-wrap justify-content-start">
                  {
                    this.state.albums ? this.state.albums.items.map((item, id) => <div key={id} className="item">

                      <div className="row" style={{ width: '18rem', height: '5rem', background: '#0f1424' }}>
                        {item.active ? <div className="col-md-4 position-relative" onMouseMove={() => this.mouseMove(id, 1)} onMouseLeave={() => this.mouseLeave(id, 1)}>
                          <img className="position-absolute" src={item.images['1'] ? item.images['1'].url : '/dvd.png'} alt="..." style={{ width: 64, height: 64, zIndex: 1 }} />
                          <div className="position-absolute" style={{top:'25%',left: '30%',zIndex: 2}}><FontAwesomeIcon icon={faPlayCircle} size="2x" color="white"/></div>
                        </div> : <div className="col-md-4" onMouseMove={() => this.mouseMove(id, 1)} onMouseLeave={() => this.mouseLeave(id, 1)}>
                            <img src={item.images['1'] ? item.images['1'].url : '/dvd.png'} alt="..." style={{ width: 64, height: 64 }} />
                          </div>}
                        <div className="col-md-8">
                          <div className="row">
                            <div className="col-md-12" style={{ height: '2rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              <Link to={`/album/${item.id}`} style={{ fontSize: '13px', color: '#fff', textDecoration: 'none' }}>{item.name}</Link>
                            </div>
                            <div className="col-md-12" style={{ height: '2rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              <p style={{ color: '#57575c' }}>{item.artists.map(artist => artist.name).join(',')}</p>
                            </div>
                          </div>
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
                  this.state.artists && <h4>Artists</h4>
                }
                <div className="dropdown-divider" style={{ borderColor: '#272729' }}></div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="d-flex flex-row flex-wrap justify-content-start">
                  {
                    this.state.artists ? this.state.artists.items.map((item, id) => <div key={id} className="item">
                      <div className="row" style={{ width: '18rem', height: '5rem', background: '#0f1424' }}>
                        <div className="col-md-4">
                          <img className="rounded-circle" src={item.images['1'] ? item.images['1'].url : '/user.png'} alt="..." style={{ width: 64, height: 64 }} />
                        </div>
                        <div className="col-md-8">
                          <h5 style={{ fontSize: '13px', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h5>
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
                  this.state.tracks && <h4>Tracks</h4>
                }
                <div className="dropdown-divider" style={{ borderColor: '#272729' }}></div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="d-flex flex-row flex-wrap justify-content-start">
                  {
                    this.state.tracks ? this.state.tracks.items.map((item, id) => <div key={id} className="item">
                      <div className="row" style={{ width: '18rem', height: '5rem', background: '#0f1424' }}>
                        <div className="col-md-4">
                          <img src={item.album.images['1'] ? item.album.images['1'].url : '/dvd.png'} alt="..." style={{ width: 64, height: 64 }} />
                        </div>
                        <div className="col-md-8">
                          <div className="row">
                            <div className="col-md-12" style={{ height: '2rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              <h5 style={{ fontSize: '13px', color: '#fff' }}>{item.name}</h5>
                            </div>
                            <div className="col-md-12" style={{ height: '2rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              <p style={{ color: '#57575c' }}>{item.artists.map(artist => artist.name).join(',')}</p>
                            </div>
                          </div>
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
                  this.state.playlists && <h4>Playlists</h4>
                }
                <div className="dropdown-divider" style={{ borderColor: '#272729' }}></div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="d-flex flex-row flex-wrap justify-content-start">
                  {
                    this.state.playlists ? this.state.playlists.items.map((item, id) => <div key={id} className="item">

                      <div className="row" style={{ width: '18rem', height: '5rem', background: '#0f1424' }}>
                        <div className="col-md-4">
                          <img src={item.images['0'] ? item.images['0'].url : '/dvd.png'} alt="..." style={{ width: 64, height: 64 }} />
                        </div>
                        <div className="col-md-8">
                          <div className="row">
                            <div className="col-md-12" style={{ height: '2rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              <Link to={`/playlists/${item.id}`} style={{ fontSize: '13px', color: '#fff', textDecoration: 'none' }}>{item.name}</Link>
                            </div>
                            <div className="col-md-12" >

                            </div>
                          </div>
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
    access_token: state.spotify.access_token
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setRefreshAction: () => {
      dispatch({ type: SpotifyConstants.REFRESH_TOKEN })
    },
    setAccessToken: (access_token) => dispatch({ type: SpotifyConstants.CHANGE_ACCESS_TOKEN, access_token: access_token })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Search);
