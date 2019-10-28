import PropTypes from 'prop-types';
import React from 'react';

import { RunResultsView } from './runResultsView.js';

export { HomeTab };

class HomeTab extends React.Component {
    constructor(props) {
        super(props);

        this.imgSrc = this.props.results === null ? null :
            `/load_image/${this.props.results.datasetId}/${0}`;

        this.state = {
            imgSrc: this.imgSrc,
            tokenId: null
        };

        this.getResultsForElement = this.getResultsForElement.bind(this);
        this.fetchAttentionMap = this.fetchAttentionMap.bind(this);
        this.onCaptionClick = this.onCaptionClick.bind(this);
        this.onImageSubmit = this.onImageSubmit.bind(this);
    }

    onImageSubmit() {

        // prepare the image blob for transfer
        let formData = new FormData();
        const file = document.getElementById("inFile").files[0];
        formData.append('input-file', file);
        const init = { method: 'POST', body: formData };

        // send over the image and wait for results
        fetch('/demo_caption', init)
        .then(res => res.json())
        .then(res => {
            let r = this.getResultsForElement([res], 0)[0];
            this.setState({imgSrc: `/load_image/${r.datasetId}/${0}`});
            this.props.onServerResponse(r);
        });
    }

    render() {
        return (
            <div className="homeTab">

                <form method="post" encType="multipart/form-data">
                    <label>Input image: </label>
                    <input id="inFile" 
                        type="file" 
                        name="input-file" 
                        accept=".jpg"
                        onInput={this.onImageSubmit}
                        />
                </form>

                {
                    this.props.results !== null &&
                    <div>
                        <img src={this.state.imgSrc} style={{ width: "30vw", height: "auto" }} alt=""/>
                        <RunResultsView
                            results={this.props.results}
                            instanceId={0}
                            onCaptionClick={this.onCaptionClick}
                            fetchAttentionMap={this.fetchAttentionMap}
                            metrics={[]}
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

    onCaptionClick(captionId, tokenId) {
        if (tokenId === this.state.tokenId) {
            // user clicked on the currently selected caption token => display
            // the original image again
            this.setState({tokenId: null, imgSrc: `/load_image/${this.props.results.datasetId}/${0}`});
        } else {
            // fetch the attention map corresponding to the word from the
            // caption the user clicked on
            this.fetchAttentionMapForOriginal(this.props.results.runId, 0, captionId, tokenId)
            .then(src => {
                this.setState({ tokenId: tokenId, imgSrc: src });
            });
        }
    }

    getResultsForElement(results, elemId) {
        return results.map(r => {
            return {
                runId: r.runId,
                runnerId: r.runnerId,
                datasetId: r.datasetId,
                captions: r.captions[elemId],
            }
        });
    }
}

HomeTab.propTypes = {
    results: PropTypes.object,
    onServerResponse: PropTypes.func
};