import React from 'react';
import './pit.css';

class Pit extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            config: props.config
        };
        console.log('1@@@', this.state.config);
    }
    render() {
        return <li className={`pit player${this.state.config.player}`}><div>{JSON.stringify(this.state.config)}</div></li>
    }
}

export default Pit;