import React from 'react';
import { refreshAccessToken } from '../../helper/token';
import './playlist.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlayCircle, faHeart, faPauseCircle, faVolumeUp } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

class Playlist extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: null,
            items: [],
            isRefresh: false,
            uris: [],
            uri_playlist: '',
            id_played: -1, 
            token: localStorage.getItem('token')
        }

    }

    getPlaylist() {
        let id = this.props.match.params.id;
        let url = `https://api.spotify.com/v1/playlists/${id}`;

        return fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${this.state.token}`
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
              Authorization: `Bearer ${this.state.token}`,
              'content-type': 'application/json'
          },
          body: JSON.stringify({
            'context_uri': uri        
          })
      })

      this.setState(state => ({items: state.items.map((item, id) => {
          if(id === 0) return {...item, isPlaying: true}
          return item;
      })}))
    }

    playTrack(id,uri) {
        let items;
        if(this.state.id_played !== -1) {
            items = this.state.items.map((item, index) => {
                if(index === this.state.id_played) {
                    return {...item, isPlaying: false}
                }

                if(index === id) {
                    return {...item, isPlaying: true}
                }

                return item
            })
        } else {
            items = this.state.items.map((item, index) => {

                if(index === id) {
                    return {...item, isPlaying: true}
                }

                return item
            })
        }

        this.setState({items: items, id_played: id})

        const deviceId = localStorage.getItem('deviceId');
        fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${this.state.token}`,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
              'uris': [uri]       
            })
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
                Authorization: `Bearer ${this.state.token}`,
                'content-type': 'application/json'
            }
        })
    }

    componentDidMount() {
        this.getPlaylist()
            .then(data => {
                if (data.error) {
                    refreshAccessToken().then(res => res.json().then(resJson => {
                        localStorage.setItem('token', resJson.access_token);
                        this.setState({token:resJson.access_token, isRefresh: true });
                    }))
                } else {
                    this.setState({ isRefresh: false, data: data, items: data.tracks.items.map((item) => ({...item, isActive: false, isPlaying: false})), 
                    uris:  data.tracks.items.map(item => item.track.uri),
                    uri_playlist: data.uri
                })
                }
            });

        
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.isRefresh) {
            this.getPlaylist()
                .then(data => {
                    this.setState({ data: data, isRefresh: false, items: data.tracks.items.map(item => ({...item, isActive: false, isPlaying: false})),
                    uris:  data.tracks.items.map(item => item.track.uri),
                    uri_playlist: data.uri })
                })
        } else if(prevProps.track_uri !== this.props.track_uri) {
            this.setState(state => ({items: state.items.map((item, id) => {
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
                            <div className="container-fluid position-relative w-100 h-100">
                                <div className="container-fluid position-absolute" style={{top: '10%', left: '5%', width: '100%', height: '60%'}}>
                                    <div className="row">
                                        <div className="col-md-12">
                                            <img src={this.state.data.images[0].url} alt=""/>
                                        </div>
                                        <div className="col-md-12 text-center text-white mt-3" style={{fontWeight:'bold'}}>
                                            {
                                                this.state.data.type.charAt(0).toUpperCase() + this.state.data.type.slice(1, this.state.data.type.length)
                                            }
                                        </div>
                                        <div className="col-md-12 mt-2 text-white" style={{fontWeight: 'bold'}}>
                                            {
                                                this.state.data.name 
                                            }
                                        </div>
                                        <div className="col-md-12 text-center">
                                            <button onClick={() => this.playPlaylist(this.state.uri_playlist)} className="btn-md btn-green">Play</button>
                                        </div>
                                        <div className="col-md-12 text-center text-white" style={{fontWeight: 'bold'}}>
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
                                            {
                                                this.state.items.map((item, id) => item.isPlaying ? <div key={id} 
                                                onMouseMove={() => this.mouseMove(id)}
                                                onMouseLeave={() => this.mouseLeave(id)}
                                                className="track active">
                                                    <div className="row mt-3">
                                                        {
                                                            item.isActive? <div className="col-md-1">
                                                            {
                                                                item.isPlaying ? <FontAwesomeIcon icon={faPauseCircle} onClick={() => this.pauseTrack(id)} color="white" size="2x" />:
                                                                <FontAwesomeIcon icon={faPlayCircle} onClick={() => this.playTrack(id,item.track.uri)} color="white" size="2x" />
                                                            }
                                                            </div>
                                                            : <div className="col-md-1">
                                                            {
                                                                item.isPlaying? <FontAwesomeIcon icon={faVolumeUp} color="white"/> : null
                                                            }
                                                            </div>   
                                                        }
                                                        <div className="col-md-4 text-white">
                                                            <div className="row">
                                                                <div className="col-md-1">
                                                                    <FontAwesomeIcon icon={faHeart} color="white" size="1x" />
                                                                </div>
                                                                <div className="col-md-11">
                                                                    {item.track.name}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3 text-white">
                                                            {
                                                                item.track.artists[0].name
                                                            }
                                                        </div>
                                                        <div className="col-md-3 text-white">
                                                            <Link className="text-white" style={{textDecoration: 'none'}} to={`/album/${item.track.album.id}`}>                                                           {
                                                                item.track.album.name
                                                            }</Link>
                                                        </div>
                                                        <div className="col-md-1 text-white">
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
                                                    <div className="row mt-3">
                                                        {
                                                            item.isActive? <div className="col-md-1">
                                                            {
                                                                item.isPlaying ? <FontAwesomeIcon icon={faPauseCircle} onClick={() => this.pauseTrack(id)} color="white" size="2x" />:
                                                                <FontAwesomeIcon icon={faPlayCircle} onClick={() => this.playTrack(id,item.track.uri)} color="white" size="2x" />
                                                            }
                                                            </div>
                                                            : <div className="col-md-1">
                                                            </div>   
                                                        }
                                                        <div className="col-md-4 text-white">
                                                            <div className="row">
                                                                <div className="col-md-1">
                                                                    <FontAwesomeIcon icon={faHeart} color="white" size="1x" />
                                                                </div>
                                                                <div className="col-md-11">
                                                                    {item.track.name}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3 text-white">
                                                            {
                                                                item.track.artists[0].name
                                                            }
                                                        </div>
                                                        <div className="col-md-3 text-white">
                                                            <Link className="text-white" style={{textDecoration: 'none'}} to={`/album/${item.track.album.id}`}>                                                           {
                                                                item.track.album.name
                                                            }</Link>
                                                        </div>
                                                        <div className="col-md-1 text-white">
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
        track_uri: state.spotify.track_uri
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Playlist);