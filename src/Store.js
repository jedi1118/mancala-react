import React from 'react';
import './store.css';

function Store({config}) {
    return (
        // console.log('store', this.state.config.player);
        <div id={config.key} className={`store player${config.player}`}><div>{config.seeds}<span>{config.key}</span></div></div>
    )
}

export default Store;