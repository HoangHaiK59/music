import React from 'react';
import './menu.css';

class ContextMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            visible: false,
            x: 0,
            y: 0
        }

        this.contextRef = React.createRef();
    }

    componentDidMount() {
        var self = this;
        document.getElementById(this.props.id).addEventListener('contextmenu', function (event) {
            event.preventDefault();
            const clickX = event.clientX;
            const clickY = event.clientY;
            self.setState({ visible: true, x: clickX, y: clickY });
        });
        document.getElementById(this.props.id).addEventListener('click', function (event) {
            if (self.contextRef.current.id === 'customcontext') {
                self.click(event.target.getAttribute('index'));
            }
            event.preventDefault();
            self.setState({ visible: false, x: 0, y: 0 });
        });
        
    }

    click(index) {
        if (this.props.items[index].callback)
            this.props.items[index].callback();
        else {
            console.log('callback not registered for the menu item')
        }
    }

    returnMenu(items) {
        var style = {
            'position': 'absolute',
            'top': `${this.state.y - 100}px`,
            'left': `${this.state.x + 5}px`
        }

        return <div className="custom-context" id="customcontext" style={style} ref={this.contextRef}>
            {
                items.map((item, index, arr) => {
                    if (arr.length - 1 === index) {
                        return <div key={index} className='custom-context-item-last' index={index}>{item.label}</div>
                    } else {
                        return <div key={index} className='custom-context-item' index={index}>{item.label}</div>
                    }
                })
            }
        </div>
    }

    render() {
        return (
            <div id="menu">
                {this.state.visible ? this.returnMenu(this.props.items) : null}
            </div>
        )
    }
}

export default ContextMenu;