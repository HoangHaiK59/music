import React from 'react';
import { refreshAccessToken } from '../../helper/token';
import './playlist.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlayCircle, faHeart } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

class Playlist extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: null,
            items: [],
            isRefresh: false,
            uris: [],
            uri_playlist: ''
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

    toMinutesSecond(duration) {
        const minutes = Math.floor(duration / 60000);
        const second = Math.floor((duration - minutes * 60000) / 1000);
        if (second < 10) {
          return minutes + ':0' + second;
        }
        return minutes + ':' + second;
    }

    playPlaylist(uri) {
      let token = localStorage.getItem('token');
      const { uris }= this.state;
      fetch('https://api.spotify.com/v1/me/player/play', {
          method: 'PUT',
          headers: {
              Authorization: `Bearer ${token}`
          },
          body: {
            context_uri: uri,
            uris: uris,

          }
      }).then(res => res.json()); 
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
                    this.setState({ isRefresh: false, data: data, items: data.tracks.items.map((item) => ({...item, isActive: false})), 
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
                    this.setState({ data: data, isRefresh: false, items: data.tracks.items.map(item => ({...item, isActive: false})),
                    uris:  data.tracks.items.map(item => item.track.uri),
                    uri_playlist: data.uri })
                })
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
                                                this.state.items.map((item, id) => <div key={id} 
                                                onMouseMove={() => this.mouseMove(id)}
                                                onMouseLeave={() => this.mouseLeave(id)}
                                                className="track">
                                                    <div className="row mt-3">
                                                        {
                                                            item.isActive? <div className="col-md-1">
                                                                <FontAwesomeIcon icon={faPlayCircle} color="white" size="2x" />
                                                            </div>
                                                            : <div className="col-md-1"></div>   
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

export default Playlist;