import React from 'react';
import { refreshAccessToken } from '../../helper/token';
import './playlist.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlayCircle, faHeart, faPauseCircle, faVolumeUp, faClock, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { SpotifyConstants } from '../../store/constants';
import moment from 'moment';

class Playlist extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: null,
            items: [],
            uris: [],
            uri_playlist: '',
            id_played: -1,
            next_track: '',
            state_changed: false,
            duration_playlist: 0
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
                return { ...item, isActive: true }
            }
            return item;
        });


        this.setState({ items: items })
    }

    mouseLeave(id) {
        const items = this.state.items.map((item, index) => {
            if (id === index) {
                return { ...item, isActive: false }
            }
            return item;
        });


        this.setState({ items: items })
    }

    toMinutesSecond(duration) {
        const minutes = Math.floor(duration / 60000);
        const second = Math.floor((duration - minutes * 60000) / 1000);
        if (second < 10) {
            return minutes + ':0' + second;
        }
        return minutes + ':' + second;
    }

    toHourMinute(duration) {
        const hour = Math.floor(duration / (60000 * 60));
        const minutes = Math.floor((duration - hour * 60000 * 60) / 60000);
        return hour + ' hr ' + minutes + ' min';
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(nextState !== this.state || nextProps.playing !== this.props.playing || nextProps.track_uri !== this.props.track_uri)
            return true;
        return false;
    }

    playPlaylist(uri) {
        const deviceId = localStorage.getItem('deviceId');
        let isUri = false, isLinked = false;
        for( const item of this.state.items) {
            if(item.track.uri === this.props.track_uri) 
                isUri = true; 
            if(item.track.uri === this.props.linked_from_uri) 
                isLinked = true;
        }
        !isUri ? fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${this.props.access_token}`,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                'context_uri': uri
            })
        }): fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${this.props.access_token}`,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                'context_uri': uri,
                'offset': {'uri' : isLinked ? this.props.linked_from_uri: this.props.track_uri},
                'position_ms': this.props.position_ms
            })
        })

        this.props.setContextUri(uri);

        !isUri ? this.setState(state => ({
            state_changed: !state.state_changed,
            items: state.items.map((item, id) => {
                if (id === 0) return { ...item, isPlaying: true }
                return { ...item, isPlaying: false };
            })
        })): 
        this.setState(state => ({ state_changed: !state.state_changed,items: state.items.map((item, id) => {
            if (item.track.uri === this.props.track_uri || item.track.uri === this.props.linked_from_uri) return { ...item, isPlaying: true }
            return { ...item, isPlaying: false };
        })}))
    }

    playTrack(id, uri) {
        this.props.setPlaying(true);
        const deviceId = localStorage.getItem('deviceId');
        const items = this.state.items.map((item, index) => {

                if (index === id) {
                    return { ...item, isPlaying: true }
                }

                return {...item, isPlaying: false}
            })

        this.setState(state => ({ items: items, state_changed: !state.state_changed }));
        if(this.props.track_uri !== uri && this.props.linked_from_uri !== uri) {
            fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${this.props.access_token}`,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    'uris': [uri]
                })
            })

        } else {
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
            })
        }
    }

    pauseTrack() {
        this.props.setPlaying(false);
        // let items = this.state.items.map((item, index) => {

        //     if (index === id) {
        //         return { ...item, isPlaying: true }
        //     }

        //     return item
        // })

        this.setState(state => ({ state_changed: !state.state_changed }));

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
                    this.setState({
                        data: data, items: data.tracks.items.map((item) => {
                            if (item.track.uri === this.props.track_uri || item.track.uri === this.props.linked_from_uri) {
                                return { ...item, isActive: false, isPlaying: true }
                            }
                            return { ...item, isActive: false, isPlaying: false }
                        }),
                        uris: data.tracks.items.map(item => item.track.uri),
                        uri_playlist: data.uri,
                        duration_playlist: data.tracks.items.reduce((duration, cur) => duration + cur.track.duration_ms, 0)
                    })
                }
            });


    }

    componentDidUpdate(prevProps, prevState) {
        // if(prevProps.access_token !== this.props.access_token) {
        //     this.getPlaylist()
        //     .then(data => {
        //             this.setState({ data: data, items: data.tracks.items.map((item) => {
        //                 if(item.track.uri === this.props.track_uri) {
        //                     return {...item, isActive: false, isPlaying: true}
        //                 }
        //                 return {...item, isActive: false, isPlaying: false}
        //             }), 
        //             uris:  data.tracks.items.map(item => item.track.uri),
        //             uri_playlist: data.uri
        //         })
        //     });
        // }
        // if(!this.props.playing) {

        // }
        if(prevProps.playing !== this.props.playing) {
            this.setState(state => ({state_changed: this.props.playing}))
        }
        if (prevProps.track_uri !== this.props.track_uri) {
            this.setState(state => ({
                items: state.items.map((item, id) => {
                    // if(id ===0) {
                    //     if(item.isPlaying === true) {
                    //         return {...item, isPlaying: false}
                    //     }
                    //     return item
                    // }
                    if (item.track.uri === prevProps.track_uri || item.track.uri === prevProps.linked_from_uri) return { ...item, isPlaying: false };
                    else if (item.track.uri === this.props.track_uri || item.track.uri === this.props.linked_from_uri) {
                        return { ...item, isPlaying: true };
                    }

                    return item
                })
            }))
        }

    }

    render() {
        return (
            <div className="container-fluid">
                <div className="row" style={{ height: '50px' }}></div>
                {
                    (this.state.data && this.state.items) && <div className="row">
                        <div className="col-md-12">
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-md-2 col-sm-3">
                                        <img src={this.state.data.images[0].url} style={{ width: '200px', height: '200px' }} alt="" />
                                    </div>
                                    <div className="col-md-10" style={{ marginLeft: '-4%' }}>
                                        <div className="row" style={{ height: '13%' }}></div>
                                        <div className="row">
                                            <div className="col-md-12 col-sm-12 text-white mt-3" >
                                                {
                                                    this.state.data.type.toUpperCase()
                                                }
                                            </div>
                                            <div className="col-md-12 col-sm-12 mt-2 text-white" style={{ fontWeight: 'bold' }}>
                                                <h3>
                                                    {
                                                        this.state.data.name
                                                    }
                                                </h3>
                                            </div>
                                            <div className="col-md-12 col-sm-12 text-white mt-2">
                                                <p style={{ color: '#686e6a' }}>Created by {
                                                    this.state.data.owner.display_name
                                                } &bull; {this.state.data.tracks.total} songs, {this.toHourMinute(this.state.duration_playlist)}
                                                </p>
                                            </div>
                                            <div className="col-md-12 col-sm-12 mt-2">
                                                <div className="row">
                                                    <div className="col-md-2">
                                                        {!this.state.state_changed ? <button onClick={() => this.playPlaylist(this.state.uri_playlist)} className="btn-small btn-green">PLAY</button>:
                                                        <button onClick={() => this.pauseTrack()} className="btn-small btn-green">PAUSE</button>}
                                                    </div>
                                                    <div className="col-md-10 text-right" style={{color: '#64676e'}}>
                                                        Followers
                                                    </div>
                                                </div>
                                                
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-2"></div>
                                    <div className="col-md-10 text-right" style={{ marginLeft: '-4%', color: '#64676e' }}>{this.state.data.followers.total}</div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-12">
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-md-12" style={{ maxHeight: '900px', overflowY: 'scroll' }}>
                                        <div className="d-flex flex-column justify-content-start">
                                            <div className="track-header">
                                                <div className="row" style={{ height: '100%', paddingTop: '10px' }}>
                                                    <div className="col-sm-1 col-xs-1" style={{ color: '#8c8382' }}></div>
                                                    <div className="col-sm-4 col-xs-4" style={{ color: '#8c8382', marginLeft: '-70px' }}>Title</div>
                                                    <div className="col-sm-2 col-xs-2" style={{ color: '#8c8382' }}>Artist</div>
                                                    <div className="col-sm-2 col-xs-2" style={{ color: '#8c8382' }}>Album</div>
                                                    <div className="col-sm-2 col-xs-2" style={{ color: '#8c8382' }}><FontAwesomeIcon icon={faCalendarAlt} /></div>
                                                    <div className="col-sm-1 col-xs-1" style={{ color: '#8c8382' }}><FontAwesomeIcon icon={faClock}  /></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="d-flex flex-column justify-content-start">
                                            {
                                                this.state.items.map((item, id) => item.isPlaying ? <div key={id}
                                                    onMouseMove={() => this.mouseMove(id)}
                                                    onMouseLeave={() => this.mouseLeave(id)}
                                                    className="track active">
                                                    <div className="row" style={{ height: '100%', paddingTop: '10px' }}>
                                                        {
                                                            item.isActive ? <div className="col-sm-1 col-xs-1">
                                                                {
                                                                    ((item.isPlaying && this.state.state_changed) ) ? <FontAwesomeIcon icon={faPauseCircle} onClick={() => this.pauseTrack()} color="#c4c4be" size="2x" /> :
                                                                    <FontAwesomeIcon icon={faPlayCircle} onClick={() => this.playTrack(id, item.track.uri)} color="#c4c4be" size="2x" />
                                                                }
                                                            </div>
                                                                : <div className="col-sm-1 col-xs-1">
                                                                    {
                                                                        (item.isPlaying ) ? <FontAwesomeIcon icon={faVolumeUp} color="#c4c4be" /> : null
                                                                    }
                                                                </div>
                                                        }
                                                        <div className="col-sm-4 col-xs-4" style={{ marginLeft: '-70px',color: '#4ca331' }} >
                                                            <div className="row">
                                                                <div className="col-sm-11 col-xs-11">
                                                                    {item.track.name}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-sm-2 col-xs-2" style={{color: '#4ca331'}}>
                                                            {
                                                                item.track.artists[0].name
                                                            }
                                                        </div>
                                                        <div className="col-sm-2 col-xs-2">
                                                            <Link style={{ textDecoration: 'none',color: '#4ca331' }} to={`/album/${item.track.album.id}`}>                                                           {
                                                                item.track.album.name
                                                            }</Link>
                                                        </div>
                                                        <div className="col-sm-2 col-xs-2" style={{color: '#4ca331'}}>
                                                            {
                                                                moment(item.added_at).fromNow()
                                                            }
                                                        </div>
                                                        <div className="col-sm-1 col-xs-1" style={{color: '#4ca331'}}>
                                                            {
                                                                this.toMinutesSecond(item.track.duration_ms)
                                                            }
                                                        </div>
                                                    </div>
                                                    <div className="dropdown-divider" style={{ borderColor: '#1a1c1f' }}></div>
                                                </div> : <div key={id}
                                                    onMouseMove={() => this.mouseMove(id)}
                                                    onMouseLeave={() => this.mouseLeave(id)}
                                                    className="track">
                                                        <div className="row" style={{ height: '100%', paddingTop: '10px' }}>
                                                            {
                                                                item.isActive ? <div className="col-sm-1 col-xs-1">
                                                                    {
                                                                        (item.isPlaying && this.state.state_changed)? <FontAwesomeIcon icon={faPauseCircle} onClick={() => this.pauseTrack()} color="#c4c4be" size="2x" /> :
                                                                        <FontAwesomeIcon icon={faPlayCircle} onClick={() => this.playTrack(id, item.track.uri)} color="#c4c4be" size="2x" />
                                                                    }
                                                                </div>
                                                                    : <div className="col-sm-1 col-xs-1">
                                                                    </div>
                                                            }
                                                            <div className="col-sm-4 col-xs-4" style={{ marginLeft: '-70px' }}>
                                                                <div className="row">
                                                                    <div className="col-sm-11 col-xs-11">
                                                                        {item.track.name}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-sm-2 col-xs-2">
                                                                {
                                                                    item.track.artists[0].name
                                                                }
                                                            </div>
                                                            <div className="col-sm-2 col-xs-2 ">
                                                                <Link style={{color: '#c4c4be', textDecoration: 'none' }} to={`/album/${item.track.album.id}`}>                                                           {
                                                                    item.track.album.name
                                                                }</Link>
                                                            </div>
                                                            <div className="col-sm-2 col-xs-2" style={{color: '#c4c4be'}}>
                                                                {
                                                                    moment(item.added_at).fromNow()
                                                                }
                                                            </div>
                                                            <div className="col-sm-1 col-xs-1" style={{color: '#c4c4be'}}>
                                                                {
                                                                    this.toMinutesSecond(item.track.duration_ms)
                                                                }
                                                            </div>
                                                        </div>
                                                        <div className="dropdown-divider" style={{ borderColor: '#1a1c1f' }}></div>
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
        linked_from_uri: state.spotify.linked_from_uri,
        access_token: state.spotify.access_token, 
        position_ms: state.spotify.position_ms,
        playing: state.spotify.playing
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        setAccessToken: (access_token) => dispatch({ type: SpotifyConstants.CHANGE_ACCESS_TOKEN, access_token: access_token }),
        setContextUri: (context_uri) => dispatch({ type: SpotifyConstants.CHANGE_CONTEXT_URI, context_uri: context_uri, playing: true }),
        setPlaying: (playing) => dispatch({ type: SpotifyConstants.CHANGE_PLAYING, playing: playing })
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Playlist);