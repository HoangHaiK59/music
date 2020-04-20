import React from 'react';
import { refreshAccessToken } from '../../helper/token';

export default class Album extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            album: null,
            isRefresh: false
        }
    }

    getAlbum() {
        let id = this.props.match.params.id;
        let url = `https://api.spotify.com/v1/albums/${id}`;
        let token = localStorage.getItem('token');

        return fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(res => res.json())
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
                if (album.error) {
                    refreshAccessToken().then(res => res.json().then(resJson => {
                        localStorage.setItem('token', resJson.access_token);
                        this.setState({ isRefresh: true })
                    }))
                } else {
                    this.setState({ isRefresh: false, album: album })
                }
            })
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.isRefresh) {
            this.getAlbum()
                .then(album => {
                    this.setState({ isRefresh: false, album: album })
                })
        }
    }

    render() {
        return (
            <div className="container-fluid w-100 h-100">
                {
                    this.state.album && <div className="container-fluid w-100 h-100">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="row">
                                    <div className="col-md-2">
                                        <img src={this.state.album.images ? this.state.album.images[1].url : '/public/dvd.png'} alt="" />
                                    </div>
                                    <div className="col-md-6">
                                        <div className="row">
                                            <div className="col-md-12">
                                                {
                                                    this.state.album.album_type.charAt(0).toUpperCase() + this.state.album.album_type.slice(1, this.state.album.length)
                                                }
                                            </div>
                                            <div className="col-md-12">
                                                <h5>
                                                    {
                                                        this.state.album.name
                                                    }
                                                </h5>
                                            </div>
                                            <div className="col-md-12">
                                                <div className="row">
                                                    <div className="col-md-5">
                                                        <p>
                                                            {
                                                                'By ' + this.state.album.artists.map(artist => artist.name).join(',')
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-12">
                                                <p>
                                                    {
                                                        this.state.album.release_date.slice(0, 4) + ' ' + this.state.album.total_tracks + ' songs '
                                                        + this.toMinutesSecond(this.state.album.tracks.items.map(item => item.duration_ms).reduce((duration, item) => duration + item.duration_ms))
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row"></div>
                    </div>
                }
            </div>
        )
    }
}
