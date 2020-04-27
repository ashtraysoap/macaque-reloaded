import PropTypes from 'prop-types';
import React from 'react';

import { RunResultsView } from './runResultsView.js';
import { PendingTab } from './statusTabs.js';
import { enumerate } from './utils.js';

export { HomeTab };

class HomeTab extends React.Component {
    constructor(props) {
        super(props);

        if (this.props.results === null) {
            this.imgSrc = null;
            this.results = null;
        } else {
            this.results = this.props.results[this.state.selectedRunner]
            this.imgSrc = `/load_image/${this.results.datasetId}/${0}`;
        }

        this.state = {
            imgSrc: this.imgSrc,
            tokenId: null,
            waiting: false,
            selectedRunner: 0,
            imgDatasetId: null
        };

        this.getResultsForElement = this.getResultsForElement.bind(this);
        this.fetchAttentionMap = this.fetchAttentionMap.bind(this);
        this.fetchAttentionMapForBSToken = this.fetchAttentionMapForBSToken.bind(this);
        this.fetchBeamSearchGraph = this.fetchBeamSearchGraph.bind(this);
        this.onCaptionClick = this.onCaptionClick.bind(this);
        this.onImageSubmit = this.onImageSubmit.bind(this);
        this.processImage = this.processImage.bind(this);
    }

    // onImageSubmit() {
    //     this.setState({ waiting: true });

    //     // prepare the image blob for transfer
    //     let formData = new FormData();
    //     const file = document.getElementById("inFile").files[0];
    //     formData.append('input-file', file);
    //     const init = { method: 'POST', body: formData };

    //     // send over the image and wait for results
    //     fetch(`/single_img_caption/${this.state.selectedRunner}`, init)
    //     .then(res => res.json())
    //     .then(res => {
    //         this.imgSrc = `/load_image/${res.datasetId}/${0}`;
    //         this.setState({ 
    //             imgSrc: `/load_image/${res.datasetId}/${0}`,
    //             waiting: false
    //         });
    //         this.props.onServerResponse(res);
    //     })
    //     //.then(() => this.fetchBeamSearchGraph());
    // }

    onImageSubmit() {
        let formData = new FormData();
        const file = document.getElementById("inFile").files[0];
        formData.append('input-file', file);
        const init = { method: 'POST', body: formData };

        fetch('/single_image_upload', init)
        .then(res => res.json())
        .then(res => {
            console.log("uhm uhm", res.datasetId);
            this.imgSrc = `/load_image/${res.datasetId}/${0}`;
            this.setState({
                imgSrc: `/load_image/${res.datasetId}/${0}`,
                imgDatasetId: res.datasetId
            });
        });
    }

    processImage() {
        this.setState({ waiting: true });

        fetch(`/single_image_process/${this.state.selectedRunner}/${this.state.imgDatasetId}`)
        .then(res => res.json())
        .then(res => {
            this.setState({
                waiting: false
            });
            this.props.onServerResponse(res);
        });
    }

    render() {
        console.log(this.results);
        if (this.props.runners.length === 0) {
            return (
                <div className="homeTab">
                    No runners available.
                </div>
            );
        }

        if (this.props.results === null) {
            this.results = null;
        } else {
            if (this.props.results[this.state.selectedRunner] === undefined)
                this.results = null;
            else
                this.results = this.props.results[this.state.selectedRunner]
        }
        console.log(this.results);


        let runners = <RunnerSelection 
            runners={this.props.runners.map(r => r.name)}
            selectedRunner={this.state.selectedRunner}
            onChange={e => this.setState({selectedRunner: e})}
        />;

        return (
            <div className="homeTab">

                {
                    this.props.runners.length > 0 &&
                    <form method="post" encType="multipart/form-data">
                    <label>Input image: </label>
                    <input id="inFile" 
                        type="file" 
                        name="input-file" 
                        accept=".jpg"
                        onInput={this.onImageSubmit}
                        />
                    </form>
                }

                {
                    this.state.imgDatasetId !== null &&
                    <img src={this.state.imgSrc} style={{ width: "30vw", height: "auto" }} alt=""/>
                }

                { runners }

                {
                    this.state.imgDatasetId !== null &&
                    <button onClick={this.processImage}>Process image</button>
                }

                {
                    this.state.waiting &&
                    <PendingTab text="Processing image."/>
                }

                {
                    this.results !== null &&
                    <div>
                        <RunResultsView
                            results={this.results.results[0]}
                            instanceId={0}
                            runId={this.results.runId}
                            onCaptionClick={this.onCaptionClick}
                            fetchAttentionMap={this.fetchAttentionMap}
                            fetchAttentionMapForBSToken={this.fetchAttentionMapForBSToken}
                            metrics={[]}
                            graph={this.state.bsGraph}
                        />
                    </div>
                }
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
                    run: this.results.runId,
                    element: 0,
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

    fetchBeamSearchGraph() {
        return fetch(`/load_bs_graph/${this.results.runId}/${0}`)
        .then(res => res.json())
        .then(res => {
            this.setState({ bsGraph: res });
        });
    }

    onCaptionClick(captionId, tokenId) {
        if (tokenId === this.state.tokenId) {
            // user clicked on the currently selected caption token => display
            // the original image again
            this.setState({tokenId: null, imgSrc: `/load_image/${this.results.datasetId}/${0}`});
        } else {
            // fetch the attention map corresponding to the word from the
            // caption the user clicked on
            this.fetchAttentionMapForOriginal(this.results.runId, 0, captionId, tokenId)
            .then(src => {
                this.setState({ tokenId: tokenId, imgSrc: src });
            });
        }
    }

    getResultsForElement(results, elemId) {
        return results.results[elemId];
    }
}

function RunnerSelection(props) {
    const divStyle = {
        display: 'inline-block',
        margin: '3px'
    };

    const selStyle = {
        display: 'inline-block',
        margin: '3px',
        backgroundColor: "pink"
    };

    const rs = enumerate(props.runners);
    const rs_elems = rs.map(e => 
        <div key={e[1].toString()} 
            style={e[0] === props.selectedRunner ? selStyle : divStyle} 
            onClick={() => {console.log(e[0], e[1]); props.onChange(e[0])}}>
            {e[1]}
        </div>
    );

    return (
        <div>
            {rs_elems}
        </div>
    );
}

HomeTab.propTypes = {
    runners: PropTypes.arrayOf(PropTypes.object).isRequired,
    results: PropTypes.object,
    onServerResponse: PropTypes.func
};

RunnerSelection.propTypes = {
    runners: PropTypes.arrayOf(PropTypes.string).isRequired,
    selectedRunner: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired
};