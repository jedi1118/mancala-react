import React, { useRef, useState, useEffect } from 'react';
import './mancala.css';
import Pit from './Pit.js';
import Store from './Store.js';


function Mancala() {
    const DEFAULT_SEEDS = 3;// initial seeds to start with
    const MAX_PITS = 6;
    const PLAYER_1 = 0;
    const PLAYER_2 = 1;// computer
    const DELAY = 1000;
    let moveList = [];// a list of moves - data[player1Pits, player2Pits], to be displayed one at a time with setInterval
    let intervalRef = null;

    // this holds keys to the pits, once initialized it will never change - doesn't need to be in state
    const playerPitList = {
        [PLAYER_1]: [],
        [PLAYER_2]: []
    };// array, so we can access player data by player id
    
    let initialData = {
        active: PLAYER_1, // set active player
        message: 'Player 1 turn. Select a pit to start.',
        seedsInHand: 0// how many seeds in hand for the active/current player(the other player have no seeds in hand),
    };
    // test data
    //{"p0-0":{"player":0,"idx":0,"seeds":3,"key":"p0-0","isStore":false},"p0-1":{"player":0,"idx":1,"seeds":3,"key":"p0-1","isStore":false},"p0-2":{"player":0,"idx":2,"seeds":3,"key":"p0-2","isStore":false},"p0-3":{"player":0,"idx":3,"seeds":3,"key":"p0-3","isStore":false},"p0-4":{"player":0,"idx":4,"seeds":3,"key":"p0-4","isStore":false},"p0-5":{"player":0,"idx":5,"seeds":3,"key":"p0-5","isStore":false},"p0-6":{"player":0,"idx":6,"seeds":0,"key":"p0-6","isStore":true}}
    //{"p1-0":{"player":1,"idx":0,"seeds":3,"key":"p1-0","isStore":false},"p1-1":{"player":1,"idx":1,"seeds":3,"key":"p1-1","isStore":false},"p1-2":{"player":1,"idx":2,"seeds":3,"key":"p1-2","isStore":false},"p1-3":{"player":1,"idx":3,"seeds":3,"key":"p1-3","isStore":false},"p1-4":{"player":1,"idx":4,"seeds":3,"key":"p1-4","isStore":false},"p1-5":{"player":1,"idx":5,"seeds":3,"key":"p1-5","isStore":false},"p1-6":{"player":1,"idx":6,"seeds":0,"key":"p1-6","isStore":true}}
    
    initPlayerData(PLAYER_1);
    initPlayerData(PLAYER_2);
    
    // build the initial state data first, then call useState, otherwise too much rendering
    let [gameState, setGameState] = useState(initialData);
    // useRef fixes the stale state issue caused by the closure/timeout, and multiple state updates
    let gameStateRef = useRef(gameState);
    // update ref
    useEffect(() => {
        gameStateRef.current = gameState;  // Keep the ref updated with the latest state
    }, [gameState]);

    // initialize pit data and add to state
    function initPlayerData(playerId){
        let i;
        // create actual pit state data, ie { 'p0-0': {...}, 'p0-1': {...}, ...}
        for (i = 0; i < MAX_PITS; i++) {
            const pitData = getPitData(playerId, i, DEFAULT_SEEDS);
            initialData[pitData.key] = pitData;
            // pit key
            playerPitList[playerId].push(pitData.key);
        }
        // store
        const storeData = getPitData(playerId, MAX_PITS, 0, true);
        initialData[storeData.key] = storeData;
        playerPitList[playerId].push(storeData.key);
    }

    // generate pit data, we will consider "store" to be a special "pit",
    // this makes coding rule easier...?
    // 1. the active player can access all pits(pits belongs to either player)
    // 2. except the store belongs to other player - check if active player id is same as store player id
    function getPitData(player, idx, seeds, isStore) {
        return {
            player: player, 
            idx: idx,
            seeds: seeds,
            key: `p${player}-${idx}`,
            isStore: isStore || false
        };
    }

    function getOtherPlayer(current) {
        return current === PLAYER_1 ? PLAYER_2 : PLAYER_1;
    }

    // @pit: pit data to update, i.e { key: 'p0-1', seeds: 5}
    // @seedsHolding: top level property in gameState.seedsInHand
    function updateGameData(pit, seedsHolding) {
        // create move data
        // TODO: likely we will not need all these data, maybe 'seeds' should be enough
        // pit data is not nested, use Object.assign to make shallow copy is safe here
        let pitCopy = { ...gameStateRef.current[pit.key]};
        pitCopy.seeds = pit.seeds;
        setGameState({
            ...gameStateRef.current,
            seedsInHand: seedsHolding,// seeds in hand
            [pit.key]: pitCopy// new data for the pit
        });
        // console.log('updateGameData', moveList[moveList.length-1]);
        return {};//newState;
    }
    function pitClicked(pit) {
        if (pit.player !== gameStateRef.current.active) {// TODO: auto hide message
            setGameState({...gameStateRef.current, message: 'Click on a Pit on your side.'});
            return;
        }
        if (pit.seeds === 0) {
            setGameState({...gameStateRef.current, message: 'Click on a Pit has seeds.' + getTurnMessage()});
            return;
        }
        setGameState({...gameStateRef.current, message: ''});

        // pickup all seeds in the pit
        // set pit to 0, and seeds in-hand value
        emptyPitAndPlay(pit.key)
    }
    function getTurnMessage(){
        return `Player ${gameStateRef.current.active === PLAYER_1 ? 1 : 2} turn`;
    }
    function emptyPitAndPlay(pitKey){
        let pit = gameStateRef.current[pitKey];
        updateGameData({key: pit.key, seeds: 0}, pit.seeds);
        // !!! NOTE: Object.assign({}, this.state) makes shallow copy, make changes on nested object will not change value in state
        // make a deep copy with: JSON.parse/JSON.stringify
        setTimeout(() => {
            let startIdx = pit.idx+1;// starting pit to drop seed
            // console.log('pitClicked: player=', pit.player, ' clicked:', pit.idx, ' startIdx=', startIdx);
            placeOneSeed(pit.player, startIdx);    
        }, DELAY);
    }

    // NOTE: this create moveList from a copy of the state data, so should not operate on this.state
    function placeOneSeed(playerSide, startIdx) {
        let myPlayerPitList = playerPitList[playerSide];
        let seedsInHand = gameStateRef.current.seedsInHand;
        // console.log('@@@placeOneSeed, side=', playerSide, ' startIdx:',startIdx, ' seedsInHand:', seedsInHand, ' moveList:', moveList.length);
        let pit = gameStateRef.current[myPlayerPitList[startIdx]];
        // pit is a store and belongs to other side, change side and move to next pit
        if (pit.isStore && playerSide !== gameStateRef.current.active) {
            placeOneSeed(gameStateRef.current.active, 0);
            return;
        }

        // try drop seed 1 by 1 into active player pits(including store)
        if (seedsInHand > 0) {
            // drop seed if:
            // 1. not a store - any pit
            // 2. a store, and belong to active player
            // TODO: create steps for each pit change, then play it back with a delay
            if (!pit.isStore || (pit.isStore && pit.player === gameStateRef.current.active)) {
                let seeds = pit.seeds+1;
                seedsInHand--;
                // add to moveList data
                // add a seed to the pit/store
                updateGameData({ key: pit.key, seeds: seeds}, seedsInHand);
                // if more seeds in hand, call the function recursively
                setTimeout(function() {
                    //   console.log(gameState, seeds);
                    if (seedsInHand === 0){
                        if (pit.isStore){
                            if(pit.player === gameStateRef.current.active) {
                                console.log("Ended in a Store, play again");
                                setGameState({...gameStateRef.current, 
                                    message: getTurnMessage() +' Select a pit to start.'
                                });
                                return;
                            } else {
                                console.log("@@@@@ other player's store!!!!!");
                            }
                        }
                        if (seeds === 1) {// dropped last seed into empty pit -> end turn
                            console.log("End of turn");
                            let otherPlayer = getOtherPlayer(gameStateRef.current.active);
                            setGameState({...gameStateRef.current, 
                                active: otherPlayer,
                                message: getTurnMessage() + ' Select a pit to start.'
                            });
                        } else {
                            // pickup all seeds in the pit
                            emptyPitAndPlay(pit.key);
                        }
                    } else if (seedsInHand > 0){
                        startIdx++;
                        if(startIdx > MAX_PITS) {
                            startIdx = 0;
                            playerSide = getOtherPlayer(pit.player);
                        }
                        placeOneSeed(playerSide, startIdx);
                    } else {
                        console.log('???? condition?');
                    }
                }, DELAY);
            // console.log('-> place seed:', seedsInHand, ' pit:', pit, ' moveList:', this.moveList[this.moveList.length-1]);
            }
        } else {
            console.log('@@@@ no more seeds');
        }
        // console.log('-> at end of pits: in-hand', seedsInHand, ' next idx:', startIdx);
    }

    // shouldComponentUpdate(prevProps, prevState) {
    //         console.log('shouldComponentUpdate');
    //         return true
    // }
    // console.log('gameState====', gameState);
    
        // generate UI components
        let player1UI = [], player2UI = [], i;
        const p1pit = playerPitList[PLAYER_1];
        const p2pit = playerPitList[PLAYER_2];
        // console.log('render p1pit', p1pit, p2pit, this.state);

        for (i = 0; i < MAX_PITS; i++) {
            // player 1
            let p1key = p1pit[i];
            player1UI.push(<Pit key={p1key} config={gameState[p1key]} click={pitClicked}/>);
            // console.log('render player1UI', p1key, gameState[p1key]);

            // player 2
            let p2key = p2pit[i];
            player2UI.push(<Pit key={p2key} config={gameState[p2key]} click={pitClicked}/>);
            // console.log('render player2UI', p2key, gameState[p2key]);
        }
        player2UI.reverse();
        const store1Key = p1pit[i];
        const store2Key = p2pit[i];
        // console.log('render', store1Key, this.state[store1Key]);
        // pit order goes counter clockwise, need to reverse the other side
        return (<div>
            <div id="mancala-game">
                <div className="player1 info">
                    <div className="message">Message:<br/>{gameState.message}</div>
                    <div className="holding-area">In-Hand:{PLAYER_2 === gameState.active ? gameState.seedsInHand: ''}</div>    
                </div>            
                <div className="player1 label"><div>Player 2</div></div>
                <div>
                    <Store config={gameState[store2Key]}/>
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
                    <Store config={gameState[store1Key]}/>
                </div>
                <div className="player0 label"><div>Player 1</div></div>
                <div className="player0 info">
                    <div className="holding-area">In-Hand:{PLAYER_1 === gameState.active ? gameState.seedsInHand: ''}</div>
                    <div className="message">Message:<br/>{gameState.message}</div>
                </div>
            </div>
        </div>
    )
}

export default Mancala;