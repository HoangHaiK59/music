import React from "react";
import { connect } from "react-redux";
import { SpotifyAction } from "../../store/actions/spotify.action";
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
    this.props.authen();
  };

  render() {
    return (
      <div style={{position: 'absolute', top: '10%', width: '100%', height: '1fr'}}>
        <a
          className="btn btn-primary"
          href="https://accounts.spotify.com/login?continue=https%3A%2F%2Faccounts.spotify.com%2Fauthorize%3Fscope%3Duser-read-playback-state%2Buser-read-currently-playing%2Buser-modify-playback-state%2Buser-read-private%2Buser-read-email%26response_type%3Dtoken%26redirect_uri%3Dhttp%253A%252F%252Flocalhost%253A3000%252Fhome%26state%3D34fFs29kd09%26client_id%3D7f9cbbd68daf4d19a8890769e24edd46%26show_dialog%3Dtrue"
        >
          Login
        </a>
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
