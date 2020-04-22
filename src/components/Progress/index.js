import React from 'react';
import './progress.css';

export class Progress extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            duration: 0,
            activePlaybackbar: false,
            width: 0,
            remain: 100,
        }
    }

    onMouseMove() {
        this.setState({activePlaybackbar: true});
    }

    onMouseLeave() {
        this.setState({activePlaybackbar: false}); 
    }

    componentDidMount() {
        
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    tick() {
        let duration = this.props.duration;
        let percent = (this.state.duration / duration) * 100;
        this.setState(state => ({duration: state.duration + 1000, width: percent, remain: 100 - percent  }))
    }

    componentDidUpdate(prevProps, prevState) {
        if(prevProps.duration !== this.props.duration && this.props.duration !== 0) {
            this.interval = setInterval(() => this.tick(), 1000)
        }
    }

    render() {
        return (
            this.state.activePlaybackbar ? <div onMouseMove={() => this.onMouseMove()} onMouseLeave={() => this.onMouseLeave()} className="playback-bar progress-bar--is-active">
            <div className="playback-bar__progress-time "></div>
            <div className="progress-bar">
                <div className="middle-align progress-bar__bg">
                    <div className="progress-bar__fg_wrapper">
                        <div className="progress-bar__fg" style={{transform: `translateX('-'+ ${this.state.remain} + '%') `}}></div>
                    </div>
                    <button className="middle-align progress-bar__slider" style={{left: this.state.width +'%'}}></button>
                </div> 
            </div>
        </div>: <div className="playback-bar" onMouseMove={() => this.onMouseMove()} onMouseLeave={() => this.onMouseLeave()}>
        <div className="playback-bar__progress-time "></div>
        <div className="progress-bar">
            <div className="middle-align progress-bar__bg">
                <div className="progress-bar__fg_wrapper">
                    <div className="progress-bar__fg" style={{transform: `translateX('-'+ ${this.state.remain} + '%')`}}></div>
                </div>
                <button className="middle-align progress-bar__slider" style={{left: this.state.width +'%'}}></button>
            </div>
        </div>
    </div>
        )
    }
}
