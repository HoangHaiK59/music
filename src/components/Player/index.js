import React from 'react';
import { refreshAccessToken } from '../../helper/token';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faDesktop, faMobile, faForward, faBackward, faPlay, faPause, faRandom } from '@fortawesome/free-solid-svg-icons';
import { Repeat } from 'react-feather';
import { SpotifyConstants } from '../../store/constants';
import { connect } from 'react-redux';
import  Progress  from '../Progress';
import './player.css';
var moment = require('moment');

class Player extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: null,
            id: '',
            track: null,
            playlists: null,
            deviceId: "",
            loggedIn: false,
            error: "",
            trackName: "Track Name",
            artistName: "Artist Name",
            albumName: "Album Name",
            playing: false,
            position: 0,
            duration: 1,
            device_info: null,
            track_uri: '',
            activePlaybackbar: false,
        };
    }


    onStateChanged(state) {
        // only update if we got a real state
        if (state !== null) {
            const {
                current_track: currentTrack
            } = state.track_window;
            console.log(state)
            const playing = !state.paused;
            if(playing === false) {
                this.props.setChangePlaying(playing);
            }
            const trackName = currentTrack.name;
            const albumName = currentTrack.album.name;
            const duration =  currentTrack.duration_ms;
            const id = currentTrack.id;
            const track_uri = currentTrack.uri;
            const linked_from_uri = currentTrack.linked_from_uri;
            if(track_uri === this.props.track_uri || track_uri === this.props.linked_from_uri) {
                this.props.setRepeat(true);
            }
            if(this.props.track_uri !== track_uri || track_uri !== this.props.linked_from_uri)
            {
                this.props.setTrackUri(track_uri, linked_from_uri)
            }
            const artistName = currentTrack.artists
                .map(artist => artist.name)
                .join(", ");
            const position = state.position;
            this.props.setPosition(position);
            this.setState({
                id,
                duration,
                trackName,
                albumName,
                artistName,
                playing,
                track_uri, 
                position
            });
        } else {
            // state was null, user might have swapped to another device
            this.setState({ error: "Looks like you might have swapped to another device?" });
        }
    }

    createEventHandlers() {
        // problem setting up the player
        this.player.on('initialization_error', e => { console.error(e); });
        // problem authenticating the user.
        // either the token was invalid in the first place,
        // or it expired (it lasts one hour)
        this.player.on('authentication_error', e => {
            console.error(e);
            // refreshAccessToken().then(res => res.json().then(resJSON => {
            //     localStorage.setItem('token', resJSON.access_token);
            //     this.setState({token: resJSON.access_token});
            //    // this.playerCheckInterval = setInterval(() => this.checkForPlayer(), 1000);
            // }))
            this.setState({ loggedIn: false });
        });
        // currently only premium accounts can use the API
        this.player.on('account_error', e => { console.error(e); });
        // loading/playing the track failed for some reason
        this.player.on('playback_error', e => { console.error(e); });

        // Playback status updates
        this.player.on('player_state_changed', state => this.onStateChanged(state));

        // Ready
        this.player.on('ready', async data => {
            let { device_id } = data;
            console.log("Let the music play on!");
            // set the deviceId variable, then let's try
            // to swap music playback to *our* player!
            await this.setState({ deviceId: device_id });
            this.transferPlaybackHere();
        });
    }

    checkForPlayer() {
        const { access_token } = this.props;
        if(access_token === undefined) return;

        // if the Spotify SDK has loaded
        if (window.Spotify !== null) {
            // cancel the interval
            clearInterval(this.playerCheckInterval);
            // create a new player
            this.player = new window.Spotify.Player({
                name: "Hai's Spotify Player",
                getOAuthToken: cb => { cb(access_token); },
            });
            // set up the player's event handlers
            this.createEventHandlers();

            // finally, connect!
            this.player.connect();
        }
    }

    onPrevClick() {
        this.player.previousTrack();
        this.setState(({playing: true}));
        this.props.setChangePlaying(true);
    }

    onPlayClick() {
        this.player.togglePlay();
        let playing = this.state.playing;
        this.setState(state => ({playing: !state.playing}))
        this.props.setChangePlaying(!playing);
    }

    onNextClick() {
        this.player.nextTrack();
        this.setState(({playing: true}));
        this.props.setChangePlaying(true);
    }

    transferPlaybackHere() {
        const { deviceId } = this.state;
        const {access_token} = this.props;
        localStorage.setItem('deviceId', deviceId);
        // https://beta.developer.spotify.com/documentation/web-api/reference/player/transfer-a-users-playback/
        fetch("https://api.spotify.com/v1/me/player", {
            method: "PUT",
            headers: {
                authorization: `Bearer ${access_token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "device_ids": [deviceId],
                // true: start playing music if it was paused on the other device
                // false: paused if paused on other device, start playing music otherwise
                "play": false,
            }),
        });
    }

    onMouseMove() {
        this.setState({activePlaybackbar: true});
    }

    onMouseLeave() {
        this.setState({activePlaybackbar: false}); 
    }

    getDeviceInfo() {
        return fetch(`https://api.spotify.com/v1/me/player/devices`,
            {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer ' + this.props.access_token
                }
            },

        ).then(res => res.json());
    }

    getTrackCurrent = () => {
        let url = `https://api.spotify.com/v1/tracks/${this.state.id}`
        return fetch(url,
            {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer ' + this.props.access_token
                }
            },

        ).then(res => res.json());
    }

    componentDidMount() {
        if(this.props.access_token !== undefined) {
        this.getDeviceInfo().then(data => {
            if(data.error) {
                refreshAccessToken().then(res => res.json().then(resP => {
                    this.props.setAccessToken(resP.access_token)
                }))
            } else {
                this.setState({device_info: data.devices})
            }
        })
    }
        this.playerCheckInterval = setInterval(() => this.checkForPlayer(), 1000);
    }

    componentDidUpdate(prevProps, prevState) {
        if( prevProps.access_token !== this.props.access_token) {
            clearInterval(this.playerCheckInterval);

            this.playerCheckInterval = setInterval(() => this.checkForPlayer(), 1000);
            this.getDeviceInfo().then(data => {
                if(data.error) {
                    refreshAccessToken().then(res => res.json().then(resP => {
                        this.props.setAccessToken(resP.access_token)
                    }))
                } else {
                    this.setState({device_info: data.devices})
                }
            })
        }
        if (prevState.id !== this.state.id ) {
            this.getTrackCurrent().then(data => { 
                if(data.error) {
                    refreshAccessToken().then(res => res.json().then(resP => {
                        this.props.setAccessToken(resP.access_token)
                    }))
                }
                this.setState({track: data})
            }
            )

            this.getDeviceInfo().then(data => {
                if(data.error) {
                    refreshAccessToken().then(res => res.json().then(resP => {
                        this.props.setAccessToken(resP.access_token)
                    }))
                } else {
                    this.setState({device_info: data.devices})
                }
            })
        }
    }

    componentWillUnmount() {
        clearInterval(this.playerCheckInterval);
    }

    render() {
        return (
            <div className="fixed-bottom player-container">
                <div className="container-fluid position-relative">
                    {
                        (this.state.track && this.state.track.album && this.state.device_info) && <div className="row">
                            <div className="col-md-4">
                                <div className="row">
                                    <div className="col-md-2">
                                        <img src={this.state.track.album !== null ? this.state.track.album.images['2'].url: '/public/dvd.png'} alt="" />
                                    </div>
                                    <div className="col-md-3">
                                        <div className="row">
                                            <div className="col-md-12">
                                                <p>{this.state.track.name}</p>
                                            </div>
                                            <div className="col-md-12">
                                                <p>{this.state.track.artists.map((artist) => artist.name).join(',')}</p>
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
                                                    // this.state.device_info!==undefined? this.state.device_info['0'].type === 'Computer' ? <FontAwesomeIcon icon={faDesktop} color="white" />
                                                    //      : <FontAwesomeIcon icon={faMobile} color="white" />: null
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
                                                        <FontAwesomeIcon icon={faBackward} onClick={() => this.onPrevClick()} color="white" />
                                                    </div>
                                                    <div className="col-md-2">
                                                        {
                                                            this.state.playing ? <FontAwesomeIcon icon={faPause} onClick={() => this.onPlayClick()} color="white" /> :
                                                                <FontAwesomeIcon icon={faPlay} onClick={() => this.onPlayClick()} color="white" />
                                                        }
                                                    </div>
                                                    <div className="col-md-2">
                                                        <FontAwesomeIcon icon={faForward} onClick={() => this.onNextClick()} color="white" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <Progress 
                                        duration={this.state.duration} 
                                        id={ this.state.id }
                                        position = {this.state.position}
                                        context_uri = {this.props.context_uri}
                                        repeat_track = {this.props.repeat_track}
                                        />
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
        access_token: state.spotify.access_token,
        context_uri: state.spotify.context_uri,
        track_uri: state.spotify.track_uri,
        linked_from_uri: state.spotify.linked_from_uri,
        repeat_track: state.spotify.repeat_track
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        setRefreshAction: () => {
            dispatch({ type: SpotifyConstants.REFRESH_TOKEN })
        },
        setTrackUri: (uri, linked_from_uri) => {
            dispatch({type: SpotifyConstants.CHANGE_TRACK_URI, track_uri: uri, linked_from_uri: linked_from_uri})
        },
        setChangePlaying: (playing) => {
            dispatch({type: SpotifyConstants.CHANGE_PLAYING, playing: playing})
        },
        setAccessToken: (access_token) => dispatch({type: SpotifyConstants.CHANGE_ACCESS_TOKEN, access_token: access_token}),
        setRepeat: (repeat_track) => dispatch({type: SpotifyConstants.REPEAT_TRACK, repeat_track: repeat_track}),
        setPosition: position_ms => dispatch({type: SpotifyConstants.POSITION_MS, position_ms: position_ms})
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Player);