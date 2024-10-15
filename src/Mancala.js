import React from 'react';
import './mancala.css';
import Pit from './Pit.js';
import Store from './Store.js';


class Mancala extends React.Component {
    constructor(props) {
        super(props);

        this.DEFAULT_SEEDS = 3;// initial seeds to start with
        this.MAX_PITS = 6;
        this.PLAYER_1 = 0;
        this.PLAYER_2 = 1;
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
            data: { 0: player1Pits, 1: player2Pits},// array, so we can access player data by player id
            holding: 0,//{0: 0, 1: 0}// both side holds 0 seeds at the beginning
            foo: player1Pits[0]
        };
        this.moves = [];// a list of moves - data[player1Pits, player2Pits], to be displayed one at a time with setInterval
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
    getOtherPlayer() {
        let otherSide = this.state.active+1;
        if (otherSide > 1) {
            otherSide /= 2;
        }
        return otherSide;
    }
    addMove(data, seedsInHand) {
        // make new copy of move data
        //let newHolding = seedsInHand;//{0: 0, 1: 0};
    //    // let holdingCopy = Object.assign({}, this.state.holding);
        //newHolding[playerSide] = seedsInHand;
        let dataCopy = Object.assign({}, data);
        console.log('addMove', dataCopy[this.state.active][0]);

        this.moves.push({data: dataCopy, holding: seedsInHand/*newHolding*/});
    }
    // removeMove() {
    //     const aMove = this.moves.shift();
    //     // display the more
    //     this.setState({data: aMove});
    // }
    showMoves() {
        console.log('showMoves', this.moves.length);
        if (this.moves.length > 0) {
            const aMove = this.moves.shift();
            // display the more
            console.log('show a move', aMove.data[0]);
            this.setState({data: aMove.data, holding: aMove.holding});
        }

        // this.intervalRef = setInterval( ()=>{
        //     if (this.moves.length > 0) {
        //         const aMove = this.moves.shift();
        //         // display the more
        //         console.log('show a move', aMove.data[0][0]);
        //         this.setState({});
        //         this.setState({data: aMove.data, holding: aMove.holding});
        //     }
        //     if (this.moves.length === 0) {
        //         console.log('showMoves: clear', this.moves.length);
        //         clearInterval(this.intervalRef);
        //         return;
        //     }
    
        // }, 1000);
    }
    pitClicked = (data) => {
        console.log('pitClicked', this, data);
        if (data.player !== this.state.active) {// TODO: auto hide message
            this.setState({ message: 'Click on a Pit on your side.'});
            return;
        }
        this.setState({ message: ''});

        // make a copy of the player's pits
        // let dataCopy = JSON.parse(JSON.stringify(this.state.data))
        let dataCopy = Object.assign({}, this.state.data);
        console.log('compare', dataCopy === this.state.data);
        let playerPits = dataCopy[this.state.active];
        let seedsInHand = playerPits[data.idx].seeds;// seeds in in-hand
        playerPits[data.idx].seeds = 0;// pickup all - 0 out seeds in clicked pit
        // set seeds in-hand
        // let holding = seedsInHand0;//{0: 0, 1: 0};
        // holding[this.state.active] = seedsInHand;
        // add to the moves list
        console.log('compare 2', dataCopy[this.state.active]);
        this.setState({data: dataCopy});
        this.setState({foo: dataCopy[0][0]});
        // this.addMove(dataCopy, seedsInHand);
        // this.showMoves();

        let startIdx = data.idx+1;// starting pit to drop seed
        // console.log('pitClicked: player=', this.state.active, ' clicked:', data.idx, ' startIdx=', startIdx);
        // this.playTurn(dataCopy/*playerPits*/, seedsInHand, this.state.active, startIdx);
    }
    playTurn = (data, seedsInHand, playerSide, startIdx) => {
        let playerPits = data[playerSide];
        console.log('@@@playTurn, side=', playerSide, ' startIdx:',startIdx, ' seedsInHand:', seedsInHand, ' moves:', this.moves.length);
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
            //     let newHolding = {0: 0, 1: 0};
            //    // let holdingCopy = Object.assign({}, this.state.holding);
            //    newHolding[playerSide] = seedsInHand;
            //     let dataCopy = Object.assign({}, data);
            //     this.moves.push({data: dataCopy, holding: newHolding});
                // add to move data
                this.addMove(data, seedsInHand);
                console.log('-> place seed:', seedsInHand, ' pit:', playerPits[idx], ' moves:', this.moves.length);
            }
            // when seeds in-hand are empty, pickup all seeds from current pit again 
            // if (seedsInHand === 0) {
            //     seedsInHand = playerPits[idx].seeds;
            //     console.log('-> pickup seed:', seedsInHand);
            // }
            idx++;
        }
        // TODO: once finished turn, play back moves 1 by 1
        // create a copy of all pits
        // let dataCopy = Object.assign({}, this.state.data);
        // //let side = playerPits[0].player;
        // dataCopy[side] = playerPits;
        // // update state with new pits data
        // this.setState({data: dataCopy});
     
        // still have seeds in-hand, play other side of pits
        // if (seedsInHand > 0) {
        //     let otherSide = this.state.active+1;
        //     if (otherSide > 1) {
        //         otherSide /= 2;
        //     }
        //     let otherSidePits = Object.assign({}, this.state.data[otherSide]);
        //     console.log('    switch side:', ' side:', otherSide, ' seedsInHand=', seedsInHand, );
        //     this.playTurn(seedsInHand, otherSidePits, 0);
        //}
        // this.setState({holding: seedsInHand});
        this.showMoves();
    }
    // shouldComponentUpdate(prevProps, prevState) {
    //         console.log('shouldComponentUpdate');
    //         return true
    // }
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
            <div id="mancala-game">
                <div className="message player1">Message:{this.state.message}</div>
                <div className="holding-area  player1">In-Hand:{this.PLAYER_2 === this.state.active ? this.state.holding: ''}</div>
                <div>
                    <Store config={this.state.data[this.PLAYER_2][this.MAX_PITS]}/>
                    <div className="pit-container">
                        <ul>{player2UI}</ul>
                        <ul>{player1UI}</ul>
                    </div>
                    <Store config={this.state.data[this.PLAYER_1][this.MAX_PITS]}/>
                </div>
                <div className="holding-area player0">In-Hand:{this.PLAYER_1 === this.state.active ? this.state.holding: ''}</div>
                <div className="message player0">Message:{this.state.message}</div>
            </div>
            <div>{this.state.foo.seeds}</div>
        </div>
    }
}

export default Mancala;