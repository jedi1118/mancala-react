import React from 'react';
import './store.css';

class Store extends React.Component {
    constructor(props) {
        super(props);

        this.state ={
            config: props.config
        };
    }
    render() {
        console.log('store', this.state.config.player);
        return <div className={`store player${this.state.config.player}`}>{this.state.config.seeds}</div>
    }
}

export default Store;