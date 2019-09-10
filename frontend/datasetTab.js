import PropTypes from 'prop-types';
import React from 'react';

import { DatasetMenu } from './datasetMenu.js';
import { TableRow } from './utils.js';

import './style.css';

class DataInstanceView extends React.Component {
    render() {
        const instance = this.props.dataInstance;
        return (
            <div className="transparentLayer" onClick={() => this.props.onClick()}>
                <div className="instanceView" style={{border: "solid 4px black", borderRadius: "15px"}} onClick={(e) => e.stopPropagation()}>
                    This is a demonstrational DataInstanceView.
                    <br/>
                    {instance.source}
                    <div style={{border: "solid blue"}}>Image</div>
                    <div style={{border: "solid green"}}>Caption</div>
                    <div style={{border: "solid red"}}>Beam Search Output Graph</div>
                    <div style={{border: "solid purple"}}>Metrics Table</div>
                </div>
            </div>
        );
    }
}

class DataInstanceEntry extends React.Component {
    
    render() {
        let entries = [this.props.dataInstance.source]
        
        return (
            <div onClick={this.props.handleClick}>
                <TableRow entries={entries}/>
            </div>
        );
    }
}

class DatasetTab extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            elemIdx: null
        };

        this.showView = this.showView.bind(this);
        this.closeView = this.closeView.bind(this);
        this.moveViewLeft = this.moveViewLeft.bind(this);
        this.moveViewRight = this.moveViewRight.bind(this);
        this.getInstance = this.getInstance.bind(this);
    }

    get elementCount() {
        return this.state.dataset.elements.length();
    }

    get showingElementView() {
        return (this.state.elemIdx === null) ? false : true;
    }

    showView(idx) {
        this.setState({ elemIdx: idx });
    }

    closeView() {
        this.setState({ elemIdx: null });
    }

    moveViewLeft() {
        if (this.state.elemIdx === undefined)
            return;
        
        const i = this.state.elemIdx;
        const max = this.elementCount;
        const j = (i === 0) ? max : (i - 1);

        this.setState({ elemIdx: j });
    }

    moveViewRight() {
        if (this.state.elemIdx === undefined)
            return;
        
        const i = this.state.elemIdx;
        const max = this.elementCount;
        const j = (i === max) ? 0 : (i + 1);

        this.setState({ elemIdx: j });
    }

    getInstance() {
        let x = this.props.dataset.elements[this.state.elemIdx];
        console.log(x); 
        return x;
    }

    render() {
        const view = this.showingElementView ? <DataInstanceView dataInstance={this.getInstance()} onClick={this.closeView}/> : null;

        let elems = this.props.dataset.elements;
        elems = elems.map(e => <DataInstanceEntry key={e.id} dataInstance={e} handleClick={() => this.showView(e.id)}/>);

        return (
            <div style={{display: "table"}}>
                <div style={{display: "table-cell"}}>
                    {elems}
                    {view}
                </div>
                <div style={{display: "table-cell"}}>
                    <DatasetMenu 
                        datasetName={this.props.dataset.name}
                        modelNames={this.props.modelNames}
                    />
                </div>
            </div>
        );
    }
}

DatasetTab.propTypes = {
    dataset: PropTypes.shape({
        name: PropTypes.string,
        elements: PropTypes.array
    }).isRequired,
    modelNames: PropTypes.arrayOf(PropTypes.string).isRequired
};

DataInstanceEntry.propTypes = {
    dataInstance: PropTypes.shape({

    }).isRequired,
    handleClick: PropTypes.func.isRequired
};

export { DatasetTab };