import React from "react";
import { connect } from "react-redux";
import { SpotifyConstants } from "../../store/constants";
import hash from '../../helper/hash';
import './music.css';
import { Link } from "react-router-dom";
import { actions } from "../../store/actions/spotify.action";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlayCircle, faVolumeUp, faPauseCircle } from "@fortawesome/free-solid-svg-icons";

class Music extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      playlists: null,
      access_token: '',
      state_changed: false
    };
  }

  getCurrentsUserPlaylists(access_token) {
    return fetch(`https://api.spotify.com/v1/me/playlists`,{
      method: 'GET',
      headers: {
        Authorization: access_token === ''? `Bearer ${this.state.access_token}`: `Bearer ${access_token}`
      }
    }).then(res => res.status===200 ? res.json(): null)
  }

  mouseMove(id) {
    const items = this.state.playlists.items.map((item, index) => {
      if(id === index) {
        return {...item, active: true}
      }
      return item
    })

    this.setState({playlists: {...this.state.playlists, items: items}})
  }

  mouseLeave(id) {
    const items = this.state.playlists.items.map((item, index) => {
      if(id === index) {
        return {...item, active: false}
      }
      return item
    })

    this.setState({playlists: {...this.state.playlists, items: items}})
  }

  playContext(id, uri) {
    const deviceId = localStorage.getItem('deviceId');
    let diff = false;
    this.props.setContextUri(uri);
    if(uri !== this.props.context_uri) {
      diff = true;
    }
    !diff ? 
    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${this.state.access_token}`
        },
        body: JSON.stringify({
            'context_uri': uri,
            'position_ms': this.props.position_ms
        })
    }): 
    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${this.state.access_token}`
        },
        body: JSON.stringify({
            'context_uri': uri
        })
    });

    const items = this.state.playlists.items.map((item, index) => {
        if(index === id) {
          return {...item, playing: true}
        }
        return {...item, playing: false}
    });

    this.setState({playlists: {...this.state.playlists, items: items}, state_changed: true})
  }

  pause() {
    this.setState({ state_changed: false });
    this.props.setPlaying(false);

    const deviceId = localStorage.getItem('deviceId');
    fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${this.state.access_token}`,
            'content-type': 'application/json'
        }
    })
}

  componentDidMount() {

    let access_token = hash.access_token;
    let refresh_token = hash.refresh_token;
    if (access_token && refresh_token) {
      this.props.setAccessToken(access_token);
      this.getCurrentsUserPlaylists(access_token)
      .then(data => {
        if(data !== null)
        this.setState({access_token: access_token, playlists: {...data, items: data.items.map((item, id) => {
          if(item.uri === this.props.context_uri) {
            return {...item, active: false, playing: true}
          }
          return {...item, playing: false, active: false}
        })}})
      })
      localStorage.setItem('refresh_token', refresh_token);
      window.location.hash="";
    } else {
      actions.getAcessToken().then(result => result.docs.forEach(doc => {
        //this.setState({access_token: doc.data().access_token})
        this.getCurrentsUserPlaylists(doc.data().access_token)
        .then(data => {
          if(data !== null)
          this.setState({access_token: doc.data().access_token, playlists: {...data, items: data.items.map((item, id) => {
            if(item.uri === this.props.context_uri) {
              return {...item, playing: true, active: false}
            }
            return {...item, playing: false, active: false}
          })}})
        })
      }
      ))
    }

    this.interval = setInterval(() => {
      actions.getAcessToken()
      .then(result => result.docs.forEach(doc => {
          if(doc.data().access_token !== this.state.access_token) {
              this.setState({access_token: doc.data().access_token})
          }
      }))
  }, 300000);
    
  }

  componentDidUpdate(prevProps, prevState) {
    if(this.props.playing !== prevProps.playing) {
      this.setState({state_changed: this.props.playing})
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  render() {
    return <div className="container-fluid position-relative">
    <div className="intro-container"></div>
      {
        this.state.playlists && <div className="playlists-container">
          <div className="row w-100">
            <div className="d-flex flex-row flex-wrap justify-content-start">
              {
                this.state.playlists.items.map((item, id) => <div className="pd-1 mr-1" 
                key={id}>
                  <div className="d-flex flex-column justify-content-start">
                    <div className="container position-relative" 
                    onMouseMove = {() => this.mouseMove(id)}
                    onMouseLeave = {() => this.mouseLeave(id)}>
                      <img src={item.images['0'].url} style={{width: 150, height:150}} alt=""/>
                      {
                        item.active ? 
                          item.playing && this.state.state_changed ? 
                          <FontAwesomeIcon className="position-absolute" onClick={() => this.pause()} icon={faPauseCircle} size="3x" color="#2eb35f" style={{top: '30%', left: '40%', zIndex: 1}}/>:
                          <FontAwesomeIcon className="position-absolute" onClick={() => this.playContext(id, item.uri)} icon={faPlayCircle} size="3x" color="#2eb35f" style={{top: '30%', left: '40%', zIndex: 1}}/>
                          :
                          item.playing ? 
                          <FontAwesomeIcon className="position-absolute" icon={faVolumeUp} size="3x" color="#2eb35f" style={{top: '30%', left: '40%', zIndex: 1}}/>: null
                      }
                    </div>
                    <div className="container-fluid">
                      <Link to={`/playlists/${item.id}`} title={item.description} className="text-white card-title text-decoration-none">{item.name}</Link>
                    </div>
                  </div>
                </div>)
              }
            </div>
          </div>
        </div>
      }
    </div>
  }
}

const mapState = (state) => {
  return {
    playing: state.spotify.playing,
    context_uri: state.spotify.context_uri,
    position_ms: state.spotify.position_ms
  }
}

const mapDispatch = (dispatch) => {
  return {
    setPlaying: playing => dispatch({type: SpotifyConstants.CHANGE_PLAYING, playing: playing}),
    setContextUri: context_uri => dispatch({type: SpotifyConstants.CHANGE_CONTEXT_URI, context_uri: context_uri, playing: true})
  }
}

export default connect(mapState, mapDispatch)(Music);
