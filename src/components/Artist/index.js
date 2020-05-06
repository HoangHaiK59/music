import React from 'react';
import { SpotifyConstants } from '../../store/constants';
import { connect } from 'react-redux';
import { refreshAccessToken } from '../../helper/token';

class Artist extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tracks: [],
            artist: null
        }
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
            if(res.status !== 200) {
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
            if(res.status !== 200) {
                refreshAccessToken().then(resP => resP.json().then(resJ => this.props.setAccessToken(resJ.access_token)));
                this.getArtist();
            } else 
                return res.json()
        })
    }

    componentDidMount() {
        this.getArtist().then(artist => {
            this.getTopTracks().then(tracks => {
                this.setState({tracks: tracks, artist: artist})
            })
        })
    }

    render() {
        return (
            (this.state.artist && this.state.tracks ) && <div className="container-fluid">
                <div className="row" style={{height: '50px'}}></div>
                <div className="row" >
                    <div className="col-md-12 text-white">{this.state.artist.type.toUpperCase()}</div>
                    <div className="col-md-12">
                        <img className="rounded-circle" style={{width: 100, height: 100}} src={`${this.state.artist.images[0].url}`} alt=""/>
                    </div>
                    <div className="col-md-12">{this.state.artist.name}</div>
                    <div className="col-md-12">
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
                    <div className="col-md-8">
                        <div className="d-flex flex-column flex-wrap justify-content-start">
                            {
                                // this.state.tracks.map((track,id) => <div id={id} className="row">
                                //     {track.name}
                                // </div>)
                            }
                        </div>
                    </div>
                    <div className="col-md-4"></div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        access_token: state.spotify.access_token
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        setAccessToken: (access_token) => {
            dispatch({type: SpotifyConstants.CHANGE_ACCESS_TOKEN, access_token: access_token})
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Artist)