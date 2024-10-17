import React from 'react';
import './pit.css';

class Pit extends React.Component {
    constructor(props) {
        super(props);
        // may not need this
        this.state = {
            config: props.config
        };
    }
    handlePitClick = () => {
        this.props.click(this.state.config);
    }
    // componentDidUpdate(prevProps, prevState) {
    //     console.log('###############', prevProps, prevState);
    // }
    shouldComponentUpdate(prevProps, prevState) {
        if (prevProps.config.seeds !== this.props.config.seeds) {
            console.log('need update');
            return true;
        } else {
            return false;
        }
    }
    render() {
        return <li 
            className={`pit player${this.props.config.player}`}
            ><div id={this.props.config.key} onClick={this.handlePitClick}>{this.props.config.seeds}</div></li>
    }
}

export default Pit;