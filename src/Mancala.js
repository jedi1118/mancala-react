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
        this.moves = [];// a list of moves - data[player1Pits, player2Pits], to be displayed one at a time with setInterval

        // this holds keys to the pits, once initialized it should never change
        this.playerPitList = {
            [this.PLAYER_1]: [],
            [this.PLAYER_2]: []
        };// array, so we can access player data by player id

        this.state = {
            active: 0, // set active player
            message: '',
            holding: 0// how many seeds in hand for the active/current player(the other player have no seeds in hand)
        };
        this.initPlayerData(this.PLAYER_1);
        this.initPlayerData(this.PLAYER_2);
    }
    // initialize pit data and add to state
    initPlayerData(playerId){
        let i;
        // create actual pit state data, ie { 'p0-0': {...}, 'p0-1': {...}, ...}
        for (i = 0; i < this.MAX_PITS; i++) {
            const pitData = this.getPitData(playerId, i, this.DEFAULT_SEEDS);
            //this.setState({[pitData.key]: pitData});
            this.state[pitData.key] = pitData;
            // pit key
            this.playerPitList[playerId].push(pitData.key);
        }
        // store
        const storeData = this.getPitData(playerId, this.MAX_PITS, 0, true);
        //this.setState({[storeData.key]: storeData});
        this.state[storeData.key] = storeData;
        this.playerPitList[playerId].push(storeData.key);
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
            key: `p${player}-${idx}`,
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
    addMove(pitKey, seedsInPit, seedsInHand) {
        // create move data
        // TODO: likely we will not need all these data, maybe 'seeds' should be enough
        // pit data is not nested, use Object.assign to make shallow copy is safe here
        let pitCopy = Object.assign({}, this.state[pitKey]);
        pitCopy.seeds = seedsInPit;
        this.moves.push({
            key: pitKey,// to locate the pit
            pitData: pitCopy, // data for the pit
            holding: seedsInHand// seeds in hand
        });
        console.log('addMove', this.moves[this.moves.length-1]);
    }
    // removeMove() {
    //     const aMove = this.moves.shift();
    //     // display the more
    //     this.setState({data: aMove});
    // }
    showMoves() {
        let intervalRef = setInterval( ()=>{
            if (this.moves.length > 0) {
                const aMove = this.moves.shift();
                // display the move
                console.log('showMoves:', aMove.key, ' seeds:', aMove.pitData.seeds, ' holding:', aMove.holding);
                this.setState(() => {
                    return { [aMove.key]: aMove.pitData, holding: aMove.holding}
                });
            }
            if (this.moves.length === 0) {
                console.log('showMoves: clear', this.moves.length);
                clearInterval(intervalRef);
                return;
            }
        }, 1800);
        this.setState({intervalRef: intervalRef});
    }
    pitClicked = (pit) => {
        console.log('pitClicked', this, pit);
        if (pit.player !== this.state.active) {// TODO: auto hide message
            this.setState({ message: 'Click on a Pit on your side.'});
            return;
        }
        this.setState({ message: ''});

        // set pit to 0, and seeds in-hand value
        let seedsInHand = this.state[pit.key].seeds;// seeds in in-hand
        this.addMove(pit.key, 0, seedsInHand);
        // !!! NOTE: Object.assign({}, this.state) makes shallow copy, make changes on nested object will change value is state
        // make a deep copy with: JSON.parse/JSON.stringify
        let stateCopy = JSON.parse(JSON.stringify(this.state));
        let startIdx = pit.idx+1;// starting pit to drop seed
        console.log('pitClicked: player=', this.state.active, ' clicked:', pit.idx, ' startIdx=', startIdx);
        this.playTurn(stateCopy, seedsInHand, this.state.active, startIdx);
    }
    // NOTE: this create moves from a copy of the state data, so should not operate on this.state
    playTurn = (stateCopy, seedsInHand, playerSide, startIdx) => {
        let playerPitList = this.playerPitList[playerSide];
        console.log('@@@playTurn, side=', playerSide, ' startIdx:',startIdx, ' seedsInHand:', seedsInHand, ' moves:', this.moves.length);
        // try drop seed 1 by 1 into active player pits(including store)
        let idx = startIdx;
        while (seedsInHand > 0 && idx < playerPitList.length) {
            // drop seed if:
            // 1. not a store - any pit
            // 2. a store, and belong to active player
            // TODO: create steps for each pit change, then play it back with a delay
            let pit = stateCopy[playerPitList[idx]];
            if (!pit.isStore || (pit.isStore && pit.player === stateCopy.active)) {
                pit.seeds++;
                seedsInHand--;
                // add to moves data
                this.addMove(pit.key, pit.seeds, seedsInHand);
                // console.log('-> place seed:', seedsInHand, ' pit:', pit, ' moves:', this.moves[this.moves.length-1]);
            }
            // when seeds in-hand are empty and pit in on active plater side,
            // pickup all seeds from current pit again 
            if (seedsInHand === 0 && pit.player === stateCopy.active) {
                seedsInHand = pit.seeds;
                pit.seeds = 0;
                // add to moves data
                this.addMove(pit.key, pit.seeds, seedsInHand);
                console.log('-> pickup seed:', seedsInHand);
            }
            idx++;
        }
        console.log('-> at end of pits: in-hand', seedsInHand, ' next idx:', idx);
     
        // still have seeds in-hand, play other side of pits
        if (seedsInHand > 0) {
            const otherPlayer = this.getOtherPlayer();
            console.log('    switch side:', ' side:', otherPlayer, ' seedsInHand=', seedsInHand, );
            //start at first pit when switch side, counter clockwise
            this.playTurn(stateCopy, seedsInHand, otherPlayer, 0);
        }
        // this.setState({holding: seedsInHand});
        this.showMoves();
    }
    // shouldComponentUpdate(prevProps, prevState) {
    //         console.log('shouldComponentUpdate');
    //         return true
    // }
    render() {
        // generate UI components
        let player1UI = [], player2UI = [], i;
        const p1pit = this.playerPitList[this.PLAYER_1];
        const p2pit = this.playerPitList[this.PLAYER_2];
        // console.log('render p1pit', p1pit, p2pit, this.state);

        for (i = 0; i < this.MAX_PITS; i++) {
            // player 1
            let p1key = p1pit[i];
            player1UI.push(<Pit key={p1key} config={this.state[p1key]} click={this.pitClicked}/>);
            // console.log('render player1UI', p1key, this.state[p1key]);

            // player 2
            let p2key = p2pit[i];
            player2UI.push(<Pit key={p2key} config={this.state[p2key]} click={this.pitClicked}/>);
            // console.log('render player2UI', p2key, this.state[p2key]);
        }
        player2UI.reverse();
        const store1Key = p1pit[this.MAX_PITS];
        const store2Key = p2pit[this.MAX_PITS];

        // console.log('render', store1Key, this.state[store1Key]);
        // pit order goes counter clockwise, need to reverse the other side
        return <div>
            <div id="mancala-game">
                <div className="message player1">Message:{this.state.message}</div>
                <div className="holding-area  player1">In-Hand:{this.PLAYER_2 === this.state.active ? this.state.holding: ''}</div>
                <div>
                    <Store config={this.state[store2Key]}/>
                    <div className="pit-container">
                        {/* <ul>
                            {
                                p2pit.map((key) => (<Pit key={key} config={this.state[key]} click={this.pitClicked}/>))
                            }
                        </ul> */}
                        <ul>{player2UI}</ul>
                        <ul>{player1UI}</ul>
                        {/* <ul>
                            {
                                p1pit.map((key) => (<Pit key={key} config={this.state[key]} id={key} click={this.pitClicked}/>))
                            }
                        </ul> */}
                    </div>
                    <Store config={this.state[store1Key]}/>
                </div>
                <div className="holding-area player0">In-Hand:{this.PLAYER_1 === this.state.active ? this.state.holding: ''}</div>
                <div className="message player0">Message:{this.state.message}</div>
            </div>
        </div>
    }
}

export default Mancala;