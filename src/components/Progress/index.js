import React from 'react';
import './progress.css';
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

        this.timeline = React.createRef();
        this.handle = React.createRef();
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

    handlePosition(position) {
        console.log('goto')
        let timeline =  this.timeline.getBoundingClientRect();

        let percent ;
        if(position < timeline.right) {
            percent = ((position - timeline.left)/ timeline.width).toFixed(2);
        }

        let duration = ((percent * this.props.duration).toFixed(0) - ((percent * this.props.duration).toFixed(0) % 1000));

        let width = (duration / this.props.duration) * 100;

        let remain = 100 - ((duration / this.props.duration) * 100);

        this.props.handleProgressChange(duration);

        this.setState({duration: duration, width: width, remain: remain});
    }

    mouseMove(event) {
        this.handlePosition(event.pageX)
    }

    mouseUp = (e) => {
        window.removeEventListener('mousemove', this.mouseMove);
        window.removeEventListener('mouseup', this.mouseUp);
    };
    
    mouseDown = (e) => {
        window.addEventListener('mousemove', this.mouseMove);
        window.addEventListener('mouseup', this.mouseUp);
    };

    shouldComponentUpdate(nextProps, nextState) {
        if( nextProps.id !== this.props.id || nextProps.playing || 
            nextProps.context_uri !== this.props.context_uri || 
            (nextProps.playing === false && nextProps.id !== this.props.id) ||
            nextState !== this.state) {
            return true;
        }
        return false;
    }

    componentDidUpdate(prevProps, prevState) {
            if( this.props.id !== prevProps.id || prevProps.context_uri !== this.props.context_uri || (prevProps.playing === false && prevProps.id !== this.props.id) ) {
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

    onMouseDown() {
        window.addEventListener('mouseMove', this.mouseMove, true);
    }

    onMouseUp() {
        window.removeEventListener('mouseMove', this.mouseMove, true);
    }

    render() {
        return (
            this.state.activePlaybackbar ? <div onMouseMove={() => this.onMouseMove()} onMouseLeave={() => this.onMouseLeave()} className="playback-bar progress-bar--is-active">
            <div className="playback-bar__progress-time text-white">{this.toMinutesSecond(this.state.duration)}</div>
            <div className="progress-bar">
                <div className="middle-align progress-bar__bg">
                    <div className="progress-bar__fg_wrapper" id="timeline" ref={timeline => this.timeline = timeline}
                    onClick={(event) => this.mouseMove(event)}>
                        <div className="progress-bar__fg"  style={{transform: `translateX(${'-'+ this.state.remain+'%'}) `}}></div>
                    </div>
                    <button id="handle" ref={handle => this.handle = handle} className="middle-align progress-bar__slider" style={{left: this.state.width +'%'}}></button>
                </div> 
            </div>
            <div className="playback-bar__progress-time text-white">{this.toMinutesSecond(this.props.duration)}</div>
        </div>: <div className="playback-bar" onMouseMove={() => this.onMouseMove()} onMouseLeave={() => this.onMouseLeave()}>
        <div className="playback-bar__progress-time text-white">{this.toMinutesSecond(this.state.duration)}</div>
        <div className="progress-bar">
            <div className="middle-align progress-bar__bg">
                <div className="progress-bar__fg_wrapper" id="timeline" ref={timeline => this.timeline = timeline} onClick={(event) => this.mouseMove(event)}>
                    <div className="progress-bar__fg" style={{transform: `translateX(${'-'+ this.state.remain+'%'} )`}}></div>
                </div>
                <button id="handle" ref={handle => this.handle = handle} className="middle-align progress-bar__slider" style={{left: this.state.width +'%'}}></button>
            </div>
        </div>
        <div className="playback-bar__progress-time text-white">{this.toMinutesSecond(this.props.duration)}</div>
    </div>
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        playing: state.spotify.playing,
        repeat_track: state.spotify.repeat_track
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Progress);