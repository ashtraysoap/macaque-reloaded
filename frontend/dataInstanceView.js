import PropTypes from 'prop-types';
import React from 'react';

import { range, zip } from './utils.js';

import './style.css';

export { DataInstanceView };


class DataInstanceView extends React.Component {
    constructor(props) {
        super(props);

        this.fetchAttentionMap = this.fetchAttentionMap.bind(this);
        this.onCaptionClick = this.onCaptionClick.bind(this);

        this.imgSrc = `/load_image/${this.props.dataset}/${this.props.dataInstance.id}`;
        const runId = (props.results.length === 0) ? null : 0;
        this.state = { 
            runId: runId, 
            imgSrc: this.imgSrc,
            tokenId: null,
        };
    }

    render() {

        const instance = this.props.dataInstance;
        const results = this.props.results;

        // map model runs to navigation elements
        const runsNav = (results.length === 0) ? 
            <h3>No runs available</h3> : results.map((r) => <RunToggler 
                key={r.runId} 
                runId={r.runId} 
                runnerName={this.props.runners[r.runnerId].name}
                // onClick sets corresponding run and also changes the image back to default
                onClick={() => {
                    this.setState({ runId: (r.runId - 1), imgSrc: this.imgSrc });
                }}
            />);

        // results from the selected run
        const selectedRes = (this.state.runId === null) ? null : results[this.state.runId];
        const runResultsView = (this.state.runId === null) ? null : <RunResultsView 
            results={selectedRes} 
            instanceId={instance.id}
            onCaptionClick={this.onCaptionClick}
            fetchAttentionMap={this.fetchAttentionMap}
        />;

        return (
            <div className="transparentLayer" onClick={() => this.props.onClick()}>
                <div className="instanceView" style={{border: "solid 4px black", borderRadius: "15px"}} onClick={(e) => e.stopPropagation()}>
                    {instance.source}
                    <div style={{border: "solid blue"}}>
                        <img src={this.state.imgSrc} alt=""/>
                    </div>
                    <div id="runsBar" style={{display: "table", border: "solid grey"}}>
                        {runsNav}
                    </div>
                    {runResultsView}
                </div>
            </div>
        );
    }

    fetchAttentionMap(runId, dataInstanceId, tokenId) {
        return fetch(`/load_attention_map/${runId}/${dataInstanceId}/${tokenId}`)
        .then(res => res.arrayBuffer())
        .then(ab => {
            const view = new Uint8Array(ab);
            const url = URL.createObjectURL(new Blob([view], { type: "image/jpeg" }));
            return url;
        });
    }

    onCaptionClick(tokenId) {
        if (tokenId === this.state.tokenId) {
            // user clicked on the currently selected caption token => display
            // the original image again
            this.setState({tokenId: null, imgSrc: this.imgSrc});
        } else {
            // fetch the attention map corresponding to the word from the
            // caption the user clicked on
            this.fetchAttentionMap(this.state.runId, this.props.dataInstance.id, tokenId)
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

class RunResultsView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showAlignments: false
        }
    }

    render() {
        const runnerId = this.props.results.runnerId;
        const caption = this.props.results.caption;
        let toks = zip(caption, range(caption.length));
        toks = toks.map(([token, id]) => <CaptionToken 
            key={id} 
            caption={token} 
            onClick={() => this.props.onCaptionClick(id)}
        />);

        let attTab = !this.state.showAlignments ? null :
            <AlignmentsTab 
                caption={caption}
                runId={this.props.results.runId}
                instanceId={this.props.instanceId}
                fetchAttentionMap={this.props.fetchAttentionMap}
            />

        return (
            <div>
                <div style={{border: "solid green"}}>
                    Caption: {runnerId} says "
                    <div style={{display: "inline"}}>
                        {toks}
                    </div>
                    ".
                </div>
                <div style={{border: "solid pink"}}>
                    <span onClick={() => this.setState({ showAlignments: !this.state.showAlignments })}>
                        Alignments
                    </span>
                    {attTab}
                </div>
                <div style={{border: "solid red"}}>Beam Search Output Graph</div>
                <div style={{border: "solid purple"}}>Metrics Table</div>
            </div>
        )
    }
}

function CaptionToken(props) {
    return (
        <div style={{display: "inline", padding: "3px"}} 
            onClick={props.onClick}>{props.caption}
        </div>
    )
}

class AlignmentsTab extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            srcs: Array(this.props.length)
        };

        const runId = this.props.runId;
        const instanceId = this.props.instanceId;
        const caption = this.props.caption;
        const fetchMap = this.props.fetchAttentionMap;
        
        for (let i = 0; i < caption.length; i++) {
            const j = i
            fetchMap(runId, instanceId, j)
            .then(url => {
                let s = this.state;
                s.srcs[j] = url;
                this.setState(s);
            });
        }
    }

    render() {
        const srcs = this.state.srcs;
        const capt = this.props.caption;
        const imgs = zip(srcs, capt).map(x => 
            <ImageWithCaptionFrame src={x[0]} token={x[1]}/>);

        return (
            <div style={{display: "table"}}>
                {imgs}
            </div>
        );
    };
}

function ImageWithCaptionFrame(props) {
    return (
        <div style={{display: "block", padding: "5px"}}>
            <img style={{display: "block"}} src={props.src} alt=""/>
            <div style={{display: "block"}}>{props.token}</div>
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
            datasetId: PropTypes.string,
            captions: PropTypes.arrayOf(PropTypes.string)
        }
    )).isRequired,
    dataset: PropTypes.number.isRequired,
    onClick: PropTypes.func.isRequired,
    runners: PropTypes.array.isRequired
};

RunResultsView.propTypes = {
    results: PropTypes.shape(
        {
            runId: PropTypes.number,
            runnerId: PropTypes.number,
            caption: PropTypes.arrayOf(PropTypes.string)
        }
    ).isRequired,
    instanceId: PropTypes.number.isRequired,
    onCaptionClick: PropTypes.func.isRequired,
    fetchAttentionMap: PropTypes.func.isRequired
};

RunToggler.propTypes = {
    runnerName: PropTypes.string.isRequired,
    runId: PropTypes.number.isRequired
};

AlignmentsTab.propTypes = {
    caption: PropTypes.arrayOf(PropTypes.string).isRequired,
    runId: PropTypes.number.isRequired,
    instanceId: PropTypes.number.isRequired,
    fetchAttentionMap: PropTypes.func.isRequired
};