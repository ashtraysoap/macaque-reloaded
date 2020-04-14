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
        this.fetchAttentionMapForBSToken = this.fetchAttentionMapForBSToken.bind(this);
        this.onCaptionClick = this.onCaptionClick.bind(this);

        this.imgSrc = `/load_image/${this.props.dataset}/${this.props.dataInstance.id}`;
        const runId = (props.results.length === 0) ? null : this.props.results[0].runId;
        this.state = { 
            runId: runId, 
            imgSrc: this.imgSrc,
            tokenId: null,
            showSrcCap: true,
            showRefs: true
        };
    }

    render() {
        const instance = this.props.dataInstance;
        const results = this.props.results;
        const selRunId = this.state.runId;

        const switchState = b => {
            let s = this.state;
            s[b] = !s[b];
            this.setState(s);
        };

        console.log(this.props.runners);
        console.log(results);
        // Create a navigation bar button for each run.
        let runsNav;
        if (results.length === 0) {
            runsNav = <h4>No runs available</h4>;
        } else {
            runsNav = results.map((r) => 
                <RunToggler 
                    key={r.runId} 
                    runId={r.runId} 
                    runnerName={this.props.runners.filter(ru => ru.id === r.runnerId)[0].name}
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
            fetchAttentionMapForBSToken={this.fetchAttentionMapForBSToken}
            metrics={this.props.metrics}
        />;

        const srcCap = instance.sourceCaption && this.state.showSrcCap ? 
            <div className="background">{instance.sourceCaption.join(' ')}</div> : null;

        const refs = instance.references.length > 0 && this.state.showRefs ? 
            <div className="background">
                {instance.references.map(r => <div>{r.join(' ')}</div>)}
            </div> : null;

        return (
            <div className="transparentLayer" onClick={() => this.props.onClick()}>
                <div className="instanceView" onClick={(e) => e.stopPropagation()}>
                    {basename(instance.source)}
                    <div>
                        <img src={this.state.imgSrc} alt=""/>
                    </div>

                    {instance.sourceCaption &&
                        <div>
                            <span className="resultsSpan" onClick={() => switchState('showSrcCap')}>
                            Source Caption
                            </span>
                            {srcCap}
                        </div>
                    }

                    {instance.references.length > 0 &&
                        <div>
                            <span className="resultsSpan" onClick={() => switchState('showRefs')}>
                            Reference Captions
                            </span>
                            {refs}
                        </div>
                    }

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

    fetchAttentionMapForBSToken(alignments) {
        // If alignments are null, show original image.
        if (alignments === null) {
            this.setState({tokenId: null, imgSrc: this.imgSrc});
        } else {
            let init = {
                method: 'POST',
                body: JSON.stringify({
                    run: this.props.results[0].runId,
                    element: this.props.dataInstance.id,
                    alignments: alignments
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            fetch('/load_attention_map_for_bs_token', init)
            .then(res => res.arrayBuffer())
            .then(ab => {
                const view = new Uint8Array(ab);
                const url = URL.createObjectURL(new Blob([view], { type: "image/jpeg" }));
                return url;
            })
            .then(url => this.setState({ imgSrc: url, tokenId: null}));
        }
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
        <div className="runToggle" onClick={props.onClick}>
            <span>{props.runId}</span>
            <span>{props.runnerName}</span>
        </div>
    );
}


DataInstanceView.propTypes = {
    dataInstance: PropTypes.shape(
        {
            source: PropTypes.string,
            id: PropTypes.number,
            sourceCaption: PropTypes.string,
            references: PropTypes.arrayOf(PropTypes.string)
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