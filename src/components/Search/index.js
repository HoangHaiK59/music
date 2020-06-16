import React from "react";
import "./search.css";
import { SpotifyConstants } from "../../store/constants";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlayCircle, faPauseCircle, faVolumeUp } from '@fortawesome/free-solid-svg-icons';
import { actions } from "../../store/actions/spotify.action";


class Search extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      query: "",
      data: null,
      albums: null,
      artists: null,
      tracks: null,
      playlists: null,
      id_played: -1,
      access_token: ''
    };
  }

  search(access_token) {
    let url = `https://api.spotify.com/v1/search?q=${this.props.query}&market=VN&type=album,artist,playlist,track`
    return fetch(url,
      {
        headers: {
          Authorization: `Bearer ${access_token !== undefined ? access_token: this.state.access_token}` 
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

  playContext(id, uri, type) {
    let diff = false;
    if(type !== 3) {
      this.props.setContextUri(uri);
      diff = true;
    } else {
      if(uri !== this.props.track_uri && uri !== this.props.linked_from_uri) {
        this.props.setContextUri();
        diff = true;
      }
    }
    const deviceId = localStorage.getItem('deviceId');
    !diff ? fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this.state.access_token}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify(type !== 3  ? {
        'context_uri': uri,
        'position_ms': this.props.position_ms
      } : {
          'uris': [uri],
          'position_ms': this.props.position_ms
        })
    }): fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this.state.access_token}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify(type !== 3  ? {
        'context_uri': uri,
      } : {
          'uris': [uri]
        })
    });

    if (type === 1) {
      const items = this.state.albums.items.map((item, index) => id === index ? ({ ...item, playing: true }) : ({ ...item, playing: false }));
      this.setState({
        id_played: id,
        albums: { ...this.state.albums, items: items },
        artists: { ...this.state.artists, items: this.state.artists.items.map(item => ({ ...item, playing: false })) },
        tracks: { ...this.state.tracks, items: this.state.tracks.items.map(item => ({ ...item, playing: false })) },
        playlists: { ...this.state.playlists, items: this.state.playlists.items.map(item => ({ ...item, playing: false })) }
      });
    } else if (type === 2) {
      const items = this.state.artists.items.map((item, index) => id === index ? ({ ...item, playing: true }) : ({ ...item, playing: false }));
      this.setState({
        id_played: id,
        artists: { ...this.state.artists, items: items },
        albums: { ...this.state.albums, items: this.state.albums.items.map(item => ({ ...item, playing: false })) },
        tracks: { ...this.state.tracks, items: this.state.tracks.items.map(item => ({ ...item, playing: false })) },
        playlists: { ...this.state.playlists, items: this.state.playlists.items.map(item => ({ ...item, playing: false })) }
      });
    } else if (type === 3) {
      const items = this.state.tracks.items.map((item, index) => id === index ? ({ ...item, playing: true }) : ({ ...item, playing: false }));
      this.setState({
        id_played: id,
        tracks: { ...this.state.tracks, items: items },
        albums: { ...this.state.albums, items: this.state.albums.items.map(item => ({ ...item, playing: false })) },
        artists: { ...this.state.artists, items: this.state.artists.items.map(item => ({ ...item, playing: false })) },
        playlists: { ...this.state.playlists, items: this.state.playlists.items.map(item => ({ ...item, playing: false })) }
      });
    } else {
      const items = this.state.playlists.items.map((item, index) => id === index ? ({ ...item, playing: true }) : ({ ...item, playing: false }));
      this.setState({
        id_played: id,
        playlists: { ...this.state.playlists, items: items },
        albums: { ...this.state.albums, items: this.state.albums.items.map(item => ({ ...item, playing: false })) },
        artists: { ...this.state.artists, items: this.state.artists.items.map(item => ({ ...item, playing: false })) },
        tracks: { ...this.state.tracks, items: this.state.tracks.items.map(item => ({ ...item, playing: false })) }
      });
    }

  }

  pause() {
    this.props.setPlaying(false);

    this.setState(state => ({ 
      albums: { ...this.state.albums, items: this.state.albums.items.map(item => ({ ...item, playing: false })) },
      artists: { ...this.state.artists, items: this.state.artists.items.map(item => ({ ...item, playing: false })) },
      tracks: { ...this.state.tracks, items: this.state.tracks.items.map(item => ({ ...item, playing: false })) },
      playlists: { ...this.state.playlists, items: this.state.playlists.items.map(item => ({ ...item, playing: false })) }
     }));

    const deviceId = localStorage.getItem('deviceId');
    fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this.state.access_token}`,
        'content-type': 'application/json'
      }
    })
  }

  componentDidMount() {

    actions.getAcessToken().then(result => result.docs.forEach(doc => {
      if(this.props.query !== '') {
        this.search(doc.data().access_token)
        .then(data => {
            this.setState({
              access_token: doc.data().access_token,
              albums: { ...data.albums, items: data.albums.items.map(item => ({ ...item, active: false, playing: false })) },
              artists: { ...data.artists, items: data.artists.items.map(item => ({ ...item, active: false, playing: false })) },
              tracks: { ...data.tracks, items: data.tracks.items.map(item => ({ ...item, active: false, playing: false })) },
              playlists: { ...data.playlists, items: data.playlists.items.map(item => ({ ...item, active: false, playing: false })) }
            })
        }
        )
      } else {
        this.setState({access_token: doc.data().access_token})
      }
    }));

    this.interval = setInterval(() => {
      actions.getAcessToken()
      .then(result => result.docs.forEach(doc => {
          if(doc.data().access_token !== this.state.access_token) {
              this.setState({access_token: doc.data().access_token})
          }
      }))
  }, 300000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  componentDidUpdate(prevProps, prevState) {

    if ((prevProps.query !== this.props.query && this.props.query !== '')) {
      this.search()
        .then(data => {
            this.setState({
              albums: { ...data.albums, items: data.albums.items.map(item => ({ ...item, active: false, playing: false })) },
              artists: { ...data.artists, items: data.artists.items.map(item => ({ ...item, active: false, playing: false })) },
              tracks: { ...data.tracks, items: data.tracks.items.map(item => ({ ...item, active: false, playing: false })) },
              playlists: { ...data.playlists, items: data.playlists.items.map(item => ({ ...item, active: false, playing: false })) }
            })
        }
        )
    }

  }

  render() {
    return (
      <div className="container-fluid" style={{ minHeight: '100%', backgroundColor: '#0f1424' }} >
        <div className="row" style={{height: '50px'}}>
        </div>
        {
          (this.state.albums && this.state.playlists) && <div className="container-fluid">
            <div className="row">
              <div className="col-md-12">
                {
                  (this.state.albums && this.state.albums.items.length > 0) && <h4>Albums</h4>
                }
                {
                  this.state.albums && this.state.albums.items.length > 0 && <div className="dropdown-divider" style={{ borderColor: '#272729' }}></div>
                }
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="d-flex flex-row flex-wrap justify-content-start">
                  {
                    this.state.albums ? this.state.albums.items.map((item, id) => <div key={id} className="item">

                      <div className="row" style={{ width: '18rem', height: '4.4rem', backgroundColor: 'transparent' }}>
                        {item.active ? <div className="col-md-4 w-25 position-relative" onMouseMove={() => this.mouseMove(id, 1)} onMouseLeave={() => this.mouseLeave(id, 1)}>
                          <img className="position-absolute" src={item.images['1'] ? item.images['1'].url : '/dvd.png'} alt="..." style={{ width: 64, height: 64, zIndex: 1 }} />
                          {
                            item.playing ?
                              <div className="position-absolute" style={{ top: '0', left: '16%',width: 66, height: 64, backgroundColor: 'rgba(2,2,2,.5)', zIndex: 2, }}><FontAwesomeIcon style={{ top: '25%', left: '20%'}} onClick={() => this.pause()} icon={faPauseCircle} className="icon position-absolute" color="#2eb35f" /></div> :
                              <div className="position-absolute" style={{ top: '0', left: '16%',width: 66, height: 64, backgroundColor: 'rgba(2,2,2,.5)', zIndex: 2 }}><FontAwesomeIcon style={{ top: '25%', left: '20%'}} onClick={() => this.playContext(id, item.uri, 1)} icon={faPlayCircle} className="icon position-absolute" color="#2eb35f" /></div>
                          }
                        </div> : <div className="col-md-4 w-25 position-relative" onMouseMove={() => this.mouseMove(id, 1)} onMouseLeave={() => this.mouseLeave(id, 1)}>
                            <img className="position-absolute" src={item.images['1'] ? item.images['1'].url : '/dvd.png'} alt="..." style={{ width: 64, height: 64, zIndex: 1 }} />
                            {item.playing && <div className="position-absolute" style={{ top: '0', left: '16%',width: 66, height: 64, backgroundColor: 'rgba(2,2,2,.5)', zIndex: 2 }}><FontAwesomeIcon style={{ top: '25%', left: '20%'}} icon={faVolumeUp} className="icon position-absolute" color="#2eb35f" /></div>}
                          </div>}
                        <div className="col-md-8 w-75">
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
                  this.state.artists && this.state.artists.items.length > 0 && <h4>Artists</h4>
                }
                {
                  this.state.artists && this.state.artists.items.length > 0 && <div className="dropdown-divider" style={{ borderColor: '#272729' }}></div>
                }
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="d-flex flex-row flex-wrap justify-content-start">
                  {
                    this.state.artists ? this.state.artists.items.map((item, id) => <div key={id} className="item">
                      <div className="row" style={{ width: '18rem', height: '4.4rem', backgroundColor: 'transparent' }}>
                        {item.active ? <div className="col-md-4 w-25 position-relative" onMouseMove={() => this.mouseMove(id, 2)} onMouseLeave={() => this.mouseLeave(id, 2)}>
                          <img className="rounded-circle position-absolute" src={item.images['1'] ? item.images['1'].url : '/user.png'} alt="..." style={{ width: 64, height: 64, zIndex: 1 }} />
                          {
                            item.playing ? <div className="position-absolute rounded-circle" style={{ top: '0', left: '16%',width: 67, height: 64, backgroundColor: 'rgba(2,2,2,.5)', zIndex: 2 }}><FontAwesomeIcon style={{ top: '25%', left: '20%'}} onClick={() => this.pause()} icon={faPauseCircle} className="icon position-absolute" color="#2eb35f" /></div> :
                              <div className="position-absolute rounded-circle" style={{ top: '0', left: '16%',width: 67, height: 64, backgroundColor: 'rgba(2,2,2,.5)', zIndex: 2 }}><FontAwesomeIcon style={{ top: '25%', left: '20%'}} onClick={() => this.playContext(id, item.uri, 2)} icon={faPlayCircle} className="icon position-absolute" color="#2eb35f" /></div>
                          }
                        </div> :
                          <div className="col-md-4 w-25 position-relative" onMouseMove={() => this.mouseMove(id, 2)} onMouseLeave={() => this.mouseLeave(id, 2)}>
                            <img className="rounded-circle position-absolute" src={item.images['1'] ? item.images['1'].url : '/user.png'} alt="..." style={{ width: 64, height: 64 }} />
                            {item.playing && <div className="position-absolute rounded-circle" style={{ top: '0', left: '16%',width: 67, height: 64, backgroundColor: 'rgba(2,2,2,.5)', zIndex: 2 }}><FontAwesomeIcon style={{ top: '25%', left: '20%'}} icon={faVolumeUp} className="icon position-absolute" color="#2eb35f" /></div>}
                          </div>
                        }
                        <div className="col-md-8 w-75">
                          <Link to={`/artist/${item.id}`} style={{ fontSize: '13px', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</Link>
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
                  this.state.tracks && this.state.tracks.items.length> 0 && <h4>Tracks</h4>
                }
                {
                  this.state.tracks && this.state.tracks.items.length> 0 && <div className="dropdown-divider" style={{ borderColor: '#272729' }}></div>
                }
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="d-flex flex-row flex-wrap justify-content-start">
                  {
                    this.state.tracks ? this.state.tracks.items.map((item, id) => <div key={id} className="item">
                      <div className="row" style={{ width: '18rem', height: '4.4rem', backgroundColor: 'transparent' }}>
                        {
                          item.active ? <div className="col-md-4 w-25 position-relative" onMouseMove={() => this.mouseMove(id, 3)} onMouseLeave={() => this.mouseLeave(id, 3)}>
                            <img className="position-absolute" src={item.album.images['1'] ? item.album.images['1'].url : '/dvd.png'} alt="..." style={{ width: 64, height: 64, zIndex: 1 }} />
                            {
                              item.playing ? <div className="position-absolute" style={{ top: '0', left: '16%',width: 66, height: 64, backgroundColor: 'rgba(2,2,2,.5)', zIndex: 2 }}><FontAwesomeIcon style={{ top: '25%', left: '20%'}} onClick={() => this.pause()} icon={faPauseCircle} className="icon position-absolute" color="#2eb35f" /></div> :
                                <div className="position-absolute" style={{ top: '0', left: '16%',width: 64, height: 66, backgroundColor: 'rgba(2,2,2,.5)', zIndex: 2 }}><FontAwesomeIcon style={{ top: '25%', left: '20%'}} onClick={() => this.playContext(id, item.uri, 3)} icon={faPlayCircle} className="icon position-absolute" color="#2eb35f" /></div>
                            }
                          </div> :
                            <div className="col-md-4 w-25 position-relative" onMouseMove={() => this.mouseMove(id, 3)} onMouseLeave={() => this.mouseLeave(id, 3)}>
                              <img className="position-absolute" src={item.album.images['1'] ? item.album.images['1'].url : '/dvd.png'} alt="..." style={{ width: 64, height: 64, zIndex: 1 }} />
                              {item.playing && <div className="position-absolute" style={{ top: '0', left: '16%',width: 66, height: 64, backgroundColor: 'rgba(2,2,2,.5)', zIndex: 2 }}><FontAwesomeIcon style={{ top: '25%', left: '20%'}} icon={faVolumeUp} className="icon position-absolute" color="#2eb35f" /></div>}
                            </div>
                        }
                        <div className="col-md-8 w-75">
                          <div className="row">
                            <div className="col-md-12" style={{ height: '2rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              <Link to={`/track/${item.album.id}`} style={{ fontSize: '13px', color: '#fff', textDecoration: 'none' }}>{item.name}</Link>
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
                  this.state.playlists && this.state.playlists.items.length> 0 && <h4>Playlists</h4>
                }
                {
                  this.state.playlists && this.state.playlists.items.length> 0 && <div className="dropdown-divider" style={{ borderColor: '#272729' }}></div>
                }
              </div>
            </div>
            <div className="row mb-customize">
              <div className="col-md-12">
                <div className="d-flex flex-row flex-wrap justify-content-start">
                  {
                    this.state.playlists ? this.state.playlists.items.map((item, id) => <div key={id} className="item">

                      <div className="row" style={{ width: '18rem', height: '4.4rem', backgroundColor: 'transparent' }}>
                        {
                          item.active ? <div className="col-md-4 w-25 position-relative" onMouseMove={() => this.mouseMove(id, 4)} onMouseLeave={() => this.mouseLeave(id, 4)}>
                            <img className="position-absolute" src={item.images['0'] ? item.images['0'].url : '/dvd.png'} alt="..." style={{ width: 64, height: 64, zIndex: 1 }} />
                            {
                              item.playing ? <div className="position-absolute" style={{ top: '0', left: '16%',width: 66, height: 64, backgroundColor: 'rgba(2,2,2,.5)', zIndex: 2 }}><FontAwesomeIcon style={{ top: '25%', left: '20%'}} onClick={() => this.pause()} icon={faPauseCircle} className="icon position-absolute" color="#2eb35f" /></div> :
                                <div className="position-absolute" style={{ top: '0', left: '16%',width: 64, height: 66, backgroundColor: 'rgba(2,2,2,.5)', zIndex: 2 }}><FontAwesomeIcon style={{ top: '25%', left: '20%'}} onClick={() => this.playContext(id, item.uri, 4)} icon={faPlayCircle} className="icon position-absolute" color="#2eb35f" /></div>
                            }
                          </div> :
                            <div className="col-md-4 w-25 position-relative" onMouseMove={() => this.mouseMove(id, 4)} onMouseLeave={() => this.mouseLeave(id, 4)}>
                              <img className="position-absolute" src={item.images['0'] ? item.images['0'].url : '/dvd.png'} alt="..." style={{ width: 64, height: 64, zIndex: 1 }} />
                              {item.playing && <div className="position-absolute" style={{ top: '0', left: '16%',width: 66, height: 64, backgroundColor: 'rgba(2,2,2,.5)', zIndex: 2 }}><FontAwesomeIcon style={{ top: '25%', left: '20%'}} icon={faVolumeUp} className="icon position-absolute" color="#2eb35f" /></div>}
                            </div>
                        }
                        <div className="col-md-8 w-75">
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
    access_token: state.spotify.access_token,
    context_uri: state.spotify.context_uri,
    track_uri: state.spotify.track_uri,
    linked_from_uri: state.spotify.linked_from_uri,
    position_ms: state.spotify.position_ms,
    query: state.spotify.query
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setRefreshAction: () => {
      dispatch({ type: SpotifyConstants.REFRESH_TOKEN })
    },
    setAccessToken: (access_token) => dispatch({ type: SpotifyConstants.CHANGE_ACCESS_TOKEN, access_token: access_token }),
    setContextUri: context_uri => dispatch({ type: SpotifyConstants.CHANGE_CONTEXT_URI, context_uri: context_uri, playing: true }),
    setPlaying : playing => dispatch({type: SpotifyConstants.CHANGE_PLAYING, playing: playing})

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Search);
