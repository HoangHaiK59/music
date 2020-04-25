import React from 'react';
import { Switch, Route } from 'react-router-dom';
import PublicRoute from '../route/public';
import PrivateRoute from '../route/private';
import Authen from '../components/Authen';
import Music from '../components/Music';
import { Navbar } from '../components/Navbar';
import Search from '../components/Search';
import Player from '../components/Player';
import Playlist from '../components/Playlist';
import Album from '../components/Album';

export const SpotifyContainer = () => {
    return (
        <div className="spotify-container" style={{backgroundColor: ''}}>
        <Route render={(props) => <Navbar isShow={localStorage.getItem('authenticate')? true: false} />}/>
            <Switch>
                <Route exact path="/" render={(props) => <Authen {...props} />}/>
                <Route path="/home" render={(props) => <Music {...props} />}/>
                <Route path="/search" render={(props) => <Search {...props} />}/>
                <Route exact path="/playlists/:id" render={(props) => <Playlist {...props} />}/>
                <Route exact path="/album/:id" render={(props) => <Album {...props} />}/>
            </Switch>
        {
            JSON.parse(localStorage.getItem('state')).spotify.access_token !== ''? <Route render={(props) => <Player {...props} />}/>: null 
        }
        </div>
    )
}