import PropTypes from 'prop-types';
import React from 'react';

import { HomeTabResultsView } from './runResultsView.js';
import { enumerate } from './utils.js';

export { HomeTab, RunnersMenu };

class HomeTab extends React.Component {
    constructor(props) {
        super(props);

        const pr = this.props.results;

        if (pr === null) {
            this.imgSrc = null;
            this.results = null;
        } else {
            this.results = Object.values(pr)[0];
            this.imgSrc = `/load_image/${this.results.datasetId}/${0}`;
        }

        this.state = {
            imgSrc: this.imgSrc,
            tokenId: null,
            waiting: false,
            selectedRunner: pr === null ? 0 : Object.values(pr)[0].runnerId,
            imgDatasetId: pr === null ? null : Object.values(pr)[0].datasetId,
            showRunners: false
        };

        this.getResultsForElement = this.getResultsForElement.bind(this);
        this.fetchAttentionMap = this.fetchAttentionMap.bind(this);
        this.fetchAttentionMapForBSToken = this.fetchAttentionMapForBSToken.bind(this);
        this.onCaptionClick = this.onCaptionClick.bind(this);
        this.onImageSubmit = this.onImageSubmit.bind(this);
        this.processImage = this.processImage.bind(this);
        this.showRunners = this.showRunners.bind(this);
    }

    onImageSubmit() {
        let formData = new FormData();
        const file = document.getElementById("inFile").files[0];
        formData.append('input-file', file);
        const init = { method: 'POST', body: formData };

        fetch('/single_image_upload', init)
        .then(res => res.json())
        .then(res => {
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
                    No runners available. Add a runner to enable single image captioning.
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

        let img = null;
        let processImgLabel = null;
        let runnerSel = null;

        if (this.state.imgDatasetId !== null) {
            img = <img src={this.state.imgSrc} className="homeTabImg" alt=""/>;
            processImgLabel = <label className="customFileUpload" onClick={this.processImage}>Process image</label>;
            runnerSel = <label className="customFileUpload" onClick={this.showRunners}>Choose runner</label>;
        }

        const cn = this.props.results === null ? "homeTabBase" : "homeTabBase homeTabBaseClicked";

        return (
            <div className="homeTab">

                {
                    this.props.runners.length > 0 &&
                    <div id="homeTabBase" className={cn}>
                        {img}
                        <div>
                            <form method="post" encType="multipart/form-data">
                                <input id="inFile" 
                                    type="file" 
                                    name="input-file" 
                                    accept=".jpg"
                                    onInput={this.onImageSubmit}
                                />
                            </form>
                            <label htmlFor="inFile" className="customFileUpload">Input image</label>
                            {runnerSel}
                            {processImgLabel}
                        </div>
                    </div>
                }

                {
                    this.state.waiting &&
                    <div className="homeTabProcessing">Processing Image</div>
                }

                {
                    this.results !== null &&
                    <div>
                        <HomeTabResultsView
                            results={this.results.results[0]}
                            instanceId={0}
                            runId={this.results.runId}
                            onCaptionClick={this.onCaptionClick}
                            fetchAttentionMap={this.fetchAttentionMap}
                            fetchAttentionMapForBSToken={this.fetchAttentionMapForBSToken}
                            metrics={[]}
                        />
                    </div>
                }

                {
                    this.state.showRunners &&
                    <RunnersMenu
                        runners={this.props.runners}
                        select={(r) => this.setState({ selectedRunner: r})}
                        selected={this.state.selectedRunner}
                        hide={() => this.setState({ showRunners: false})}
                    />
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

    showRunners() {
        this.setState({ showRunners: true });
    }
}

function RunnersMenu(props) {
    let rs = enumerate(props.runners).map(r => 
    <div key={r[1].name} onClick={() => props.select(r[0])} id={props.selected === r[0] ? "selected" : ""}>
        {r[1].name}
    </div>);

    return (
        <div onClick={props.hide} className="runnersMenuBack">
            <div className="runnersMenu">
                {rs}
            </div>
        </div>
    );
}

HomeTab.propTypes = {
    runners: PropTypes.arrayOf(PropTypes.object).isRequired,
    results: PropTypes.object,
    onServerResponse: PropTypes.func
};

RunnersMenu.propTypes = {
    runners: PropTypes.arrayOf(PropTypes.object).isRequired,
    hide: PropTypes.func.isRequired,
    select: PropTypes.func.isRequired,
    selected: PropTypes.number
}