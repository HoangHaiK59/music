import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Authen from '../components/Authen';
import Music from '../components/Music';
import { Navbar } from '../components/Navbar';
import Search from '../components/Search';
import Player from '../components/Player';

export const SpotifyContainer = () => {
    return (
        <div className="spotify-container" style={{backgroundColor: ''}}>
        <Route render={(props) => <Navbar isShow={localStorage.getItem('authenticate')? true: false} />}/>
            <Switch>
                <Route exact path="/" render={(props) => <Authen {...props} />}/>
                <Route path="/music" render={(props) => <Music {...props} />}/>
                <Route path="/home" render={(props) => <Search {...props} />}/>
            </Switch>
        <Route render={(props) => <Player {...props} />}/>
        </div>
    )
}