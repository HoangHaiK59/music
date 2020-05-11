import React from 'react';
import { SpotifyConstants } from '../../store/constants';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlayCircle, faPauseCircle, faVolumeUp, faClock } from '@fortawesome/free-solid-svg-icons';
import './artist.css';
import { actions } from '../../store/actions/spotify.action';

class Artist extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tracks: [],
            artist: null,
            related: [],
            albums: [],
            ids: [],
            several: [],
            next: '',
            numItem: 5,
            expanded: false,
            access_token: '',
            state_changed: false
        }

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.setState(state => (state.expanded ? { expanded: !state.expanded, numItem: 5 } : { expanded: !state.expanded, numItem: state.tracks.length }));
    }

    getTopTracks(access_token) {
        let id = this.props.match.params.id;;
        return fetch(`https://api.spotify.com/v1/artists/${id}/top-tracks?country=VN`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access_token !== undefined ? access_token: this.state.access_token}`
            }
        })
            .then(res => {
                    return res.json()
            })
    }

    getArtist(access_token) {
        let id = this.props.match.params.id;;
        return fetch(`https://api.spotify.com/v1/artists/${id}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access_token !== undefined ? access_token: this.state.access_token}`
            }
        })
            .then(res => {
                    return res.json()
            })
    }

    getRelatedArtist(access_token) {
        let id = this.props.match.params.id;;
        return fetch(`https://api.spotify.com/v1/artists/${id}/related-artists`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access_token !== undefined ? access_token: this.state.access_token}`
            }
        })
            .then(res => {
                    return res.json()
            })
    }

    getArtistAlbums(access_token) {
        let id = this.props.match.params.id;;
        return fetch(`https://api.spotify.com/v1/artists/${id}/albums?include_groups=album,single,appears_on&country=VN`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access_token !== undefined ? access_token: this.state.access_token}`
            }
        })
            .then(res => {
                    return res.json()
            })
    }

    getSeveralAlbums(ids, access_token) {
        return fetch(`https://api.spotify.com/v1/albums?ids=${ids.join(',')}&market=VN`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access_token !== undefined ? access_token: this.state.access_token}`
            }
        })
            .then(res => {
                    return res.json()
            })
    }

    toMinutesSecond(duration) {
        const minutes = Math.floor(duration / 60000);
        const second = Math.floor((duration - minutes * 60000) / 1000);
        if (second < 10) {
            return minutes + ':0' + second;
        }
        return minutes + ':' + second;
    }

    playContext(id, indexAlbum, uri, type) {
        this.props.setPlaying(true);
        const deviceId = localStorage.getItem('deviceId');
        if (type === 'popular') {
            let diff = false;
            if(uri !== this.props.track_uri && uri !== this.props.linked_from_uri) diff = true;
            !diff ? 
            fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${this.state.access_token}`,
                'content-type': 'application/json'
              },
              body: JSON.stringify({
                  'uris': [uri],
                  'position_ms': this.props.position_ms
                })
            }): fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                method: 'PUT',
                headers: {
                  Authorization: `Bearer ${this.state.access_token}`,
                  'content-type': 'application/json'
                },
                body: JSON.stringify({
                    'uris': [uri]
                  })
              });

            const tracks = this.state.tracks.map((item, index) => {
                if (id === index) {
                  return { ...item, playing: true }
                }
                return {...item, playing: false};
              });

              const albums = this.state.albums.map((album, index) => {
                return {...album, playing: false}
            });

            const several = this.state.several.map((item, index) => {
                const tracks = item.map(track => {
                    return {...track, playing: false};
                });
                return tracks;
                
            });
        
        
              this.setState({ tracks: tracks, state_changed: true, albums: albums, several: several })
        } else if(type === 'context') {
            let diff = false;
            this.props.setContextUri(uri);

            if(uri !== this.props.context_uri) {
                diff = true;
            }
            !diff ? 
                fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${this.state.access_token}`
                    },
                    body: JSON.stringify({
                        'context_uri': uri,
                        'position_ms': this.props.position_ms
                    })
                }): 
                fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${this.state.access_token}`
                    },
                    body: JSON.stringify({
                        'context_uri': uri
                    })
                });

            const albums = this.state.albums.map((album, index) => {
                if(index === id) {
                    return {...album, playing: true}
                }
                return {...album, playing: false}
            });

            const tracks = this.state.tracks.map((item, index) => {
                return {...item, playing: false};
              });

            const several = this.state.several.map((item, index) => {
                if(index === indexAlbum) {
                    const tracks = item.map((track, idtrack) => {
                        if(track.uri === this.props.track_uri || track.uri === this.props.linked_from_uri) {
                            return {...track, playing: true}
                        }
                        return {...track, playing: false};
                    });
      
                    return tracks;
                }
                else {
                    const tracks = item.map(track => {
                        return {...track, playing: false};
                    });
                    return tracks;
                }
            });

            this.setState({several: several,albums: albums, state_changed: true, tracks: tracks})

        } else {
            let diff = false;
            if(uri !== this.props.track_uri && uri !== this.props.linked_from_uri) diff = true;
            !diff ? 
            fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                method: 'PUT',
                headers: {
                  Authorization: `Bearer ${this.state.access_token}`,
                  'content-type': 'application/json'
                },
                body: JSON.stringify({
                    'uris': [uri],
                    'position_ms': this.props.position_ms
                  })
            }): fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                method: 'PUT',
                headers: {
                  Authorization: `Bearer ${this.state.access_token}`,
                  'content-type': 'application/json'
                },
                body: JSON.stringify({
                    'uris': [uri]
                  })
            });

            const several = this.state.several.map((item, index) => {
                if (indexAlbum === index) {
                  const tracks = item.map((track, idtrack) => {
                      if(id === idtrack) {
                          return {...track, playing: true}
                      }
                      return {...track, playing: false};
                  });
    
                  return tracks;
                }
                else {
                    const tracks = item.map(track => {
                        return {...track, playing: false};
                    });
                    return tracks;
                }
              });

              const tracks = this.state.tracks.map((item, index) => {
                return {...item, playing: false};
              });

              const albums = this.state.albums.map((album, index) => {
                if(index === indexAlbum) {
                    return {...album, playing: true}
                }
                return {...album, playing: false}
            });
        
        
              this.setState({ several: several, state_changed: true, tracks: tracks, albums: albums })
        }
    }

    pause() {


        this.setState({ state_changed: false });
        this.props.setPlaying(false);

        const deviceId = localStorage.getItem('deviceId');
        fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${this.state.access_token}`,
                'content-type': 'application/json'
            }
        })
    }

    mouseMoveAlbum(id) {
        const items = this.state.albums.map((album, index) => {
            if(id === index) {
                return {...album, active: true}
            }
            return album
        })

        this.setState({albums: items})
    }

    mouseLeaveAlbum(id, indexAlbum) {
        const items = this.state.albums.map((album, index) => {
            if(id === index) {
                return {...album, active: false}
            }
            return album
        })

        this.setState({albums: items})
    }

    mouseMove(id, indexAlbum, type) {
        if (type === 'popular') {
          const tracks = this.state.tracks.map((item, index) => {
            if (id === index) {
              return { ...item, active: true }
            }
            return item;
          });
    
    
          this.setState({ tracks: tracks })
        } else  {
          const several = this.state.several.map((item, index) => {
            if (indexAlbum === index) {
              const tracks = item.map((track, idtrack) => {
                  if(id === idtrack) {
                      return {...track, active: true}
                  }
                  return track;
              });

              return tracks;
            }
            return item;
          });
    
    
          this.setState({ several: several })
        }
    
      }
    
      mouseLeave(id, indexAlbum, type) {
        if (type === 'popular') {
          const tracks = this.state.tracks.map((item, index) => {
            if (id === index) {
              return { ...item, active: false }
            }
            return item;
          });
    
    
          this.setState({ tracks: tracks })
        } else  {
          const several = this.state.several.map((item, index) => {
            if (indexAlbum === index) {
              const tracks = item.map((track, idtrack) => {
                  if(id === idtrack) {
                      return {...track, active: false}
                  }
                  return track;
              });

              return tracks;
            }
            return item;
          });
    
    
          this.setState({ several: several })
        }
    
      }
      
    componentDidMount() {

        actions.getAcessToken()
        .then(result => result.docs.forEach(doc => {
            this.getArtist(doc.data().access_token).then(artist => {
                this.getTopTracks(doc.data().access_token).then(data => {
                    this.getRelatedArtist(doc.data().access_token).then(related => {
                        this.getArtistAlbums(doc.data().access_token).then(album => {
                            this.getSeveralAlbums(album.items.map(item => item.id), doc.data().access_token).then(res => {
                                this.setState({
                                    access_token: doc.data().access_token,
                                    tracks: data.tracks.map(track => {
                                        if(track.uri === this.props.track_uri || track.uri === this.props.linked_from_uri) {
                                            return {...track, active: false, playing: true}
                                        }
                                        return {...track, active: false, playing: false}
                                    }), 
                                    artist: artist, 
                                    related: related.artists, 
                                    next: album.next, 
                                    albums: album.items.map(item => {
                                        if(this.props.context_uri === item.uri) {
                                            return {...item, active: false, playing: true}
                                        }
                                        return {...item, active: false, playing: false}
                                    }), 
                                    ids: album.items.map(item => item.id), 
                                    several: res.albums.map(album => album.tracks.items.map(item => {
                                        if(item.uri === this.props.track_uri || item.uri === this.props.linked_from_uri) {
                                            return {...item, active: false, playing: true}
                                        }
                                        return {...item, active: false, playing: false}
                                    })) 
                                })
                            });
    
                        })
                    })
    
                })
            });
        }))

        this.interval = setInterval(() => {
            actions.getAcessToken()
            .then(result => result.docs.forEach(doc => {
                if(doc.data().access_token !== this.state.access_token) {
                    this.setState({access_token: doc.data().access_token})
                }
            }))
        }, 300000);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.match.params.id !== prevProps.match.params.id) {
            this.getArtist().then(artist => {
                this.getTopTracks().then(data => {
                    this.getRelatedArtist().then(related => {
                        this.getArtistAlbums().then(album => {
                            this.getSeveralAlbums(album.items.map(item => item.id)).then(res => {
                                this.setState({ 
                                    tracks: data.tracks.map(track => ({...track, active: false, playing: false})), 
                                    artist: artist, 
                                    related: related.artists, 
                                    next: album.next, 
                                    albums: album.items.map(item => ({...item, active: false, playing: false})), 
                                    ids: album.items.map(item => item.id), 
                                    several: res.albums.map(album => album.tracks.items.map(item => ({...item, active: false, playing: false}))) 
                                 })
                            });
                            //this.setState({ tracks: data.tracks, artist: artist, related: related.artists, next: album.next, albums: album.items })
                        })
                    })

                })
            })
        }

        if(this.props.playing !== prevProps.playing) {
            this.setState({state_changed: this.props.playing})
        }
    }

    componentWillUnmount() {
        clearInterval(this.interval)
    }

    render() {
        return (
            (this.state.artist && this.state.tracks && this.state.several) && <div className="container-fluid">
                <div className="row" style={{ height: '50px' }}></div>
                <div className="row" >
                    <div className="col-md-12">
                        <div className="row">
                            <div className="col-md-1">
                                <img className="rounded-circle" style={{ width: 100, height: 100 }} src={`${this.state.artist.images[0].url}`} alt="" />
                            </div>
                            <div className="col-md-4">
                                <div className="row" style={{ height: '2rem' }}></div>
                                <div className="row">
                                    <div className="col-md-12 text-white">{this.state.artist.type.toUpperCase()}</div>
                                    <div className="col-md-12">
                                        <h4 className="text-white">{this.state.artist.name}</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-12">
                        <div className="row" style={{ height: '1.5rem' }}></div>
                        <div className="row">
                            <div className="col-md-10">
                                <div className="d-flex flex-row flex-wrap justify-content-start">
                                    <button className="btn-green btn-small">PLAY</button>
                                    <button className="btn btn-transparent">Follow</button>
                                </div>
                            </div>
                            <div className="col-md-2"></div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <div className="row mt-2">
                            <div className="col-md-12" style={{ borderBottom: '1px solid #1a1c1f' }}>
                                <h5 className="text-white">Popular</h5>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <div className="d-flex flex-column flex-wrap justify-content-start">
                                    {
                                        this.state.expanded ? this.state.tracks.map((track, id) => <div key={id} className={`${ track.playing ?'track-item track-item-active': 'track-item'}`}
                                        onMouseMove = {() => this.mouseMove(id, null, 'popular')}
                                        onMouseLeave = {() => this.mouseLeave(id, null, 'popular')}
                                        >
                                            <div className="row">
                                                <div className="col-md-1">
                                                    <img src={`${track.album.images[2].url}`} style={{ width: 32, height: 32 }} alt="" />
                                                </div>
                                                {
                                                    track.active ?<div className="col-md-1">
                                                        {
                                                            track.playing && this.state.state_changed ? 
                                                            <FontAwesomeIcon className="mt-1" icon={faPauseCircle} onClick={() => this.pause()} style={{fontSize: '1.5rem', marginLeft: '-7px'}}/>:
                                                            <FontAwesomeIcon className="mt-1" icon={faPlayCircle}  onClick={() => this.playContext(id, null, track.uri, 'popular')}  style={{fontSize: '1.5rem', marginLeft: '-7px'}}/>
                                                        }
                                                    </div> 
                                                    :<div className="col-md-1 text-white">
                                                        {
                                                            track.playing ? 
                                                            <FontAwesomeIcon className="mt-1" icon={faVolumeUp}  style={{fontSize: '1.2rem', marginLeft: '-7px'}}/>
                                                            : id + 1
                                                        }
                                                    </div>
                                                }
                                                <div className="col-md-10 text-white">{track.name}</div>
                                                <div className="col-md-12 dropdown-divider" style={{ borderColor: '#1a1c1f' }}></div>
                                            </div>
                                        </div>) :
                                            this.state.tracks.slice(0, this.state.numItem).map((track, id) => <div key={id} className={`${ track.playing ?'track-item track-item-active': 'track-item'}`} 
                                            onMouseMove = {() => this.mouseMove(id, null, 'popular')}
                                            onMouseLeave = {() => this.mouseLeave(id, null, 'popular')}>
                                                <div className="row">
                                                    <div className="col-md-1">
                                                        <img src={`${track.album.images[2].url}`} style={{ width: 32, height: 32 }} alt="" />
                                                    </div>
                                                    {
                                                        track.active ?<div className="col-md-1">
                                                            {
                                                                track.playing && this.state.state_changed ? 
                                                                <FontAwesomeIcon className="mt-1" icon={faPauseCircle} onClick={() => this.pause()}  style={{fontSize: '1.5rem', marginLeft: '-7px'}}/>:
                                                                <FontAwesomeIcon className="mt-1" icon={faPlayCircle} onClick={() => this.playContext(id, null, track.uri, 'popular')} style={{fontSize: '1.5rem', marginLeft: '-7px'}}/>
                                                            }
                                                        </div> 
                                                        :<div className="col-md-1 text-white">
                                                            {
                                                                track.playing ? 
                                                                <FontAwesomeIcon className="mt-1" icon={faVolumeUp}  style={{fontSize: '1.2rem', marginLeft: '-7px'}}/>
                                                                : id + 1
                                                            }
                                                        </div>
                                                    }
                                                    <div className="col-md-10 text-white">{track.name}</div>
                                                    <div className="col-md-12 dropdown-divider" style={{ borderColor: '#1a1c1f' }}></div>
                                                </div>
                                            </div>)
                                    }
                                </div>
                            </div>
                            <div className="col-md-12 mt-1">
                                {!this.state.expanded ? <button className="btn-trans" onClick={this.handleClick}>SHOW {this.state.numItem} MORE</button>
                                    : <button className="btn-trans" onClick={this.handleClick}>SHOW ONLY 5 SONGS</button>}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-1"></div>
                    <div className="col-md-4">
                        <div className="row">
                            <div className="col-md-12">
                                <h5 className="text-white">Fan Also Like</h5>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <div className="d-flex flex-column flex-wrap justify-content-start">
                                    {
                                        this.state.expanded ? this.state.related.slice(0, 9).map((artist, id) => <div key={id} className="artist-item mt-1">
                                            <div className="row">
                                                <div className="col-md-1">
                                                    <img className="rounded-circle" src={`${artist.images[0].url}`} style={{ width: 45, height: 45 }} alt="" />
                                                </div>
                                                <div className="ml-2 col-md-3 text-white">
                                                    <Link to={`/artist/${artist.id}`} className="text-white" style={{ textDecoration: 'none' }}>{artist.name}</Link>
                                                </div>
                                            </div>
                                        </div>) :
                                            this.state.related.slice(0, this.state.numItem).map((artist, id) => <div key={id} className="artist-item mt-1">
                                                <div className="row">
                                                    <div className="col-md-1">
                                                        <img className="rounded-circle" src={`${artist.images[0].url}`} style={{ width: 45, height: 45 }} alt="" />
                                                    </div>
                                                    <div className="ml-2 col-md-3 text-white">
                                                        <Link to={`/artist/${artist.id}`} className="text-white" style={{ textDecoration: 'none' }}>{artist.name}</Link>
                                                    </div>
                                                </div>
                                            </div>)
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <div className="d-flex flex-column flex-wrap justify-content-start">
                            {
                                this.state.albums.map((album, id) => <div key={id} className="row mt-lg-4">
                                    <div className="col-md-12">
                                        <div className="row">
                                            <div 
                                            onMouseMove={() => this.mouseMoveAlbum(id)}
                                            onMouseLeave={() => this.mouseLeaveAlbum(id)}
                                            className="col-md-1 position-relative">
                                                <img src={`${album.images[0].url}`} style={{ width: 100, height: 100, zIndex:1 }} alt="" />
                                                {
                                                    album.active ? <div className="position-absolute" style={{zIndex: 2, top: '30%', left: '30%'}}>
                                                        { 
                                                            album.playing && this.state.state_changed ? 
                                                            <FontAwesomeIcon icon={faPauseCircle} onClick={() => this.pause()} size="3x" color="#2eb35f"/> :
                                                            <FontAwesomeIcon icon={faPlayCircle} onClick={() => this.playContext(id, id, album.uri, 'context')} size="3x" color="#2eb35f"/>
                                                        }
                                                    </div>: 
                                                    <div className="position-absolute" style={{zIndex: 2, top: '30%', left: '30%'}}>
                                                        { 
                                                            album.playing  ? 
                                                            <FontAwesomeIcon icon={faVolumeUp} size="3x" color="#2eb35f"/> :
                                                            null
                                                        }
                                                    </div>
                                                }
                                            </div>
                                            <div className="col-md-4 ml-2">
                                                <div className="row">
                                                    <div className="col-md-12 text-white">
                                                        {album.release_date.slice(0, 4)}
                                                    </div>
                                                    <div className="col-md-12">
                                                        <h3 className="text-white">{album.name}</h3>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="content-item">
                                            <div className="row">
                                                <div className="col-md-1">#</div>
                                                <div className="col-md-5">TITLE</div>
                                                <div className="col-md-5"></div>
                                                <div className="col-md-1">
                                                    <FontAwesomeIcon icon={faClock} />
                                                </div>
                                            </div>
                                        </div>
                                        {
                                            this.state.several[id].map((track, index) => <div 
                                            onMouseMove = {() => this.mouseMove(index, id, null)}
                                            onMouseLeave = {() => this.mouseLeave(index, id, null)}
                                            key={index} className={`${ track.playing ?'track-item track-item-active': 'track-item'}`}>
                                                <div className="row">
                                                    {
                                                    track.active ?<div className="col-md-1">
                                                        {
                                                            track.playing && this.state.state_changed ? 
                                                            <FontAwesomeIcon className="mt-1 ml-1" icon={faPauseCircle} onClick={() => this.pause()} style={{fontSize: '1.5rem', marginLeft: '-7px'}}/>:
                                                            <FontAwesomeIcon className="mt-1 ml-1" icon={faPlayCircle} onClick={() => this.playContext(index, id, track.uri, '')} style={{fontSize: '1.5rem', marginLeft: '-7px'}}/>
                                                        }
                                                    </div> 
                                                    :<div className="col-md-1 text-white">
                                                        {
                                                            track.playing ? 
                                                            <FontAwesomeIcon className="mt-1 ml-1" icon={faVolumeUp} style={{fontSize: '1.2rem', marginLeft: '-7px'}}/>:
                                                            index + 1
                                                        }
                                                    </div>
                                                    }
                                                    <div className="col-md-5" style={{ color: track.playing ? '#4ca331': ''}}>{track.name}</div>
                                                    <div className="col-md-5" style={{ color: track.playing ? '#4ca331': ''}}></div>
                                                    <div className="col-md-1" style={{ color: track.playing ? '#4ca331': ''}}>{this.toMinutesSecond(track.duration_ms)}</div>
                                                </div>
                                            </div>)
                                        }
                                    </div>
                                </div>)
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        access_token: state.spotify.access_token,
        position_ms: state.spotify.position_ms,
        track_uri: state.spotify.track_uri,
        linked_from_uri: state.spotify.linked_from_uri,
        context_uri: state.spotify.context_uri
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        setPlaying : playing => dispatch({type: SpotifyConstants.CHANGE_PLAYING, playing: playing}),
        setContextUri: context_uri => dispatch({type: SpotifyConstants.CHANGE_CONTEXT_URI, context_uri: context_uri, playing: true})
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Artist)