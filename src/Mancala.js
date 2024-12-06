import React, { useRef, useState, useEffect } from 'react';
import './mancala.css';
import Pit from './Pit.js';
import Store from './Store.js';


function Mancala() {
    const DEFAULT_SEEDS = 3;// initial seeds to start with
    const MAX_PITS = 6;
    const PLAYER_1 = 0;
    const PLAYER_2 = 1;// computer
    let moveList = [];// a list of moves - data[player1Pits, player2Pits], to be displayed one at a time with setInterval
    let intervalRef = null;

    // this holds keys to the pits, once initialized it will never change - doesn't need to be in state
    const playerPitList = {
        [PLAYER_1]: [],
        [PLAYER_2]: []
    };// array, so we can access player data by player id
    
    let initialData = {
        active: PLAYER_1, // set active player
        message: 'Player 1 turn',
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
    function addMove(pit, seedsHolding) {
        // create move data
        // TODO: likely we will not need all these data, maybe 'seeds' should be enough
        // pit data is not nested, use Object.assign to make shallow copy is safe here
        let pitCopy = { ...gameStateRef.current[pit.key]};
        pitCopy.seeds = pit.seeds;
        //Object.assign({}, gameState[pitKey]);
        // moveList.push({
        //     key: pitKey,// to locate the pit
        //     [pitKey]: pitCopy, // data for the pit
        //     seedsInHand: seedsHolding// seeds in hand
        // });
        setGameState({
            ...gameStateRef.current,
            seedsInHand: seedsHolding,// seeds in hand
            [pit.key]: pitCopy// new data for the pit
        });
        // console.log('addMove', moveList[moveList.length-1]);
        return {};//newState;
    }
    // removeMove() {
    //     const aMove = this.moveList.shift();
    //     // display the more
    //     this.setState({data: aMove});
    // }
    function showMoves() {
        /*
        intervalRef = setInterval( ()=>{
            if (moveList.length > 0) {
                const aMove = moveList.shift();
                // display the move
                console.log('showMoves:', aMove.key, ' seeds:', aMove.pitData.seeds, ' seedsInHand:', aMove.seedsInHand);
                setGameState({...gameState, [aMove.key]: aMove.pitData, seedsInHand: aMove.seedsInHand});
            }
            if (moveList.length === 0) {
                console.log('showMoves: clear', moveList.length);
                clearInterval(intervalRef);
                return;
            }
        }, 1800);
        */
    }
    function pitClicked(pit) {
        console.log('pitClicked', pit);
        if (pit.player !== gameStateRef.current.active) {// TODO: auto hide message
            setGameState({...gameStateRef.current, message: 'Click on a Pit on your side.'});
            return;
        }
        setGameState({...gameStateRef.current, message: ''});

        // pickup all seeds in the pit
        // set pit to 0, and seeds in-hand value
        emptyPitAndPlay(pit.key)
        // let seedsInHand = pit.seeds;// seeds in in-hand
        // let stateCopy = JSON.parse(JSON.stringify(gameStateRef.current));
        // addMove({key: pit.key, seeds: 0}, pit.seeds);
        // // !!! NOTE: Object.assign({}, this.state) makes shallow copy, make changes on nested object will not change value in state
        // // make a deep copy with: JSON.parse/JSON.stringify
        // setTimeout(() => {
        //     let startIdx = pit.idx+1;// starting pit to drop seed
        //     console.log('pitClicked: player=', pit.player, ' clicked:', pit.idx, ' startIdx=', startIdx);
        //     playTurn(pit.player, startIdx);    
        // }, 1000);
    }

    function emptyPitAndPlay(pitKey){
        let pit = gameStateRef.current[pitKey];
        addMove({key: pit.key, seeds: 0}, pit.seeds);
        // !!! NOTE: Object.assign({}, this.state) makes shallow copy, make changes on nested object will not change value in state
        // make a deep copy with: JSON.parse/JSON.stringify
        setTimeout(() => {
            let startIdx = pit.idx+1;// starting pit to drop seed
            console.log('pitClicked: player=', pit.player, ' clicked:', pit.idx, ' startIdx=', startIdx);
            playTurn(pit.player, startIdx);    
        }, 1000);
    }

    // NOTE: this create moveList from a copy of the state data, so should not operate on this.state
    function playTurn(playerSide, startIdx) {
        let myPlayerPitList = playerPitList[playerSide];
        let seedsInHand = gameStateRef.current.seedsInHand;
        console.log('@@@playTurn, side=', playerSide, ' startIdx:',startIdx, ' seedsInHand:', seedsInHand, ' moveList:', moveList.length);
        // try drop seed 1 by 1 into active player pits(including store)
        // let idx = startIdx;
        let pit = gameStateRef.current[myPlayerPitList[startIdx]];
        // pit is a store and belongs to other side, change siide and move to next pit
        if (pit.isStore && playerSide !== gameStateRef.current.active) {
            playTurn(gameStateRef.current.active, 0);
            return;
        }

        // let inHand = seedsInHand;
        if (seedsInHand > 0/* && idx < myPlayerPitList.length*/) {
            // drop seed if:
            // 1. not a store - any pit
            // 2. a store, and belong to active player
            // TODO: create steps for each pit change, then play it back with a delay
            // setTimeout(()=>{                
                // let pit = gameState[myPlayerPitList[idx]];
                if (!pit.isStore || (pit.isStore && pit.player === gameStateRef.current.active)) {
                    let seeds = pit.seeds+1;
                    seedsInHand--;
                    // add to moveList data
                    // add a seed to the pit/store
                    addMove({ key: pit.key, seeds: seeds}, seedsInHand);
                    // if more seeds in hand, call the function recursively
                    setTimeout(function() {
                        //   console.log(gameState, seeds);
                        if (seedsInHand === 0){//} && seeds > 1) {
                            if (seeds === 1) {// dropped seed into empty pit -> end turn
                                   console.log("End of turn"); 
                            } else {
                                emptyPitAndPlay(pit.key);
                            }
                            // pickup all seeds in the pit
                            // set pit to 0, and seeds in-hand value
                            //let seeds = data[pit.key].seeds;// seeds in in-hand
                            //addMove({ key: pit.key, seeds: 0}, seeds);
                            // setTimeout(() => {
                            //     startIdx +=1;
                            //     if(gameStateRef.current[pit.key].isStore && gameStateRef.current.active !== gameStateRef.current[pit.key].player) {
                            //         playerSide = getOtherPlayer();// change side
                            //         startIdx = 0;// start on first pit
                            //     }
                            //    playTurn(playerSide, startIdx)
                            // }, 1000);
                        } else if (seedsInHand > 0){
                            startIdx++;
                            if(startIdx > MAX_PITS) {
                                startIdx = 0;
                                playerSide = getOtherPlayer(pit.player);
                            }
                            // seedsInHand--;
                            playTurn(playerSide, startIdx);
                        } else {
                            console.log('???? condition?');
                        }
                    }, 1000);

                // console.log('-> place seed:', seedsInHand, ' pit:', pit, ' moveList:', this.moveList[this.moveList.length-1]);
                }
                // when seeds in-hand are empty and pit in on active plater side,
                // pickup all seeds from current pit again 
                // if (seedsInHand === 0 && pit.player === gameState.active) {
                //     seedsInHand = pit.seeds;
                //     pit.seeds = 0;
                //     // add to moveList data
                //     addMove(pit.key, pit.seeds, seedsInHand);
                //     console.log('-> pickup seed:', seedsInHand);
                //     setTimeout(()=> {
                //         playTurn(gameState.active, startIdx);
                //     }, 1000);  
                // }
                //startIdx++;
            // }, 1000);
        }
        else {
            console.log('@@@@ no more seeds');
        }
        // dropped alll seeds, then pickup all seeds in the pit
        // if (inHand === 0 && pit.seeds > 0 && !pit.isStore) {
        //     console.log('pickup all seeds from pit');
        //     addMove(pit.key, 0, pit.seeds);
        //     setTimeout(()=> {
        //         //idx++;
        //         // if(idx >= myPlayerPitList.length) {
        //         //     idx = 0;
        //         //     playerSide = getOtherPlayer();
        //         // }
        //         playTurn(playerSide, idx);
        //     }, 1000);
        // }
        console.log('-> at end of pits: in-hand', seedsInHand, ' next idx:', startIdx);
     
        // still have seeds in-hand, play other side of pits
        // if (seedsInHand > 0) {
        //     const otherPlayer = getOtherPlayer();
        //     console.log('    switch side:', ' side:', otherPlayer, ' seedsInHand=', seedsInHand, );
        //     //start at first pit when switch side, counter clockwise
        // //    playTurn(otherPlayer, 0);
        // }
        //showMoves();
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
        useEffect(() => {
            gameStateRef.current = gameState;  // Keep the ref updated with the latest state
          }, [gameState]);
        // console.log('render', store1Key, this.state[store1Key]);
        // pit order goes counter clockwise, need to reverse the other side
        return (<div>
            <div id="mancala-game">
                <div className="message player1">Message:{gameState.message}</div>
                <div className="holding-area  player1">Player 2(Computer):In-Hand:{PLAYER_2 === gameState.active ? gameState.seedsInHand: ''}</div>
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
                <div className="holding-area player0">Player 1: In-Hand:{PLAYER_1 === gameState.active ? gameState.seedsInHand: ''}</div>
                <div className="message player0">Message:{gameState.message}</div>
            </div>
        </div>
    )
}

export default Mancala;