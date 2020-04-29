import React from 'react';
import { SpotifyConstants } from '../../store/constants';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const Navbar = ({isShow, ...props}) => {
    const handleLogout = () => {
        const url = 'https://www.spotify.com/logout/'                                                                                                                                                                                                                                                                               
        const spotifyLogoutWindow = window.open(url, 'Spotify Logout', 'width=700,height=500,top=40,left=40')                                                                                                
        setTimeout(() => spotifyLogoutWindow.close(), 2000);
        props.logout();
        localStorage.removeItem('state');
        props.history.push('/');
    }
    return(
        <div className="container-fluid">
            {
                isShow && <div className="fixed-top-wrap">
                    <div className="d-flex flex-row flex-wrap justify-content-end">
                        <div className="pd-1 mt-2" style={{cursor: 'pointer'}}>
                            <FontAwesomeIcon icon={faSearch} color="white" onClick={() => props.history.push('/search')}/>
                        </div>
                        <div className="pd-1">
                            <button className="btn btn-transparent text-white" onClick={handleLogout}>Logout</button>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}

const mapStateToProps = (state, ownProps) => {
    return {
        
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        logout: () => {
            dispatch({type: SpotifyConstants.LOGOUT})
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);