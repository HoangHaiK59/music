import React from 'react';
import { SpotifyConstants } from '../../store/constants';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import { Dropdown, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { actions } from '../../store/actions/spotify.action';


class Navbar extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            access_token: '',
            user: null
        }

        this.handleLogout = this.handleLogout.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleLogout = () => {
        this.props.remove();
        localStorage.removeItem('state');
        this.props.history.push('/');
    }

    handleClick = () => {
        this.props.history.push('/search');
    }

    handleChange = (event) => {
        this.props.setQuery(event.target.value);
    }

    componentDidMount() {

        actions.getAcessToken()
        .then(result => result.docs.forEach(doc => {
            fetch('https://api.spotify.com/v1/me', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${doc.data().access_token}`
                }
            })
            .then(res => res.json().then(user => this.setState({access_token: doc.data().access_token ,user: user})))
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

    render() {
        return (
            <div className="container-fluid">
                {
                    (this.props.isShow && this.state.user) && <div className="fixed-top-wrap">
                        <div className="row">
                            <div className="col-md-2">

                                <div className="d-flex flex-row justify-content-start">
                                    <Link className="mt-1" to="/home"><FontAwesomeIcon title="Spotify" icon={faSpotify} size="2x" color="green" /></Link>
                                    <input
                                        style={{ height: '2rem', width: '13rem', marginTop: -7, border: 'none' }}
                                        className="ml-5"
                                        onClick={this.handleClick}
                                        id="query"
                                        type="text"
                                        value={this.props.query}
                                        onChange={this.handleChange}
                                        placeholder="Track, Artist..."
                                    />
                                </div>

                            </div>
                            <div className="col-md-10">
                                <div className="d-flex flex-row flex-wrap justify-content-end">
                                    <Dropdown title={this.state.user.display_name}>
                                        <Dropdown.Toggle className="text-white btn-dropdown" variant="" id="dropdown-basic">
                                            <FontAwesomeIcon icon={faUser} />{this.state.user.display_name}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu className="dropdown-customize">
                                            <Dropdown.Item>
                                                <Button className="btn-dropdown-item" onClick={this.handleLogout}>Log Out</Button>
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
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
        access_token: state.spotify.access_token,
        query: state.spotify.query
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        setAccessToken: access_token => dispatch({ type: SpotifyConstants.CHANGE_ACCESS_TOKEN, access_token: access_token }),
        setUser: user => dispatch({ type: SpotifyConstants.USER, user: user }),
        remove: () => dispatch(actions.logout()),
        setQuery: (query) => dispatch({ type: SpotifyConstants.QUERY, query: query })
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);