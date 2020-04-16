import React from "react";
import { connect } from "react-redux";
import { SpotifyAction } from "../../store/actions/spotify.action";
import { scopes } from '../../config';
class Authen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: ""
    };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick = () => {
    //this.props.authen();
    // fetch(`https%3A%2F%2Faccounts.spotify.com%2Fauthorize%3Fscope%3D${scopes.join('%20')}%26response_type%3Dcode%26redirect_uri%3Dhttp%253A%252F%252Flocalhost%253A3000%252Fhome%26state%3D34fFs29kd09%26client_id%3D7f9cbbd68daf4d19a8890769e24edd46%26show_dialog%3Dtrue`,{

    // })
    // .then(res => res.json().then(data => console.log(data)))
    this.props.authen()
  };

  render() {
    return (
      <div className="container-fluid position-relative" style={{ minHeight: '100vh' }}>
        <div style={{ position: 'absolute', color: '#fff', top: '30%', width: '100%', height: '10%', left: '48%' }}>
          <h3>Welcome</h3>
        </div>
        <div style={{ position: 'absolute', top: '40%', width: '100%', height: '50%', left: '45%' }}>
          <a
            className="btn btn-green btn-lg"
            href="http://localhost:8000/login"
          >
            LOGIN WITH SPOTIFY
        </a>
        </div>
      </div>
    );
  }
}

const mapState = state => ({
  user: state.spotify.user
});

const mapProps = dispatch => ({
  authen: () => dispatch(SpotifyAction.SpotifyAuth())
});

export default connect(
  mapState,
  mapProps
)(Authen);
