import React from 'react';
import { SpotifyConstants } from '../../store/constants';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlayCircle, faPauseCircle, faVolumeUp, faClock } from '@fortawesome/free-solid-svg-icons';
import { actions } from '../../store/actions/spotify.action';

class Track extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            album: null,
            items: [],
            id_played: -1,
            next_track: '',
            uri_album: '',
            state_changed: false,
            duration_album: 0,
            access_token: ''
        };
    }

    getAlbum(access_token) {
        let id = this.props.match.params.id;
        let url = `https://api.spotify.com/v1/albums/${id}`;

        return fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        }).then(res =>res.json())
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
        let isUri = false, isLinked = false;
        for( const item of this.state.items) {
            if(item.uri === this.props.track_uri) 
                isUri = true; 
            if(item.uri === this.props.linked_from_uri) 
                isLinked = true;
        }
        !isUri  ? fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${this.state.access_token}`,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                'context_uri': uri
            })
        }): fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${this.state.access_token}`,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                'context_uri': uri,
                'offset': {'uri': isLinked ? this.props.linked_from_uri: this.props.track_uri},
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
        })): this.setState(state => ({ state_changed: !state.state_changed,items: state.items.map((item, id) => {
            if (item.uri === this.props.track_uri || item.uri === this.props.linked_from_uri) return { ...item, isPlaying: true }
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

            return { ...item, isPlaying: false };
        })



        this.setState({ items: items, state_changed: true });
        if (this.props.track_uri !== uri && this.props.linked_from_uri !== uri) {
            fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${this.state.access_token}`,
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
                    Authorization: `Bearer ${this.state.access_token}`,
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
        if (nextState !== this.state || nextProps.playing !== this.props.playing || nextProps.track_uri !== this.props.track_uri)
            return true;
        return false;
    }

    pauseTrack() {


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

    toMinutesSecond(duration) {
        const minutes = Math.floor(duration / 60000);
        const second = Math.floor((duration - minutes * 60000) / 1000);
        if (second < 10) {
            return minutes + ' min 0' + second + ' sec';
        }
        return minutes + ' min ' + second + ' sec';
    }

    componentDidMount() {

        actions.getAcessToken()
        .then(result => result.docs.forEach(doc => {
            this.getAlbum(doc.data().access_token)
            .then(album => {
                    this.setState({
                        access_token: doc.data().access_token,
                        album: album, items: album.tracks.items.map(item => {
                            //return { ...item, isActive: false, isPlaying: false }
                            if (item.uri === this.props.track_uri || item.uri === this.props.linked_from_uri) {
                                return { ...item, isActive: false, isPlaying: true }
                            }
                            return { ...item, isActive: false, isPlaying: false }
                        }), uri_album: album.uri,
                        duration_album: album.tracks.items.reduce((duration, cur) => duration + cur.duration_ms, 0)
                    })
            })
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

    componentWillUnmount() {
        clearInterval(this.interval)
    }

    componentDidUpdate(prevProps, prevState) {
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
                                        <img src={this.state.album.images ? this.state.album.images[1].url : '/public/dvd.png'} style={{ width: '200px', height: '200px' }} alt="" />
                                    </div>
                                    <div className="col-md-6" style={{ marginLeft: '-4%' }}>
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
                                                {!this.state.state_changed ? <button onClick={() => this.playAlbum(this.state.uri_album)} className="btn-small btn-green">PLAY</button>:
                                                <button onClick={() => this.pauseTrack()} className="btn-small btn-green">PAUSE</button>}
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
                                                this.state.items.map((item, id) => <div key={id}
                                                    onMouseMove={() => this.mouseMove(id)}
                                                    onMouseLeave={() => this.mouseLeave(id)}
                                                    className={`${item.isPlaying? 'track active': 'track'}`}>
                                                    <div className="row" style={{ height: '100%', paddingTop: '10px' }}>
                                                        {
                                                            item.isActive ? <div className="col-sm-1 col-xs-1">
                                                                {
                                                                    (item.isPlaying && this.props.playing) ? <FontAwesomeIcon icon={faPauseCircle} onClick={() => this.pauseTrack()} color="#c4c4be" style={{marginLeft: '5px',fontSize: '1.5rem'}} /> :
                                                                        <FontAwesomeIcon icon={faPlayCircle} onClick={() => this.playTrack(id, item.uri)} color="#c4c4be" style={{marginLeft: '5px',fontSize: '1.5rem'}} />
                                                                }
                                                            </div>
                                                                : <div className="col-sm-1 col-xs-1">
                                                                    {
                                                                        item.isPlaying ? <FontAwesomeIcon icon={faVolumeUp} color="#c4c4be" style={{marginLeft: '5px',fontSize: '1.2rem'}} /> : null
                                                                    }
                                                                </div>
                                                        }
                                                        <div className="col-sm-5 col-xs-5" style={{ marginLeft: '-70px', color: item.isPlaying ? '#4ca331': '' }}>
                                                            <div className="row">
                                                                <div className="col-sm-11 col-xs-11">
                                                                    {item.name}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-sm-5 col-xs-5" style={{ color: item.isPlaying ? '#4ca331': '' }}>
                                                            {
                                                                item.artists[0].name
                                                            }
                                                        </div>
                                                        <div className="col-sm-1 col-xs-1" style={{ color: item.isPlaying ? '#4ca331': '' }}>
                                                            {
                                                                this.toMinutesSecond(item.duration_ms)
                                                            }
                                                        </div>
                                                    </div>
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
        setAccessToken: (access_token) => dispatch({ type: SpotifyConstants.CHANGE_ACCESS_TOKEN, access_token: access_token }),
        setContextUri: (context_uri) => dispatch({ type: SpotifyConstants.CHANGE_CONTEXT_URI, context_uri: context_uri, playing: true }),
        setPlaying: (playing) => dispatch({ type: SpotifyConstants.CHANGE_PLAYING, playing: playing }),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Track);