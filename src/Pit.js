import React from 'react';
import './pit.css';

function Pit({config, click}) {
    // console.log('Pit=', config, click);
    // function handlePitClick() {
    //     click(config);
    // }
    // componentDidUpdate(prevProps, prevState) {
    //     console.log('###############', prevProps, prevState);
    // }
    // shouldComponentUpdate(prevProps, prevState) {
    //     if (prevProps.config.seeds !== this.props.config.seeds) {
    //         console.log('need update');
    //         return true;
    //     } else {
    //         return false;
    //     }
    // }
    return (
        <li className={`pit player${config.player}`}>
            <div id={config.key} onClick={() =>{click(config)}}>{config.seeds}</div>
        </li>
    );
}

export default Pit;