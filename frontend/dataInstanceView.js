import PropTypes from 'prop-types';
import React from 'react';

import './style.css';


class DataInstanceView extends React.Component {
    constructor(props) {
        super(props);
        const runId = (props.results.length === 0) ? null : 0;
        this.state = { runId: runId };
    }

    render() {
        const instance = this.props.dataInstance;
        const results = this.props.results;
        const runsNav = (results.length === 0) ? 
            <h3>No runs available</h3> : results.map((r) => <RunToggler key={r.id} runId={r.runId} modelId={r.modelId} onClick={() => {this.setState({runId: (r.runId - 1)});}}/>);
        const selectedRes = (this.state.runId === null) ? null : results[this.state.runId];
        const runResultsView = (this.state.runId === null) ? null : <RunResultsView results={selectedRes}/>;

        return (
            <div className="transparentLayer" onClick={() => this.props.onClick()}>
                <div className="instanceView" style={{border: "solid 4px black", borderRadius: "15px"}} onClick={(e) => e.stopPropagation()}>
                    {instance.source}
                    <div style={{border: "solid blue"}}>
                        <img src={`/load_image/${this.props.dataset}/${this.props.dataInstance.id}`} alt=""/>
                    </div>
                    <div id="runsBar" style={{display: "table", border: "solid grey"}}>
                        {runsNav}
                    </div>
                    {runResultsView}
                </div>
            </div>
        );
    }
}

function RunToggler(props) {
    return (
        <div style={{display: "inline", border: "solid purple"}} onClick={props.onClick}>
            <span>{props.runId}</span>
            <span>{props.modelId}</span>
        </div>
    );
}

class RunResultsView extends React.Component {
    render() {
        console.log(this.props.results);
        return (
            <div>
                <div style={{border: "solid green"}}>Caption: {this.props.results.modelId} says "{this.props.results.results.caption}".</div>
                <div style={{border: "solid red"}}>Beam Search Output Graph</div>
                <div style={{border: "solid purple"}}>Metrics Table</div>
            </div>
        )
    }
}

DataInstanceView.propTypes = {
    dataInstance: PropTypes.shape(
        {
            source: PropTypes.string,
            id: PropTypes.number
        }
    ).isRequired,
    results: PropTypes.arrayOf(PropTypes.shape(
        {
            runId: PropTypes.number,
            modelId: PropTypes.string,
            datasetId: PropTypes.string,
            results: PropTypes.shape(
                {
                    caption: PropTypes.arrayOf(PropTypes.string),
                    alignments: PropTypes.any
                }
            )
        }
    )).isRequired,
    dataset: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
};

export { DataInstanceView };