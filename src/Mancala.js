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
            active: 0, // set active player
            message: '',
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
    pitClicked = (data) =>{
        console.log('pit', this, data);
        if (data.player !== this.state.active) {// TODO: auto hide message
            this.setState({ message: 'Click on a Pit on your side.'});
            return;
        }
        this.setState({ message: ''});

        // make a copy of the player's pits
        let playerPits = Object.assign([], this.state.data[this.state.active]);
        let seedsInHand = playerPits[data.idx].seeds;// seeds in in-hand
        playerPits[data.idx].seeds = 0;// pickup all - 0 out seeds in clicked pit
        let startIdx = data.idx+1;// starting pit to drop seed
        console.log('pitClicked: player=', this.state.active, ' clicked:', data.idx, ' startIdx=', startIdx);
        this.playMove(seedsInHand, playerPits, startIdx);
    }
    playMove = (seedsInHand, playerPits, startIdx) => {
        console.log('@@@playMove, side=', playerPits[0].player, ' seedsInHand:', seedsInHand);
        // try drop seed 1 by 1 into active player pits(including store)
        let idx = startIdx;
        while (seedsInHand > 0 && idx < playerPits.length) {
            // drop seed if:
            // 1. not a store - any pit
            // 2. a store, and belong to active player
            // TODO: create steps for each pit change, then play it back with a delay
            if (!playerPits[idx].isStore || (playerPits[idx].isStore && playerPits[idx].player === this.state.active)) {
                playerPits[idx].seeds++;
                seedsInHand--;
                console.log('-> place seed:', seedsInHand, ' pit:', playerPits[idx]);
            }
            // when seeds in-hand are empty, pickup all seeds from current pit again 
            // if (seedsInHand === 0) {
            //     seedsInHand = playerPits[idx].seeds;
            //     console.log('-> pickup seed:', seedsInHand);
            // }
            idx++;
        }
        // create a copy of all pits
        let dataCopy = Object.assign([], this.state.data);
        let side = playerPits[0].player;
        dataCopy[side] = playerPits;
        // update state with new pits data
        this.setState({data: dataCopy});
     
        // still have seeds in-hand, play other side of pits
        if (seedsInHand > 0) {
            let otherPlayer = this.state.active+1;
            if (otherPlayer > 1) {
                otherPlayer /= 2;
            }
            let otherPlayerPits = Object.assign([], this.state.data[otherPlayer]);
            console.log('    switch side:', ' side:', otherPlayer, ' seedsInHand=', seedsInHand, );
            this.playMove(seedsInHand, otherPlayerPits, 0);
        }
    }
    render() {
        // generate UI components
        let player1UI = [], player2UI = [];
        for (let i = 0; i < this.MAX_PITS; i++) {
            // player 1
            let p1pit = this.state.data[0][i];
            player1UI.push(<Pit key={`${p1pit.player}.${p1pit.idx}`} config={p1pit} click={this.pitClicked}/>);
            // player 2
            let p2pit = this.state.data[1][i];
            player2UI.push(<Pit key={`${p2pit.player}.${p2pit.idx}`} config={p2pit} click={this.pitClicked}/>);
        }
        player2UI.reverse();
        // pit order goes counter clockwise, need to reverse the other side
        return <div>
                            <div>holding area</div>
            <div id="mancala-game">
                    <Store config={this.state.data[1][this.MAX_PITS]}/>
                    <div className="pit-container">
                        <ul>{player2UI}</ul>
                        <ul>{player1UI}</ul>
                    </div>
                    <Store config={this.state.data[0][this.MAX_PITS]}/>
                </div>
                <div>holding area</div>
                <div id="message">Message:{this.state.message}</div>
                </div>;
    }
}

export default Mancala;