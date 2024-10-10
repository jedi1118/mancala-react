import React from 'react';
import './pit.css';

class Pit extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            config: props.config
        };
    }
    handlePitClick = () => {
        this.props.click(this.state.config);
    }
    
    render() {
        return <li 
            className={`pit player${this.state.config.player}`}
            ><div onClick={this.handlePitClick}>{this.state.config.seeds}</div></li>
    }
}

export default Pit;