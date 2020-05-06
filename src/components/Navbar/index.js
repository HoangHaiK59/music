import React, { useState, useEffect } from 'react';
import { SpotifyConstants } from '../../store/constants';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUser } from '@fortawesome/free-solid-svg-icons';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import { DropdownButton, Dropdown, Button } from 'react-bootstrap';
import { refreshAccessToken } from '../../helper/token';
import { Link } from 'react-router-dom';

const useFetching = (token) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState('');

    useEffect(() => {
        fetch('https://api.spotify.com/v1/me', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => res.status === 200 ? res.json().then(user => setUser(user)) :
                refreshAccessToken().then(resP => resP.json().then(resJ => setAccessToken(resJ.access_token))))
    }, [token])

    return { user, accessToken }
}

const Navbar = ({ isShow, ...props }) => {

    const { user, accessToken } = useFetching(props.access_token);

    if (accessToken !== '') {
        props.setAccessToken(accessToken);
    } else {
        props.setUser(user);
    }

    const handleLogout = () => {
        // const url = 'https://www.spotify.com/logout/'                                                                                                                                                                                                                                                                               
        // const spotifyLogoutWindow = window.open(url, 'Spotify Logout', 'width=700,height=500,top=40,left=40')                                                                                                
        // setTimeout(() => spotifyLogoutWindow.close(), 2000);
        props.logout();
        localStorage.removeItem('state');
        props.history.push('/');
    }
    return (
        <div className="container-fluid">
            {
                (isShow && user) && <div className="fixed-top-wrap">
                    <div className="row">
                        <div className="col-md-1">
                            <Link to="/home"><FontAwesomeIcon title="Spotify" icon={faSpotify} size="2x" color="green"/></Link>
                        </div>
                        <div className="col-md-11">
                            <div className="d-flex flex-row flex-wrap justify-content-end">
                                <div className="pd-1 mt-2 mr-3" title="Search" style={{ cursor: 'pointer' }}>
                                    <FontAwesomeIcon icon={faSearch} color="white" onClick={() => props.history.push('/search')} />
                                </div>
                                <Dropdown title={user.display_name}>
                                    <Dropdown.Toggle className="text-white btn-dropdown" variant="" id="dropdown-basic">
                                        <FontAwesomeIcon icon={faUser} />{user.display_name}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu className="dropdown-customize">
                                        <Dropdown.Item>
                                            <Button className="btn-dropdown-item" onClick={handleLogout}>Log Out</Button>
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

const mapStateToProps = (state, ownProps) => {
    return {
        access_token: state.spotify.access_token
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        logout: () => {
            dispatch({ type: SpotifyConstants.LOGOUT })
        },
        setAccessToken: access_token => dispatch({ type: SpotifyConstants.CHANGE_ACCESS_TOKEN, access_token: access_token }),
        setUser: user => dispatch({ type: SpotifyConstants.USER, user: user })
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);