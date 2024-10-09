import React from 'react';
import './mancala.css';
import Pit from './Pit.js';
import Store from './Store.js';


class Mancala extends React.Component {
    constructor(props) {
        super(props);

        this.state ={
            data: props
        };
    }
    render() {
        const MAX_PITS = 6;
        let player1Pits = [], player2Pits = [];
        for (let i = 0; i < MAX_PITS; i++) {
            player1Pits.push(<Pit config={{player: 1, idx: i}}/>);
            player2Pits.push(<Pit config={{player: 2, idx: i}}/>);
        }
        // pit order goes counter clockwise, need to reverse the other side
        player2Pits.reverse();
        return <div id="mancala-game">
                    <Store config={{player: 2}}/>
                    <div className="pit-container">
                        <ul>{player2Pits}</ul>
                        <ul>{player1Pits}</ul>
                    </div>
                    <Store config={{player: 1}}/>
                </div>;
    }
}

export default Mancala;