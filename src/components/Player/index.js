import React from 'react';

class Player extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null
        };
    }
    getCurrentPlaying = () => {
        let url = `https://api.spotify.com/v1/me/player`;
        let token = localStorage.getItem('token');
        fetch(url,
            {
                headers: {
                    Authorization: 'Bearer ' + token
                }
            },

        )
            .then(res => {
                if (res.status === 204) {

                } else if(res.status === 401) {
                    this.props.history.push('/')
                } else {
                    res.json().then(data => this.setState({ data: data }));
                }
            })
    }

    componentDidMount() {
        this.getCurrentPlaying();
    }

    render() {
        console.log(this.state.data)
        return (
            <div className="fixed-bottom player-container">
                <div className="container-fluid position-relative">
                    {
                        this.state.data && <div className="row">
                            <div className="col-md-4">
                                <div className="row">
                                    <div className="col-md-2">
                                        <img src={this.state.data.item.album.images['2'].url} alt="" />
                                    </div>
                                    <div className="col-md-3">
                                        <div className="row">
                                            <div className="col-md-12">
                                                <p>{this.state.data.item.album.name}</p>
                                            </div>
                                            <div className="col-md-12">
                                                <p>{this.state.data.item.artists.map((artist) => artist.name).join(',')}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">react button</div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="row">
                                            <div className="col-md-4"></div>
                                            <div className="col-md-6">
                                                <div className="d-flex flex-row justify-content-start">
                                                    <div className="">
                                                        <i className="ft-repeat"></i>
                                                    </div>
                                                    <div className="">
                                                        <i className="ft-skip-back"></i>
                                                    </div>
                                                    <div className="">
                                                        <i className="ft-pause"></i>
                                                    </div>
                                                    <div className="">
                                                        <i className="ft-skip-forward"></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        duration here
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

export default Player;