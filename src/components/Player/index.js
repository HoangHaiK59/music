import React from 'react';
import { refreshAccessToken } from '../../helper/token';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faDesktop, faMobile, faForward, faBackward, faPlay, faPause, faRandom } from '@fortawesome/free-solid-svg-icons';
import { Repeat } from 'react-feather';
import { SpotifyConstants } from '../../store/constants';
import { connect } from 'react-redux';
import './player.css';
import ScriptCache from '../../model/cache';

let connectToPlayerTimeout;
class Player extends React.Component {
    constructor(props) {
        super(props);

        new ScriptCache([
            {
                name: "https://sdk.scdn.co/spotify-player.js",
                callback: this.spotifySDKCallback
            }]);

        window.addEventListener("storage", this.authorizeSpotifyFromStorage);

        this.state = {
            data: null,
            id: '',
            track: null,
            playlists: null,
            isRefresh: false,
            onplayhead: false,
            isPlaying: false,
            loadingState: 'loading scripts',
            spotifyPlayer: undefined,
            spotifyDeviceId: '',
            spotifyPlayerReady: false
        };
        
    }
    getCurrentPlaying = () => {
        //let url = `https://api.spotify.com/v1/me/player`;
        let url = 'https://api.spotify.com/v1/me/player'
        let token = localStorage.getItem('token');
        return fetch(url,
            {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer ' + token
                }
            },

        )
    }

    getAudioTrack = (id, token) => {
        let url = `https://api.spotify.com/v1/audio-features/${id}`;
        return fetch(url,
            {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer ' + token
                }
            },

        )
    }

    spotifySDKCallback () {
        window.onSpotifyWebPlaybackSDKReady = () => {
            const {Player} = window.Spotify;
            const spotifyPlayer = Player({
                name: 'Spotify Player',
                getOAuthToken: cb => {
                    cb(localStorage.getItem('token'))
                }
            })

            // Playback status updates
            spotifyPlayer.addListener('player_state_changed', state => {
                console.log(state);
            });

            this.setState({
                loadingState: "spotify scripts loaded",
                spotifyPlayer
            });
        }
    }

    authorizeSpotifyFromStorage(event) {
        this.connectToPlayer();
    }

    connectToPlayer = () => {
        if(this.state.spotifyPlayer) {
            clearTimeout(connectToPlayerTimeout);

            // ready
            this.state.spotifyPlayer.addListener('ready', ({device_id}) => {
                console.log('Ready with Device ID', device_id);

                this.setState({
                    loadingState: "spotify player ready",
                    spotifyDeviceId: device_id,
                    spotifyPlayerReady: true
                });
            });

            // not ready
            this.state.spotifyPlayer.addListener('not_ready', ({device_id}) => {
                console.log('Device ID has gone offline', device_id);
            });

            this.state.spotifyPlayer.connect()
            .then((ev) => {
                this.setState({loadingState: "connected to player"});
            });

        } else {
            connectToPlayerTimeout = setTimeout(this.connectToPlayer.bind(this), 1000);
        }
    }

    pausePlayback = () => {
        let url = `https://api.spotify.com/v1/me/player/pause`;
        let token = localStorage.getItem('token');
        fetch(url,
            {
                method: 'PUT',
                headers: {
                    Authorization: 'Bearer ' + token
                }
            },

        )
        .then(res => {
            if(res.status === 200) {
                this.setState({isPlaying: false})
            }
        })
    }

    startPlayback = () => {
        let url = `https://api.spotify.com/v1/me/player/pause`;
        let token = localStorage.getItem('token');
        fetch(url,
            {
                method: 'PUT',
                headers: {
                    Authorization: 'Bearer ' + token
                }
            },

        )
        .then(res => {
            if(res.status === 200) {
                this.setState({isPlaying: false})
            }
        })
    }



    getPlaylists() {
        let url = `https://api.spotify.com/v1/me/playlists`;
        let token = localStorage.getItem('token');
        return fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => res.json());
    }

    componentDidMount() {

        this.getCurrentPlaying().then(res => {
            if (res.status === 204) {

            } else if(res.status === 401) {
                refreshAccessToken()
                .then(res => res.json().then(resJson => {
                    localStorage.setItem('token', resJson.access_token);
                    this.setState({isRefresh: true});
                    //this.getCurrentPlaying();
                    //this.props.setRefreshAction();
                }))
            } else {
                res.json().then(data => {
                    this.getAudioTrack(data.item.id, localStorage.getItem('token'))
                    .then(resP => resP.json().then(dataRes => {
                        this.getPlaylists()
                        .then(playlists => {
                            if(playlists.error) {

                            } else {
                                this.setState({ data: data,playlists: playlists, isPlaying: data.is_playing, track: dataRes });
                            }
                        })
                    }))
                    
                });
            }
        })

    }

    componentDidUpdate(prevProps, prevState) {
        if(this.state.isRefresh) {
            this.getCurrentPlaying().then(res => {
                    res.json().then(data => {
                        this.getAudioTrack(data.item.id, localStorage.getItem('token'))
                        .then(resP => resP.json().then(dataRes => {
                            this.getPlaylists()
                            .then(playlists => {
                                if(playlists.error) {
    
                                } else {
                                    this.setState({ data: data,playlists: playlists,isRefresh: false, isPlaying: data.is_playing, track: dataRes });
                                }
                            })
                        }))
                        
                    });
            })
        }
    }

    render() {
        return (
            <div className="fixed-bottom player-container">
                <div className="container-fluid position-relative">
                    {
                        (this.state.data && this.state.track) && <div className="row">
                            <div className="col-md-4">
                                <div className="row">
                                    <div className="col-md-2">
                                        <img src={this.state.data.item.album.images['2'].url} alt="" />
                                    </div>
                                    <div className="col-md-3">
                                        <div className="row">
                                            <div className="col-md-12">
                                                <p>{this.state.data.item.name}</p>
                                            </div>
                                            <div className="col-md-12">
                                                <p>{this.state.data.item.artists.map((artist) => artist.name).join(',')}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="row">
                                            <div className="col-md-1">
                                                <FontAwesomeIcon icon={faHeart} color="white" />
                                            </div>
                                            <div className="col-md-1">
                                                {
                                                    this.state.data.device.type === 'Computer' ? <FontAwesomeIcon icon={faDesktop} color="white" />
                                                    : <FontAwesomeIcon icon={faMobile} color="white" />
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="row">
                                            <div className="col-md-2"></div>
                                            <div className="col-md-6">
                                                <div className="row">
                                                    <div className="col-md-2">
                                                        <i className="ft-repeat"></i>
                                                    </div>
                                                    <div className="col-md-2">
                                                        <FontAwesomeIcon icon={faBackward} color="white" />
                                                    </div>
                                                    <div className="col-md-2">
                                                        {
                                                            this.state.isPlaying ? <FontAwesomeIcon icon={faPause} onClick={this.startPlayback.bind(this)} color="white" />: 
                                                            <FontAwesomeIcon icon={faPlay} onClick={this.pausePlayback.bind(this)} color="white"/>
                                                        }
                                                    </div>
                                                    <div className="col-md-2">
                                                        <FontAwesomeIcon icon={faForward} color="white" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <audio id="music" preload="true">
                                        </audio>
                                        <div>
                                            <div id="timeline">
                                                <div id="playhead"></div>
                                            </div>
                                        </div>
                                </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="row">
                                    <div className="col-md-4">Volumn</div>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </div>
        )
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

export default connect(mapStateToProps, mapDispatchToProps)(Player);