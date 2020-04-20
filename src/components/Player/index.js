import React from 'react';
import { refreshAccessToken } from '../../helper/token';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faDesktop, faMobile, faForward, faBackward, faPlay, faPause, faRandom } from '@fortawesome/free-solid-svg-icons';
import { Repeat } from 'react-feather';
import { SpotifyConstants } from '../../store/constants';
import { connect } from 'react-redux';
import './player.css';

let connectToPlayerTimeout;
class Player extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: null,
            id: '',
            track: null,
            playlists: null,
            isRefresh: false,
            token: localStorage.getItem('token'),
            deviceId: "",
            loggedIn: false,
            error: "",
            trackName: "Track Name",
            artistName: "Artist Name",
            albumName: "Album Name",
            playing: false,
            position: 0,
            duration: 1,

        };

        this.playerCheckInterval = setInterval(() => this.checkForPlayer(), 1000);

    }


    onStateChanged(state) {
        // only update if we got a real state
        if (state !== null) {
            const {
                current_track: currentTrack
            } = state.track_window;
            console.log(state.track_window)
            const trackName = currentTrack.name;
            const albumName = currentTrack.album.name;
            const duration =  currentTrack.duration_ms;
            const id = currentTrack.id;
            const artistName = currentTrack.artists
                .map(artist => artist.name)
                .join(", ");
            const playing = !state.paused;
            this.setState({
                id,
                duration,
                trackName,
                albumName,
                artistName,
                playing
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
            refreshAccessToken().then(res => res.json().then(resJSON => {
                localStorage.setItem('token', resJSON.access_token);
                this.setState({token: resJSON.access_token});
                this.playerCheckInterval = setInterval(() => this.checkForPlayer(), 1000);
            }))
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
        const { token } = this.state;

        // if the Spotify SDK has loaded
        if (window.Spotify !== null) {
            // cancel the interval
            clearInterval(this.playerCheckInterval);
            // create a new player
            this.player = new window.Spotify.Player({
                name: "Hai's Spotify Player",
                getOAuthToken: cb => { cb(token); },
            });
            // set up the player's event handlers
            this.createEventHandlers();

            // finally, connect!
            this.player.connect();
        }
    }

    onPrevClick() {
        this.player.previousTrack();
    }

    onPlayClick() {
        this.player.togglePlay();
    }

    onNextClick() {
        this.player.nextTrack();
    }

    transferPlaybackHere() {
        const { deviceId, token } = this.state;
        // https://beta.developer.spotify.com/documentation/web-api/reference/player/transfer-a-users-playback/
        fetch("https://api.spotify.com/v1/me/player", {
            method: "PUT",
            headers: {
                authorization: `Bearer ${token}`,
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

    getTrackCurrent = () => {
        //let url = `https://api.spotify.com/v1/me/player`;
        let url = `https://api.spotify.com/v1/tracks/${this.state.id}`
        let token = localStorage.getItem('token');
        return fetch(url,
            {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer ' + token
                }
            },

        ).then(res => res.json());
    }

    componentDidMount() {

        // this.getTrackCurrent().then(data => {
        //      if (data.error === 401) {
        //         refreshAccessToken()
        //             .then(res => res.json().then(resJson => {
        //                 localStorage.setItem('token', resJson.access_token);
        //                 this.setState({ isRefresh: true });
        //                 //this.getCurrentPlaying();
        //                 //this.props.setRefreshAction();
        //             }))
        //     } else {
        //         this.setState({ track: data });
        //     }
        // })

    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.isRefresh || prevState.id !== this.state.id) {
            this.getTrackCurrent().then(data => { 
                if(data.error) {
                    refreshAccessToken().then(res => res.json().then(resP => {
                        localStorage.setItem('token', resP.access_token);
                        this.setState({isRefresh: true});
                    }))
                }
                this.setState({track: data, isRefresh: false})
            }
            )
        }
    }

    render() {
        return (
            <div className="fixed-bottom player-container">
                <div className="container-fluid position-relative">
                    {
                        (this.state.track) && <div className="row">
                            <div className="col-md-4">
                                <div className="row">
                                    <div className="col-md-2">
                                        <img src={this.state.track.album.images['2'].url} alt="" />
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
                                                    // this.state.data.device.type === 'Computer' ? <FontAwesomeIcon icon={faDesktop} color="white" />
                                                    //     : <FontAwesomeIcon icon={faMobile} color="white" />
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
            dispatch({ type: SpotifyConstants.REFRESH_TOKEN })
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Player);