import React from 'react';
import { Switch, Route } from 'react-router-dom';
import PublicRoute from '../route/public';
import PrivateRoute from '../route/private';
import Authen from '../components/Authen';
import Music from '../components/Music';
import Navbar from '../components/Navbar';
import Search from '../components/Search';
import Player from '../components/Player';
import Playlist from '../components/Playlist';
import Album from '../components/Album';
import Track from '../components/Track';
import Artist from '../components/Artist';
import { connect } from 'react-redux';
import isAuthenticate from '../helper/token';

const SpotifyContainer = (props) => {
    return (
        <div className="spotify-container" style={{backgroundColor: ''}}>
        <Route render={(props) => <Navbar {...props} isShow={isAuthenticate()} />}/>
            <Switch>
                <PublicRoute exact path="/" component={Authen}/>
                <PrivateRoute path="/home" component={Music}/>
                <PrivateRoute path="/search" component={Search}/>
                <PrivateRoute exact path="/playlists/:id" component={Playlist}/>
                <PrivateRoute exact path="/album/:id" component={Album}/>
                <PrivateRoute exact path="/track/:id" component={Track }/>
                <PrivateRoute exact path="/artist/:id" component={Artist}/>
            </Switch>
        {
           isAuthenticate() ? <Route render={(props) => <Player {...props} />}/>: null 
        }
        </div>
    )
}

const mapStateToProps = (state, ownProps) => {
    return {
        authenticate: state.spotify.authenticate
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
    
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SpotifyContainer);