import React from 'react';

export const Navbar = ({isShow, ...props}) => {
    const handleLogout = () => {
        const url = 'https://www.spotify.com/logout/'                                                                                                                                                                                                                                                                               
        const spotifyLogoutWindow = window.open(url, 'Spotify Logout', 'width=700,height=500,top=40,left=40')                                                                                                
        setTimeout(() => spotifyLogoutWindow.close(), 2000);
        let state = JSON.parse(localStorage.getItem('state'));
        state.spotify.access_token = '';
        localStorage.setItem('state', JSON.stringify(state));
        props.history.push('/');
    }
    return(
        <div className="container-fluid">
            {
                isShow && <div className="fixed-top-wrap">
                    <div className="d-flex flex-row flex-wrap justify-content-end">
                        <div className="pd-1">
                            <button className="btn btn-green" onClick={handleLogout}>Logout</button>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}