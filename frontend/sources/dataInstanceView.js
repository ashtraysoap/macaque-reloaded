import PropTypes from 'prop-types';
import React from 'react';

import { RunResultsView } from './runResultsView.js';
import { basename } from './utils.js';

export { DataInstanceView };


class DataInstanceView extends React.Component {
    constructor(props) {
        super(props);

        this.fetchAttentionMap = this.fetchAttentionMap.bind(this);
        this.fetchAttentionMapForOriginal = this.fetchAttentionMapForOriginal.bind(this);
        this.fetchAttentionMapForBSToken = this.fetchAttentionMapForBSToken.bind(this);
        this.onCaptionClick = this.onCaptionClick.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);

        this.state = { 
            imgSrc: this.imgSrc,
            tokenId: null,
        };
    }

    get imgSrc() {
        return `/load_image/${this.props.dataset}/${this.props.dataInstance.id}`;
    }

    get selectedResults() {
        const rid = this.selectedRunId;
        if (rid === null)
            return null;
        return this.props.results.filter(r => r.runId === rid)[0];
    }

    get selectedRunId() {
        const r = this.props.results;
        if (r === undefined || r === null || r.length === 0)
            return null;
        return r[0].runId;
    }

    get sourceCaption() {
        const srcCap = this.props.dataInstance.sourceCaption;
        if (srcCap === undefined || srcCap === null)
            return null;
        return srcCap;
    }

    render() {
        const instance = this.props.dataInstance;
        const results = this.props.results;

        if (results === null || results === undefined || results.length === 0) {
            return (
                <div className="transparentLayer" onClick={() => this.props.onClick()}>

                    <div className="instanceViewNoResults" id="X" onClick={(e) => e.stopPropagation()} onKeyDown={e => this.onKeyDown(e)} tabIndex="0">
                        
                            <div className="filename">
                                { basename(instance.source) }
                            </div>
                            <div>
                                <img src={this.state.imgSrc} alt=""/>
                            </div>
                            <SourceCaption caption={this.sourceCaption}/>
                        
                    </div>

                </div>
            )
        }

        return (
            <div className="transparentLayer" onClick={() => this.props.onClick()}>

                <div className="instanceView" id="X" onClick={(e) => e.stopPropagation()} onKeyDown={e => this.onKeyDown(e)} tabIndex="0">
                    
                    <div className="instanceInfo">
                        <div className="filename">{ basename(instance.source) }</div>
                        <div>
                            <img src={this.state.imgSrc} alt=""/>
                        </div>
                        <SourceCaption caption={this.sourceCaption}/>
                    </div>

                    <div className="instanceViewResults">
                        <RunResultsView 
                            results={this.selectedResults.results} 
                            instanceId={instance.id}
                            runId={this.selectedRunId}
                            onCaptionClick={this.onCaptionClick}
                            fetchAttentionMap={this.fetchAttentionMap}
                            fetchAttentionMapForBSToken={this.fetchAttentionMapForBSToken}
                        />
                    </div>

                </div>

            </div>
        );
    }

    componentDidMount() {
        document.getElementById("X").focus();
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
            this.fetchAttentionMapForOriginal(this.selectedRunId, this.props.dataInstance.id, captionId, tokenId)
            .then(src => {
                this.setState({ tokenId: tokenId, imgSrc: src });
            });
        }
    }

    onKeyDown(event) {
        const key = event.keyCode;
        // left or right arrow pressed:
        if (key == "37" || key == "38" || key == "39" || key == "40") {
            const newIdx = this.props.onInstanceChange(key);
            this.setState({ imgSrc: `/load_image/${this.props.dataset}/${newIdx}` });
        }
        // ESC key or backspace pressed:
        if (key == "27" || key == "8") {
            // close tab
        }            
    }
}

class SourceCaption extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            show: true
        };
    }

    render() {
        const c = this.props.caption;
        const cb = () => this.setState({ show: !this.state.show });

        if (c === null) return null;

        return (
            <div className="sourceCaption">
                <div onClick={cb} className="sourceCaptionLabel">Source Caption</div>
                {
                    this.state.show && <div className="sourceCaptionText">{c.join(' ')}</div>
                }
            </div>
        );
    }
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
    onInstanceChange: PropTypes.func.isRequired
};