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
        // console.log('store', this.state.config.player);
        return <div id={this.props.config.key} className={`store player${this.props.config.player}`}>{this.props.config.seeds}</div>
    }
}

export default Store;