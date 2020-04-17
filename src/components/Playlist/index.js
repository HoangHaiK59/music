import React from 'react';
import { refreshAccessToken } from '../../helper/token';
import './playlist.css';

class Playlist extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: null,
            items: [],
            isRefresh: false,
            isActive: false
        }
    }

    getPlaylist() {
        let id = this.props.match.params.id;
        let url = `https://api.spotify.com/v1/playlists/${id}`;
        let token = localStorage.getItem('token');

        return fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
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

    componentDidMount() {
        this.getPlaylist()
            .then(data => {
                if (data.error) {
                    refreshAccessToken().then(res => res.json().then(resJson => {
                        localStorage.setItem('token', resJson.access_token);
                        this.setState({ isRefresh: true });
                    }))
                } else {
                    this.setState({ isRefresh: false, data: data, items: data.tracks.items })
                }
            });

        
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.isRefresh) {
            this.getPlaylist()
                .then(data => {
                    this.setState({ data: data, isRefresh: false, items: data.tracks.items })
                })
        }
    }

    render() {
        console.log(this.state.items);
        return (
            <div className="container-fluid">
                {
                    (this.state.data&&this.state.items) && <div className="row">
                        <div className="col-md-4">
                            <div></div>
                        </div>
                        <div className="col-md-8">
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-md-12" style={{ maxHeight: '900px', overflowY: 'scroll' }}>
                                        <div className="d-flex flex-column justify-content-start">
                                            {
                                                this.state.items.map(item => ({...item, isActive: false})).map((item, id) => <div key={id} 
                                                onMouseEnter={() => this.mouseMove(id)}
                                                onMouseLeave={() => this.mouseLeave(id)}
                                                className="track">
                                                    <div className="row">
                                                        {
                                                            item.isActive ? <div className="col-md-1">
                                                                active
                                                            </div>: <div className="col-md-1">img</div>   
                                                        }
                                                        <div className="col-md-6 text-white">
                                                            {item.track.name}
                                                        </div>
                                                        <div className="col-md-3">
                                                        </div>
                                                    </div>
                                                </div>)
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

export default Playlist;