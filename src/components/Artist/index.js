import React from 'react';
import { SpotifyConstants } from '../../store/constants';
import { connect } from 'react-redux';
import { refreshAccessToken } from '../../helper/token';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlayCircle, faPauseCircle, faVolumeUp, faClock } from '@fortawesome/free-solid-svg-icons';
import './artist.css';

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
        }

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.setState(state => (state.expanded ? { expanded: !state.expanded, numItem: 5 } : { expanded: !state.expanded, numItem: state.tracks.length }));
    }

    getTopTracks() {
        let id = this.props.match.params.id;;
        return fetch(`https://api.spotify.com/v1/artists/${id}/top-tracks?country=VN`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${this.props.access_token}`
            }
        })
            .then(res => {
                if (res.status !== 200) {
                    refreshAccessToken().then(resP => resP.json().then(resJ => this.props.setAccessToken(resJ.access_token)));
                    this.getTopTracks();
                } else
                    return res.json()
            })
    }

    getArtist() {
        let id = this.props.match.params.id;;
        return fetch(`https://api.spotify.com/v1/artists/${id}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${this.props.access_token}`
            }
        })
            .then(res => {
                if (res.status !== 200) {
                    refreshAccessToken().then(resP => resP.json().then(resJ => this.props.setAccessToken(resJ.access_token)));
                    this.getArtist();
                } else
                    return res.json()
            })
    }

    getRelatedArtist() {
        let id = this.props.match.params.id;;
        return fetch(`https://api.spotify.com/v1/artists/${id}/related-artists`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${this.props.access_token}`
            }
        })
            .then(res => {
                if (res.status !== 200) {
                    refreshAccessToken().then(resP => resP.json().then(resJ => this.props.setAccessToken(resJ.access_token)));
                    this.getRelatedArtist();
                } else
                    return res.json()
            })
    }

    getArtistAlbums() {
        let id = this.props.match.params.id;;
        return fetch(`https://api.spotify.com/v1/artists/${id}/albums?include_groups=album,single,appears_on&country=VN`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${this.props.access_token}`
            }
        })
            .then(res => {
                if (res.status !== 200) {
                    refreshAccessToken().then(resP => resP.json().then(resJ => this.props.setAccessToken(resJ.access_token)));
                    this.getArtistAlbums();
                } else
                    return res.json()
            })
    }

    getSeveralAlbums(ids) {
        return fetch(`https://api.spotify.com/v1/albums?ids=${ids.join(',')}&market=VN`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${this.props.access_token}`
            }
        })
            .then(res => {
                if (res.status !== 200) {
                    refreshAccessToken().then(resP => resP.json().then(resJ => this.props.setAccessToken(resJ.access_token)));
                    this.getSeveralAlbums();
                } else
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
        const deviceId = localStorage.getItem('deviceId');
        if (type === 'popular') {
            let diff = false;
            if(uri !== this.props.track_uri && uri !== this.props.linked_from_uri) diff = true;
            !diff ? 
            fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${this.props.access_token}`,
                'content-type': 'application/json'
              },
              body: JSON.stringify({
                  'uris': [uri],
                  'position_ms': this.props.position_ms
                })
            }): fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                method: 'PUT',
                headers: {
                  Authorization: `Bearer ${this.props.access_token}`,
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
                return item;
              });
        
        
              this.setState({ tracks: tracks })
        } else if(type === 'context') {

        } else {
            let diff = false;
            if(uri !== this.props.track_uri && uri !== this.props.linked_from_uri) diff = true;
            !diff ? 
            fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                method: 'PUT',
                headers: {
                  Authorization: `Bearer ${this.props.access_token}`,
                  'content-type': 'application/json'
                },
                body: JSON.stringify({
                    'uris': [uri],
                    'position_ms': this.props.position_ms
                  })
            }): fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                method: 'PUT',
                headers: {
                  Authorization: `Bearer ${this.props.access_token}`,
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
                      return track;
                  });
    
                  return tracks;
                }
                return item;
              });
        
        
              this.setState({ several: several })
        }
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
                                albums: album.items, 
                                ids: album.items.map(item => item.id), 
                                several: res.albums.map(album => album.tracks.items.map(item => ({...item, active: false, playing: false}))) 
                            })
                        });

                    })
                })

            })
        });

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
                                    albums: album.items, 
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
                                        this.state.expanded ? this.state.tracks.map((track, id) => <div key={id} className="track-item"
                                        onMouseMove = {() => this.mouseMove(id, null, 'popular')}
                                        onMouseLeave = {() => this.mouseLeave(id, null, 'popular')}
                                        >
                                            <div className="row">
                                                <div className="col-md-1">
                                                    <img src={`${track.album.images[2].url}`} style={{ width: 32, height: 32 }} alt="" />
                                                </div>
                                                {
                                                    track.active ?<div className="col-md-1">
                                                        <FontAwesomeIcon className="mt-1" icon={faPlayCircle} style={{fontSize: '1.5rem', marginLeft: '-7px'}}/>
                                                    </div> 
                                                    :<div className="col-md-1 text-white">{id + 1}</div>
                                                }
                                                <div className="col-md-10 text-white">{track.name}</div>
                                                <div className="col-md-12 dropdown-divider" style={{ borderColor: '#1a1c1f' }}></div>
                                            </div>
                                        </div>) :
                                            this.state.tracks.slice(0, this.state.numItem).map((track, id) => <div key={id} className="track-item" 
                                            onMouseMove = {() => this.mouseMove(id, null, 'popular')}
                                            onMouseLeave = {() => this.mouseLeave(id, null, 'popular')}>
                                                <div className="row">
                                                    <div className="col-md-1">
                                                        <img src={`${track.album.images[2].url}`} style={{ width: 32, height: 32 }} alt="" />
                                                    </div>
                                                    {
                                                        track.active ?<div className="col-md-1">
                                                            <FontAwesomeIcon className="mt-1" icon={faPlayCircle} style={{fontSize: '1.5rem', marginLeft: '-7px'}}/>
                                                        </div> 
                                                        :<div className="col-md-1 text-white">{id + 1}</div>
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
                                            <div className="col-md-1">
                                                <img src={`${album.images[0].url}`} style={{ width: 150, height: 150 }} alt="" />
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
                                            key={index} className="track-item">
                                                <div className="row">
                                                    {
                                                    track.active ?<div className="col-md-1">
                                                        <FontAwesomeIcon className="mt-1 ml-1" icon={faPlayCircle} style={{fontSize: '1.5rem', marginLeft: '-7px'}}/>
                                                    </div> 
                                                    :<div className="col-md-1 text-white">{index + 1}</div>
                                                    }
                                                    <div className="col-md-5">{track.name}</div>
                                                    <div className="col-md-5"></div>
                                                    <div className="col-md-1">{this.toMinutesSecond(track.duration_ms)}</div>
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
        linked_from_uri: state.spotify.linked_from_uri
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        setAccessToken: (access_token) => {
            dispatch({ type: SpotifyConstants.CHANGE_ACCESS_TOKEN, access_token: access_token })
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Artist)