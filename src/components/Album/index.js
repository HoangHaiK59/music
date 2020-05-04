import React from 'react';
import { refreshAccessToken } from '../../helper/token';
import { SpotifyConstants } from '../../store/constants';
import { connect } from 'react-redux';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlayCircle, faPauseCircle, faVolumeUp, faClock, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

class Album extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            album: null,
            isRefresh: false,
            items: [],
            id_played: -1,
            next_track: '',
            uri_album: '',
            state_changed: false,
            duration_album: 0
        }
    }

    getAlbum() {
        let id = this.props.match.params.id;
        let url = `https://api.spotify.com/v1/albums/${id}`;

        return fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${this.props.access_token}`
            }
        }).then(res => res.status !==401? res.json(): {})
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

    playAlbum(uri) {
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
        this.props.setPlaying(true);

        this.setState(state => ({
            id_played: 0, items: state.items.map((item, id) => {
                if (id === 0) return { ...item, isPlaying: true }
                return { ...item, isPlaying: false };
            })
        }))
    }

    playTrack(id, uri) {
        this.props.setPlaying(true);
        const deviceId = localStorage.getItem('deviceId');
        let items, next_track;
        if (this.state.id_played !== -1) {
            if(this.state.items.length > 1) {
            items = this.state.items.map((item, index) => {
                if (index === this.state.id_played) {
                    return { ...item, isPlaying: false }
                }

                if (index === id) {
                    return { ...item, isPlaying: true }
                }

                if (index === id + 1) {
                    next_track = item.track.uri;
                    fetch(`https://api.spotify.com/v1/me/player/queue?uri=${next_track}&device_id=${deviceId}`, {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${this.props.access_token}`,
                            'content-type': 'application/json'
                        }
                    })
                }

                return item
            }) } else {
                items = this.state.items.map((item, index) => {
    
                    if (index === id) {
                        return { ...item, isPlaying: true }
                    }
    
                    return item
                })
            }
        } else {
            if(this.state.items.length > 0) {
                items = this.state.items.map((item, index) => {

                    if (index === id) {
                        return { ...item, isPlaying: true }
                    }
    
                    if (index === id + 1) {
                        next_track = item.track.uri;
                        fetch(`https://api.spotify.com/v1/me/player/queue?uri=${next_track}&device_id=${deviceId}`, {
                            method: 'POST',
                            headers: {
                                Authorization: `Bearer ${this.props.access_token}`,
                                'content-type': 'application/json'
                            }
                        })
                    }
    
                    return item
                })
            } else {
                items = this.state.items.map((item, index) => {
    
                    if (index === id) {
                        return { ...item, isPlaying: true }
                    }
    
                    return item
                })
            }
        }

        this.setState({ items: items, id_played: id, next_track: next_track, state_changed: true });
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

    shouldComponentUpdate(nextProps, nextState) {
        if(nextState !== this.state || nextProps.playing !== this.props.playing || nextProps.track_uri !== this.props.track_uri)
            return true;
        return false;
    }

    pauseTrack(id) {
        let items;
        if(this.state.items.length > 1) {
        items = this.state.items.map((item, index) => {

            if (index === id) {
                return { ...item, isPlaying: false }
            }

            return item
        }) } else {
            items = this.state.items.map((item, index) => {

            if (index === id) {
                return { ...item, isPlaying: true }
            }

            return item
        })
    }

        this.setState({ items: items, state_changed: false });
        this.props.setPlaying(false);

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

    toMinutesSecond(duration) {
        const minutes = Math.floor(duration / 60000);
        const second = Math.floor((duration - minutes * 60000) / 1000);
        if (second < 10) {
            return minutes + ' min 0' + second + ' sec';
        }
        return minutes + ' min ' + second + ' sec';
    }

    componentDidMount() {
        this.getAlbum()
            .then(album => {
                if (album === null ) {
                    refreshAccessToken().then(res => res.json().then(resJson => {
                        this.props.setAccessToken(resJson.access_token);
                    }))
                } else {
                    this.setState({ isRefresh: false, album: album, items: album.tracks.items.map(item => {
                        //return { ...item, isActive: false, isPlaying: false }
                        if (item.uri === this.props.track_uri || item.uri === this.props.linked_from_uri) {
                            return { ...item, isActive: false, isPlaying: true }
                        }
                        return { ...item, isActive: false, isPlaying: false }
                    }), uri_album: album.uri,
                duration_album:  album.tracks.items.reduce((duration, cur) => duration + cur.duration_ms, 0)
            })
                }
            })
    }

    componentDidUpdate(prevProps, prevState) {
        // if (this.state.isRefresh) {
        //     this.getAlbum()
        //         .then(album => {
        //             this.setState({ isRefresh: false, album: album })
        //         })
        // }
        if (prevProps.track_uri !== this.props.track_uri) {
            this.setState(state => ({
                items: state.items.map((item, id) => {
                    // if(id ===0) {
                    //     if(item.isPlaying === true) {
                    //         return {...item, isPlaying: false}
                    //     }
                    //     return item
                    // }
                    if (item.uri === prevProps.track_uri || item.uri === prevProps.linked_from_uri) return { ...item, isPlaying: false };
                    else if (item.uri === this.props.track_uri || item.uri === this.props.linked_from_uri) {
                        return { ...item, isPlaying: true };
                    }

                    return item
                })
            }))
        }
    }

    toHourMinute(duration) {
        const hour = Math.floor(duration / (60000 * 60));
        const minutes = Math.floor((duration - hour * 60000 * 60) / 60000);
        return hour + ' hr ' + minutes + ' min';
    }

    render() {
        return (
            <div className="container-fluid w-100 h-100">
                <div className="row" style={{ height: '50px' }}></div>
                {
                    (this.state.album && this.state.items) && <div className="row">
                        <div className="col-md-12">
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-md-2 col-sm-3">
                                        <img src={this.state.album.images ? this.state.album.images[1].url: '/public/dvd.png'} style={{ width: '200px', height: '200px' }} alt="" />
                                    </div>
                                    <div className="col-md-4" style={{ marginLeft: '-4%' }}>
                                        <div className="row" style={{ height: '13%' }}></div>
                                        <div className="row">
                                            <div className="col-md-12 col-sm-12 text-white mt-3" >
                                                {
                                                    this.state.album.album_type.toUpperCase()
                                                }
                                            </div>
                                            <div className="col-md-12 col-sm-12 mt-2 text-white" style={{ fontWeight: 'bold' }}>
                                                <h3>
                                                    {
                                                        this.state.album.name
                                                    }
                                                </h3>
                                            </div>
                                            <div className="col-md-12 col-sm-12 text-white mt-2">
                                                <p style={{ color: '#686e6a' }}>By {
                                                    this.state.album.artists.map(artist => artist.name).join(',')
                                                } &bull; {this.state.album.tracks.total} songs, {this.toHourMinute(this.state.duration_album)}
                                                </p>
                                            </div>
                                            <div className="col-md-12 col-sm-12 mt-2">
                                                <button onClick={() => this.playAlbum(this.state.uri_album)} className="btn-small btn-green">PLAY</button>
                                            </div>
                                        </div>
                                    </div>
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
                                                    <div className="col-sm-5 col-xs-5" style={{ color: '#8c8382', marginLeft: '-70px' }}>Title</div>
                                                    <div className="col-sm-5 col-xs-5" style={{ color: '#8c8382' }}>Artist</div>
                                                    <div className="col-sm-1 col-xs-1" style={{ color: '#8c8382' }}><FontAwesomeIcon icon={faClock} /></div>
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
                                                                    (item.isPlaying && this.props.playing )? <FontAwesomeIcon icon={faPauseCircle} onClick={() => this.pauseTrack(id)} color="white" size="2x" /> :
                                                                        <FontAwesomeIcon icon={faPlayCircle} onClick={() => this.playTrack(id, item.uri)} color="white" size="2x" />
                                                                }
                                                            </div>
                                                                : <div className="col-sm-1 col-xs-1">
                                                                    {
                                                                        item.isPlaying ? <FontAwesomeIcon icon={faVolumeUp} color="white" /> : null
                                                                    }
                                                                </div>
                                                        }
                                                        <div className="col-sm-5 col-xs-5 text-white" style={{ marginLeft: '-70px' }}>
                                                            <div className="row">
                                                                <div className="col-sm-11 col-xs-11">
                                                                    {item.name}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-sm-5 col-xs-5 text-white">
                                                            {
                                                                item.artists[0].name
                                                            }
                                                        </div>
                                                        <div className="col-sm-1 col-xs-1 text-white">
                                                            {
                                                                this.toMinutesSecond(item.duration_ms)
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
                                                                        (item.isPlaying && this.props.playing) ? <FontAwesomeIcon icon={faPauseCircle} onClick={() => this.pauseTrack(id)} color="white" size="2x" /> :
                                                                            <FontAwesomeIcon icon={faPlayCircle} onClick={() => this.playTrack(id, item.uri)} color="white" size="2x" />
                                                                    }
                                                                </div>
                                                                    : <div className="col-sm-1 col-xs-1">
                                                                    </div>
                                                            }
                                                            <div className="col-sm-5 col-xs-5 text-white" style={{ marginLeft: '-70px' }}>
                                                                <div className="row">
                                                                    <div className="col-sm-11 col-xs-11">
                                                                        {item.name}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-sm-5 col-xs-5 text-white">
                                                                {
                                                                    item.artists[0].name
                                                                }
                                                            </div>
                                                            <div className="col-sm-1 col-xs-1 text-white">
                                                                {
                                                                    this.toMinutesSecond(item.duration_ms)
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
        playing: state.spotify.playing,
        position_ms: state.spotify.position_ms
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        setAccessToken: (access_token) => dispatch({type: SpotifyConstants.CHANGE_ACCESS_TOKEN, access_token: access_token}),
        setContextUri: (context_uri) => dispatch({ type: SpotifyConstants.CHANGE_CONTEXT_URI, context_uri: context_uri }),
        setPlaying: (playing) => dispatch({ type: SpotifyConstants.CHANGE_PLAYING, playing: playing }),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Album);
