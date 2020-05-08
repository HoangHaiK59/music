import React from "react";
import { connect } from "react-redux";
import { refreshAccessToken } from "../../helper/token";
import { SpotifyConstants } from "../../store/constants";
import hash from '../../helper/hash';
import './music.css';
import { Link } from "react-router-dom";
import { actions } from "../../store/actions/spotify.action";

class Music extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      playlists: null,
      access_token: ''
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

  componentDidMount() {

    let access_token = hash.access_token;
    let refresh_token = hash.refresh_token;
    if (access_token && refresh_token) {
      this.props.setAccessToken(access_token);
      this.getCurrentsUserPlaylists(access_token)
      .then(data => {
        if(data !== null)
        this.setState({access_token: access_token, playlists: data})
      })
      localStorage.setItem('refresh_token', refresh_token);
      window.location.hash="";
    } else {
      actions.getAcessToken().then(result => result.docs.forEach(doc => {
        //this.setState({access_token: doc.data().access_token})
        this.getCurrentsUserPlaylists(doc.data().access_token)
        .then(data => {
          if(data !== null)
          this.setState({access_token: doc.data().access_token, playlists: data})
        })
      }
      ))
    }
    
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   if(nextState.access_token !== this.state.access_token)
  //     return true;
  //   return false;
  // }

  componentDidUpdate(prevProps, prevState) {
    // this.getCurrentsUserPlaylists('')
    // .then(data => data !== null? this.setState({playlists: data}): refreshAccessToken().then(res => res.json().then(resp => this.props.setAccessToken(resp.access_token))))
  }

  render() {
    console.log(this.state)
    return <div className="container-fluid position-relative">
    <div className="intro-container"></div>
      {
        this.state.playlists && <div className="playlists-container">
          <div className="row w-100">
            <div className="d-flex flex-row flex-wrap justify-content-start">
              {
                this.state.playlists.items.map((item, id) => <div className="pd-2 mr-2" key={id}>
                  <div className="d-flex flex-column justify-content-start">
                    <img src={item.images['0'].url} style={{width: 200, height:200}} alt=""/>
                    <Link to={`/playlists/${item.id}`} title={item.description} className="text-white card-title text-decoration-none">{item.name}</Link>
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
    access_token: state.spotify.access_token
  }
}

const mapDispatch = (dispatch) => {
  return {
    setAccessToken: (access_token) => dispatch({type: SpotifyConstants.CHANGE_ACCESS_TOKEN, access_token: access_token})
  }
}

export default connect(mapState, mapDispatch)(Music);
