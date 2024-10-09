import React from 'react';
import './mancala.css';
import Pit from './Pit.js';
import Store from './Store.js';


class Mancala extends React.Component {
    constructor(props) {
        super(props);

        this.state ={
            msg: '',
            data: props
        };
    }
    render() {
        const MAX_PITS = 6;
        let user1Pits = [], user2Pits = [];
        for (let i = 0; i < MAX_PITS; i++) {
            user1Pits.push(<Pit config={{user: 1, idx: i}}/>);
            user2Pits.push(<Pit config={{user: 2, idx: i}}/>);
        }
        user2Pits.reverse();
        return <div id="mancala-game">
                    <Store/>
                    <div className="pit-container">
                        <ul>{user2Pits}</ul>
                        <ul>{user1Pits}</ul>
                    </div>
                    <Store/>
                </div>;
    }
}

export default Mancala;