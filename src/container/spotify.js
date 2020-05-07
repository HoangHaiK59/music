import React from 'react';
import { Switch, Route } from 'react-router-dom';
// import PublicRoute from '../route/public';
// import PrivateRoute from '../route/private';
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

const SpotifyContainer = (props) => {
    const { authenticate } = props;
    return (
        <div className="spotify-container" style={{backgroundColor: ''}}>
        <Route render={(props) => <Navbar {...props} isShow={authenticate} />}/>
            <Switch>
                <Route exact path="/" render={(props) => <Authen {...props} />}/>
                <Route path="/home" render={(props) => <Music {...props} />}/>
                <Route path="/search" render={(props) => <Search {...props} />}/>
                <Route exact path="/playlists/:id" render={(props) => <Playlist {...props} />}/>
                <Route exact path="/album/:id" render={(props) => <Album {...props} />}/>
                <Route exact path="/track/:id" render={(props) => <Track {...props} />}/>
                <Route exact path="/artist/:id" render={(props) => <Artist {...props} />}/>
            </Switch>
        {
           props.authenticate ? <Route render={(props) => <Player {...props} />}/>: null 
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