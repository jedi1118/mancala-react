import React from 'react';
import './pit.css';

class Pit extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            msg: 'a',
            config: props.config
        };
        console.log('1@@@', this.state.config);
    }
    render() {
        console.log('2@@@', this.state.config && this.state.config.msg );
        return <li className="pit"><div>Pit={JSON.stringify(this.state.config)}</div></li>
    }
}

export default Pit;