import PropTypes from 'prop-types';
import React from 'react';

import { RunResultsView } from './runResultsView.js';
import { basename } from './utils.js';

import './style.css';

export { DataInstanceView };


class DataInstanceView extends React.Component {
    constructor(props) {
        super(props);

        this.fetchAttentionMap = this.fetchAttentionMap.bind(this);
        this.fetchAttentionMapForOriginal = this.fetchAttentionMapForOriginal.bind(this);
        this.onCaptionClick = this.onCaptionClick.bind(this);

        this.imgSrc = `/load_image/${this.props.dataset}/${this.props.dataInstance.id}`;
        const runId = (props.results.length === 0) ? null : this.props.results[0].runId;
        this.state = { 
            runId: runId, 
            imgSrc: this.imgSrc,
            tokenId: null,
        };
    }

    render() {

        const instance = this.props.dataInstance;
        const results = this.props.results;
        const selRunId = this.state.runId;

        // Create a navigation bar button for each run.
        let runsNav;
        if (results.length === 0) {
            runsNav = <h3>No runs available</h3>;
        } else {
            runsNav = results.map((r) => 
                <RunToggler 
                    key={r.runId} 
                    runId={r.runId} 
                    runnerName={this.props.runners[r.runnerId].name}
                    onClick={() => {
                        // Clicking on this element selects the corresponding run; the original
                        // instance image is shown.
                        this.setState({ runId: r.runId, imgSrc: this.imgSrc });
                    }}
                />);
        }

        // results from the selected run
        const selectedRes = (selRunId === null) ? null : results.filter(r => r.runId === selRunId)[0];
        const runResultsView = (selRunId === null) ? null : <RunResultsView 
            results={selectedRes} 
            instanceId={instance.id}
            onCaptionClick={this.onCaptionClick}
            fetchAttentionMap={this.fetchAttentionMap}
            runners={this.props.runners}
            metrics={this.props.metrics}
        />;

        return (
            <div className="transparentLayer" onClick={() => this.props.onClick()}>
                <div className="instanceView" onClick={(e) => e.stopPropagation()}>
                    {basename(instance.source)}
                    <div>
                        <img src={this.state.imgSrc} alt=""/>
                    </div>
                    <div id="runsBar">
                        {runsNav}
                    </div>
                    {runResultsView}
                </div>
            </div>
        );
    }

    fetchAttentionMap(runId, dataInstanceId, captionId, tokenId) {
        return fetch(`/load_attention_map/${runId}/${dataInstanceId}/${captionId}/${tokenId}`)
        .then(res => res.arrayBuffer())
        .then(ab => {
            const view = new Uint8Array(ab);
            const url = URL.createObjectURL(new Blob([view], { type: "image/jpeg" }));
            return url;
        });
    }

    fetchAttentionMapForOriginal(runId, dataInstanceId, captionId, tokenId) {
        return fetch(`/load_attention_map_for_original_img/${runId}/${dataInstanceId}/${captionId}/${tokenId}`)
        .then(res => res.arrayBuffer())
        .then(ab => {
            const view = new Uint8Array(ab);
            const url = URL.createObjectURL(new Blob([view], { type: "image/jpeg" }));
            return url;
        });
    }

    onCaptionClick(captionId, tokenId) {
        if (tokenId === this.state.tokenId) {
            // user clicked on the currently selected caption token => display
            // the original image again
            this.setState({tokenId: null, imgSrc: this.imgSrc});
        } else {
            // fetch the attention map corresponding to the word from the
            // caption the user clicked on
            //this.fetchAttentionMap(this.state.runId, this.props.dataInstance.id, tokenId)
            this.fetchAttentionMapForOriginal(this.state.runId, this.props.dataInstance.id, captionId, tokenId)
            .then(src => {
                this.setState({ tokenId: tokenId, imgSrc: src });
            });
        }
    }
}

function RunToggler(props) {
    return (
        <div style={{display: "inline", border: "solid purple", margin: "5px"}} onClick={props.onClick}>
            <span style={{padding: "2px"}}>{props.runId}</span>
            <span style={{padding: "2px"}}>{props.runnerName}</span>
        </div>
    );
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
            runnerId: PropTypes.number,
            datasetId: PropTypes.number,
            captions: PropTypes.shape({
                greedyCaption: PropTypes.arrayOf(PropTypes.string),
                beamSearchCaptions: PropTypes.arrayOf(
                    PropTypes.arrayOf(PropTypes.string))
            })
        }
    )).isRequired,
    dataset: PropTypes.number.isRequired,
    onClick: PropTypes.func.isRequired,
    runners: PropTypes.arrayOf(PropTypes.object).isRequired,
    metrics: PropTypes.arrayOf(PropTypes.string).isRequired
};

RunToggler.propTypes = {
    runnerName: PropTypes.string.isRequired,
    runId: PropTypes.number.isRequired
};