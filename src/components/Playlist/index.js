import React from 'react';
import { refreshAccessToken } from '../../helper/token';
import './playlist.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlayCircle, faHeart, faPauseCircle, faVolumeUp, faClock } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { SpotifyConstants } from '../../store/constants';

class Playlist extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: null,
            items: [],
            uris: [],
            uri_playlist: '',
            id_played: -1, 
            next_track: ''
        }

    }

    getPlaylist() {
        let id = this.props.match.params.id;
        let url = `https://api.spotify.com/v1/playlists/${id}`;

        return fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${this.props.access_token}`
            }
        }).then(res => res.json());
    }

    mouseMove(id) {
        const items = this.state.items.map((item, index) => {
            if (id === index) {
                return {...item, isActive: true}
            }
            return item;
        });


        this.setState({items: items})
    }

    mouseLeave(id) {
        const items = this.state.items.map((item, index) => {
            if (id === index) {
                return {...item, isActive: false}
            }
            return item;
        });


        this.setState({items: items})
    }

    toMinutesSecond(duration) {
        const minutes = Math.floor(duration / 60000);
        const second = Math.floor((duration - minutes * 60000) / 1000);
        if (second < 10) {
          return minutes + ':0' + second;
        }
        return minutes + ':' + second;
    }

    playPlaylist(uri) {
      const deviceId = localStorage.getItem('deviceId');
      fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
          method: 'PUT',
          headers: {
              Authorization: `Bearer ${this.props.access_token}`,
              'content-type': 'application/json'
          },
          body: JSON.stringify({
            'context_uri': uri        
          })
      })

      this.props.setContextUri(uri);

      this.setState(state => ({items: state.items.map((item, id) => {
          if(id === 0) return {...item, isPlaying: true}
          return {...item, isPlaying: false};
      })}))
    }

    playTrack(id,uri) {
        let items, next_track;
        if(this.state.id_played !== -1) {
            items = this.state.items.map((item, index) => {
                if(index === this.state.id_played) {
                    return {...item, isPlaying: false}
                }

                if(index === id) {
                    return {...item, isPlaying: true}
                }

                if(index === id + 1) {
                    next_track = item.track.uri
                }

                return item
            })
        } else {
            items = this.state.items.map((item, index) => {

                if(index === id) {
                    return {...item, isPlaying: true}
                }

                if(index === id + 1) {
                    next_track = item.track.uri
                }

                return item
            })
        }

        this.setState({items: items, id_played: id, next_track: next_track});

        const deviceId = localStorage.getItem('deviceId');
        fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${this.props.access_token}`,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
              'uris': [uri]       
            })
        })//.then(res => res !== undefined ? res.json().then(json => {
        //     if(json.status === 401) {
        //         refreshAccessToken().then(resP => resP.json().then(jsonP => {
        //             localStorage.setItem('token', jsonP.access_token);
        //             this.setState({items: items,id_played: id, token: jsonP.access_token})
        //         }))
        //     } else 
        //     this.setState({items: items, id_played: id})
        // }): this.setState({items: items, id_played: id}))

        fetch(`https://api.spotify.com/v1/me/player/queue?uri=${next_track}&device_id=${deviceId}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.props.access_token}`,
                'content-type': 'application/json'
            }
        })
    }

    pauseTrack(id) {
        let items = this.state.items.map((item, index) => {

                if(index === id) {
                    return {...item, isPlaying: false}
                }

                return item
            })

        this.setState({items: items});

        const deviceId = localStorage.getItem('deviceId');
        fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${this.props.access_token}`,
                'content-type': 'application/json'
            }
         })//.then(res => res.json().then(json => {
        //     if(json.status === 401) {
        //         refreshAccessToken().then(resP => resP.json().then(jsonP => {
        //             localStorage.setItem('token', jsonP.access_token);
        //             this.setState({items: items, token: jsonP.access_token})
        //         }))
        //     } else 
        //     this.setState({items: items})
        // }))
    }

    componentDidMount() {
        this.getPlaylist()
            .then(data => {
                if (data.error) {
                    refreshAccessToken().then(res => res.json().then(resJson => {
                        this.props.setAccessToken(resJson.access_token);
                    }))
                } else {
                    this.setState({ data: data, items: data.tracks.items.map((item) => {
                        if(item.track.uri === this.props.track_uri) {
                            return {...item, isActive: false, isPlaying: true}
                        }
                        return {...item, isActive: false, isPlaying: false}
                    }), 
                    uris:  data.tracks.items.map(item => item.track.uri),
                    uri_playlist: data.uri
                })
                }
            });

        
    }

    componentDidUpdate(prevProps, prevState) {
        if(prevProps.access_token !== this.props.access_token) {
            this.getPlaylist()
            .then(data => {
                    this.setState({ data: data, items: data.tracks.items.map((item) => {
                        if(item.track.uri === this.props.track_uri) {
                            return {...item, isActive: false, isPlaying: true}
                        }
                        return {...item, isActive: false, isPlaying: false}
                    }), 
                    uris:  data.tracks.items.map(item => item.track.uri),
                    uri_playlist: data.uri
                })
            });
        }
         if(prevProps.track_uri !== this.props.track_uri) {
            this.setState(state => ({items: state.items.map((item, id) => {
                // if(id ===0) {
                //     if(item.isPlaying === true) {
                //         return {...item, isPlaying: false}
                //     }
                //     return item
                // }
                if(item.track.uri === prevProps.track_uri) return {...item, isPlaying: false};
                else if(item.track.uri === this.props.track_uri) {
                    return {...item, isPlaying: true};
                }

                return item
            })}))
        }

    }

    render() {
        return (
            <div className="container-fluid">
                {
                    (this.state.data&&this.state.items) && <div className="row">
                        <div className="col-md-3">
                            <div className="container-fluid w-100 h-100">
                                <div className="container-fluid" style={{ width: '100%', height: '60%'}}>
                                    <div className="row mt-lg-4">
                                        <div className="col-md-12 col-sm-12 text-center">
                                            <img src={this.state.data.images[0].url} style={{width: '200px', height: '200px'}} alt=""/>
                                        </div>
                                        <div className="col-md-12 col-sm-12 text-center text-white mt-3" style={{fontWeight:'bold'}}>
                                            {
                                                this.state.data.type.charAt(0).toUpperCase() + this.state.data.type.slice(1, this.state.data.type.length)
                                            }
                                        </div>
                                        <div className="col-md-12 col-sm-12 mt-2 text-white text-center" style={{fontWeight: 'bold'}}>
                                            {
                                                this.state.data.name 
                                            }
                                        </div>
                                        <div className="col-md-12 col-sm-12 text-center mt-2">
                                            <button onClick={() => this.playPlaylist(this.state.uri_playlist)} className="btn-md btn-green">Play</button>
                                        </div>
                                        <div className="col-md-12 col-sm-12 text-center text-white mt-2" style={{fontWeight: 'bold'}}>
                                        {
                                            this.state.data.owner.display_name 
                                        }
                                    </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-9">
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-md-12" style={{ maxHeight: '900px', overflowY: 'scroll' }}>
                                        <div className="d-flex flex-column justify-content-start">
                                            <div className="track">
                                                <div className="row" style={{height: '100%', paddingTop: '10px'}}>
                                                    <div className="col-sm-1 col-xs-1" style={{color: '#8c8382'}}></div>
                                                    <div className="col-sm-4 col-xs-4" style={{color: '#8c8382'}}>Title</div>
                                                    <div className="col-sm-3 col-xs-3" style={{color: '#8c8382'}}>Artist</div>
                                                    <div className="col-sm-3 col-xs-3" style={{color: '#8c8382'}}>Album</div>
                                                    <div className="col-sm-1 col-xs-1" style={{color: '#8c8382'}}><FontAwesomeIcon icon={faClock} color="white" /></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="d-flex flex-column justify-content-start">
                                            {
                                                this.state.items.map((item, id) => item.isPlaying ? <div key={id} 
                                                onMouseMove={() => this.mouseMove(id)}
                                                onMouseLeave={() => this.mouseLeave(id)}
                                                className="track active">
                                                    <div className="row" style={{height: '100%', paddingTop: '10px'}}>
                                                        {
                                                            item.isActive? <div className="col-sm-1 col-xs-1">
                                                            {
                                                                item.isPlaying ? <FontAwesomeIcon icon={faPauseCircle} onClick={() => this.pauseTrack(id)} color="white" size="2x" />:
                                                                <FontAwesomeIcon icon={faPlayCircle} onClick={() => this.playTrack(id,item.track.uri)} color="white" size="2x" />
                                                            }
                                                            </div>
                                                            : <div className="col-sm-1 col-xs-1">
                                                            {
                                                                item.isPlaying? <FontAwesomeIcon icon={faVolumeUp} color="white"/> : null
                                                            }
                                                            </div>   
                                                        }
                                                        <div className="col-sm-4 col-xs-4 text-white">
                                                            <div className="row">
                                                                <div className="col-sm-1 col-xs-1">
                                                                    <FontAwesomeIcon icon={faHeart} color="white" size="1x" />
                                                                </div>
                                                                <div className="col-sm-11 col-xs-11">
                                                                    {item.track.name}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-sm-3 col-xs-3 text-white">
                                                            {
                                                                item.track.artists[0].name
                                                            }
                                                        </div>
                                                        <div className="col-sm-3 col-xs-3 text-white">
                                                            <Link className="text-white" style={{textDecoration: 'none'}} to={`/album/${item.track.album.id}`}>                                                           {
                                                                item.track.album.name
                                                            }</Link>
                                                        </div>
                                                        <div className="col-sm-1 col-xs-1 text-white">
                                                            {
                                                                this.toMinutesSecond(item.track.duration_ms)
                                                            }
                                                        </div>
                                                    </div>
                                                    <div className="dropdown-divider" style={{borderColor: '#1a1c1f'}}></div>
                                                </div>: <div key={id} 
                                                onMouseMove={() => this.mouseMove(id)}
                                                onMouseLeave={() => this.mouseLeave(id)}
                                                className="track">
                                                    <div className="row" style={{height: '100%', paddingTop: '10px'}}>
                                                        {
                                                            item.isActive? <div className="col-sm-1 col-xs-1">
                                                            {
                                                                item.isPlaying ? <FontAwesomeIcon icon={faPauseCircle} onClick={() => this.pauseTrack(id)} color="white" size="2x" />:
                                                                <FontAwesomeIcon icon={faPlayCircle} onClick={() => this.playTrack(id,item.track.uri)} color="white" size="2x" />
                                                            }
                                                            </div>
                                                            : <div className="col-sm-1 col-xs-1">
                                                            </div>   
                                                        }
                                                        <div className="col-sm-4 col-xs-4 text-white">
                                                            <div className="row">
                                                                <div className="col-sm-1 col-xs-1">
                                                                    <FontAwesomeIcon icon={faHeart} color="white" size="1x" />
                                                                </div>
                                                                <div className="col-sm-11 col-xs-11">
                                                                    {item.track.name}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-sm-3 col-xs-3 text-white">
                                                            {
                                                                item.track.artists[0].name
                                                            }
                                                        </div>
                                                        <div className="col-sm-3 col-xs-3 text-white">
                                                            <Link className="text-white" style={{textDecoration: 'none'}} to={`/album/${item.track.album.id}`}>                                                           {
                                                                item.track.album.name
                                                            }</Link>
                                                        </div>
                                                        <div className="col-sm-1 col-xs-1 text-white">
                                                            {
                                                                this.toMinutesSecond(item.track.duration_ms)
                                                            }
                                                        </div>
                                                    </div>
                                                    <div className="dropdown-divider" style={{borderColor: '#1a1c1f'}}></div>
                                                </div>
                                                
                                                )
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </div>
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        track_uri: state.spotify.track_uri,
        access_token: state.spotify.access_token
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        setAccessToken: (access_token) => dispatch({type: SpotifyConstants.CHANGE_ACCESS_TOKEN, access_token: access_token}),
        setContextUri: (context_uri) => dispatch({type: SpotifyConstants.CHANGE_CONTEXT_URI, context_uri: context_uri})
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Playlist);