import React from 'react';
import './mancala.css';
import Pit from './Pit.js';
import Store from './Store.js';


class Mancala extends React.Component {
    constructor(props) {
        super(props);

        this.DEFAULT_SEEDS = 3;// initial seeds to start with
        this.MAX_PITS = 6;
        let player1Pits = [], player2Pits = [];
        // generate "pits"
        for (let i = 0; i < this.MAX_PITS; i++) {
            player1Pits.push(this.getPitData(0, i, this.DEFAULT_SEEDS));
            player2Pits.push(this.getPitData(1, i, this.DEFAULT_SEEDS));
        }
        // add "store" to the end
        player1Pits.push(this.getPitData(0, this.MAX_PITS, 0, true));
        player2Pits.push(this.getPitData(1, this.MAX_PITS, 0, true));

        this.state = {
            data: [player1Pits, player2Pits]// array, so we can access player data by player id
        };
    }
    // generate pit data, we will consider "store" to be a special "pit",
    // this makes coding rule easier...?
    // 1. the active player can access all pits(pits belongs to either player)
    // 2. except the store belongs to other player - check if active player id is same as store player id
    getPitData(player, idx, seeds, isStore) {
        return {
            player: player, 
            idx: idx,
            seeds: seeds,
            isStore: isStore || false
        };
    }
    render() {
        // generate UI components
        let player1UI = [], player2UI = [];
        for (let i = 0; i < this.MAX_PITS; i++) {
            player1UI.push(<Pit config={this.state.data[0][i]}/>);
            player2UI.push(<Pit config={this.state.data[1][i]}/>);
        }
        player2UI.reverse();
        // pit order goes counter clockwise, need to reverse the other side
        // this.state[1].reverse();
        return <div id="mancala-game">
                    <Store config={this.state.data[1][this.MAX_PITS]}/>
                    <div className="pit-container">
                        <ul>{player2UI}</ul>
                        <ul>{player1UI}</ul>
                    </div>
                    <Store config={this.state.data[0][this.MAX_PITS]}/>
                </div>;
    }
}

export default Mancala;