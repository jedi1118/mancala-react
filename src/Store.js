import React from 'react';
import './store.css';

class Store extends React.Component {
    constructor(props) {
        super(props);

        this.state ={
            msg: '',
            data: props
        };
    }
    render() {
        return <div className="store">Store</div>
    }
}

export default Store;