import React from 'react';
import './pit.css';

class Pit extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            config: props.config
        };
        if (this.state.config.player === 0 && this.state.config.idx === 0) {
            console.log('#######', props);
        }
    }
    handlePitClick = () => {
        this.props.click(this.state.config);
    }
    shouldComponentUpdate(prevProps, prevState) {
        // if (this.state.config.player === 0 && this.state.config.idx === 0) {
        //     console.log('shouldComponentUpdate:prevProps:', prevProps);
        //     console.log("shouldComponentUpdate: state:", prevState.config, ' now:', this.state.config);
        //     console.log("shouldComponentUpdate: seeds:", prevState.config.seeds, ' now:', this.state.config.seeds);
        //     return true;
        // }
        if (prevState.config.seeds !== this.state.config.seeds) {
            console.log('shouldComponentUpdate');
            return true;
        } else {
            return false;
        }
    }
    render() {
        return <li 
            className={`pit player${this.state.config.player}`}
            ><div onClick={this.handlePitClick}>{this.state.config.seeds}</div></li>
    }
}

export default Pit;