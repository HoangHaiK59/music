import React from 'react';
import './progress.css';
import { SpotifyConstants } from '../../store/constants';
import { connect } from 'react-redux';
let start = 0;

class Progress extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            duration: this.props.position,
            activePlaybackbar: false,
            width: ((this.props.position/ this.props.duration) * 100),
            remain: (100 - (this.props.position/ this.props.duration) * 100),
        }
    }

    onMouseMove() {
        this.setState({activePlaybackbar: true});
    }

    onMouseLeave() {
        this.setState({activePlaybackbar: false}); 
    }

    calculateWidth() {
    
    }

    componentDidMount() {
        //this.interval = setInterval(() => this.tick(), 1000)
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    tick() {
        let duration = this.props.duration;
        let percent = (this.state.duration / duration) * 100;
        if(this.props.playing) {
        this.setState(state => ({ duration: state.duration + 1000, width: percent, remain: 100 - percent  }))
        }
    }

    toMinutesSecond(duration) {
        const minutes = Math.floor(duration / 60000);
        const second = Math.floor((duration - minutes * 60000) / 1000);
        if (second < 10) {
          return minutes + ':0' + second;
        }
        return minutes + ':' + second;
    }

    shouldComponentUpdate(nextProps, nextState) {
        if( nextProps.id !== this.props.id || nextProps.playing  ) {
            return true;
        }
        return false;
    }

    componentDidUpdate(prevProps, prevState) {
            if( this.props.id !== prevProps.id  ) {
                this.setState({duration: 0, width: 0, remain: 100});
            } 
            
            if(start === 0)
             this.interval = setInterval(() => this.tick(), 1000)

            // if(this.state.duration === this.props.duration) {
            //     duration = 0;
            //     this.setState({duration: 0, width: 0, remain: 100});
            // }

            start = start + 1;
    }

    render() {
        return (
            this.state.activePlaybackbar ? <div onMouseMove={() => this.onMouseMove()} onMouseLeave={() => this.onMouseLeave()} className="playback-bar progress-bar--is-active">
            <div className="playback-bar__progress-time text-white">{this.toMinutesSecond(this.state.duration)}</div>
            <div className="progress-bar">
                <div className="middle-align progress-bar__bg">
                    <div className="progress-bar__fg_wrapper">
                        <div className="progress-bar__fg" style={{transform: `translateX(${'-'+ this.state.remain+'%'}) `}}></div>
                    </div>
                    <button className="middle-align progress-bar__slider" style={{left: this.state.width +'%'}}></button>
                </div> 
            </div>
            <div className="playback-bar__progress-time text-white">{this.toMinutesSecond(this.props.duration)}</div>
        </div>: <div className="playback-bar" onMouseMove={() => this.onMouseMove()} onMouseLeave={() => this.onMouseLeave()}>
        <div className="playback-bar__progress-time text-white">{this.toMinutesSecond(this.state.duration)}</div>
        <div className="progress-bar">
            <div className="middle-align progress-bar__bg">
                <div className="progress-bar__fg_wrapper">
                    <div className="progress-bar__fg" style={{transform: `translateX(${'-'+ this.state.remain+'%'} )`}}></div>
                </div>
                <button className="middle-align progress-bar__slider" style={{left: this.state.width +'%'}}></button>
            </div>
        </div>
        <div className="playback-bar__progress-time text-white">{this.toMinutesSecond(this.props.duration)}</div>
    </div>
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        playing: state.spotify.playing
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Progress);