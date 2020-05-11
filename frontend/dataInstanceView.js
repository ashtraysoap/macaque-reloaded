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
        this.onKeyDown = this.onKeyDown.bind(this);

        //this.imgSrc = `/load_image/${this.props.dataset}/${this.props.dataInstance.id}`;
        this.runId = (props.results.length === 0) ? null : this.props.results[0].runId;
        this.state = { 
            imgSrc: this.imgSrc,
            tokenId: null,
        };
    }

    get imgSrc() {
        return `/load_image/${this.props.dataset}/${this.props.dataInstance.id}`;
    }

    render() {
        const instance = this.props.dataInstance;
        const results = this.props.results;

        if (this.runId === null && results.length > 0) {
            this.runId = results[0].runId;
        }

        // results from the selected run
        const selectedRes = (this.runId === null) ? null : results.filter(r => r.runId === this.runId)[0];
        const runResultsView = (this.runId === null) ? null : <RunResultsView 
            results={selectedRes.results} 
            instanceId={instance.id}
            runId={this.runId}
            onCaptionClick={this.onCaptionClick}
            fetchAttentionMap={this.fetchAttentionMap}
            fetchAttentionMapForBSToken={this.fetchAttentionMapForBSToken}
        />;

        return (
            <div className="transparentLayer" onClick={() => this.props.onClick()}>
                <div className="instanceView" id="X" onClick={(e) => e.stopPropagation()} onKeyDown={e => this.onKeyDown(e)} tabIndex="0">
                    
                    { basename(instance.source) }
                    
                    <div>
                        <img src={this.state.imgSrc} alt=""/>
                    </div>

                    {runResultsView}
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
            //this.fetchAttentionMap(this.runId, this.props.dataInstance.id, tokenId)
            this.fetchAttentionMapForOriginal(this.runId, this.props.dataInstance.id, captionId, tokenId)
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
    }
}

// class DataInstanceView extends React.Component {
//     constructor(props) {
//         super(props);

//         this.fetchAttentionMap = this.fetchAttentionMap.bind(this);
//         this.fetchAttentionMapForOriginal = this.fetchAttentionMapForOriginal.bind(this);
//         this.fetchAttentionMapForBSToken = this.fetchAttentionMapForBSToken.bind(this);
//         this.onCaptionClick = this.onCaptionClick.bind(this);
//         this.onKeyDown = this.onKeyDown.bind(this);

//         //this.imgSrc = `/load_image/${this.props.dataset}/${this.props.dataInstance.id}`;
//         this.runId = (props.results.length === 0) ? null : this.props.results[0].runId;
//         this.state = { 
//             imgSrc: this.imgSrc,
//             tokenId: null,
//             showSrcCap: true,
//             showRefs: true
//         };
//     }

//     get imgSrc() {
//         return `/load_image/${this.props.dataset}/${this.props.dataInstance.id}`;
//     }

//     render() {
//         const instance = this.props.dataInstance;
//         const results = this.props.results;

//         if (this.runId === null && results.length > 0) {
//             this.runId = results[0].runId;
//         }

//         const switchState = b => {
//             let s = this.state;
//             s[b] = !s[b];
//             this.setState(s);
//         };

//         // Create a navigation bar button for each run.
//         // let runsNav;
//         // if (results.length === 0) {
//         //     runsNav = <h4>No runs available</h4>;
//         // } else {
//         //     runsNav = results.map((r) => 
//         //         <RunToggler 
//         //             key={r.runId} 
//         //             runId={r.runId} 
//         //             runnerName={this.props.runners[r.runnerId].name}
//         //             onClick={() => {
//         //                 // Clicking on this element selects the corresponding run; the original
//         //                 // instance image is shown.
//         //                 this.setState({ runId: r.runId, imgSrc: this.imgSrc });
//         //             }}
//         //         />);
//         // }

//         // results from the selected run
//         const selectedRes = (this.runId === null) ? null : results.filter(r => r.runId === this.runId)[0];
//         const runResultsView = (this.runId === null) ? null : <RunResultsView 
//             results={selectedRes.results} 
//             instanceId={instance.id}
//             runId={this.runId}
//             onCaptionClick={this.onCaptionClick}
//             fetchAttentionMap={this.fetchAttentionMap}
//             fetchAttentionMapForBSToken={this.fetchAttentionMapForBSToken}
//             graph={null}
//         />;

//         // // Source captions
//         // const srcCap = instance.sourceCaption && this.state.showSrcCap ? 
//         //     <div className="background">{instance.sourceCaption.join(' ')}</div> : null;

//         // // Reference captions
//         // const refs = instance.references.length > 0 && this.state.showRefs ? 
//         //     <div className="background">
//         //         {instance.references.map(r => <div>{r.join(' ')}</div>)}
//         //     </div> : null;

//         return (
//             <div className="transparentLayer" onClick={() => this.props.onClick()}>
//                 <div className="instanceView" id="X" onClick={(e) => e.stopPropagation()} onKeyDown={e => this.onKeyDown(e)} tabIndex="0">
                    
//                     { basename(instance.source) }
                    
//                     <div>
//                         <img src={this.state.imgSrc} alt=""/>
//                     </div>

//                     {/* {instance.sourceCaption &&
//                         <div>
//                             <span className="resultsSpan" onClick={() => switchState('showSrcCap')}>
//                             Source Caption
//                             </span>
//                             {srcCap}
//                         </div>
//                     }

//                     {instance.references.length > 0 &&
//                         <div>
//                             <span className="resultsSpan" onClick={() => switchState('showRefs')}>
//                             Reference Captions
//                             </span>
//                             {refs}
//                         </div>
//                     } */}

//                     {/* <div id="runsBar">
//                         {runsNav}
//                     </div> */}
//                     {runResultsView}
//                 </div>
//             </div>
//         );
//     }

//     componentDidMount() {
//         document.getElementById("X").focus();
//     }

//     fetchAttentionMap(runId, dataInstanceId, captionId, tokenId) {
//         return fetch(`/load_attention_map/${runId}/${dataInstanceId}/${captionId}/${tokenId}`)
//         .then(res => res.arrayBuffer())
//         .then(ab => {
//             const view = new Uint8Array(ab);
//             const url = URL.createObjectURL(new Blob([view], { type: "image/jpeg" }));
//             return url;
//         });
//     }

//     fetchAttentionMapForOriginal(runId, dataInstanceId, captionId, tokenId) {
//         return fetch(`/load_attention_map_for_original_img/${runId}/${dataInstanceId}/${captionId}/${tokenId}`)
//         .then(res => res.arrayBuffer())
//         .then(ab => {
//             const view = new Uint8Array(ab);
//             const url = URL.createObjectURL(new Blob([view], { type: "image/jpeg" }));
//             return url;
//         });
//     }

//     fetchAttentionMapForBSToken(alignments) {
//         // If alignments are null, show original image.
//         if (alignments === null) {
//             this.setState({tokenId: null, imgSrc: this.imgSrc});
//         } else {
//             let init = {
//                 method: 'POST',
//                 body: JSON.stringify({
//                     run: this.props.results[0].runId,
//                     element: this.props.dataInstance.id,
//                     alignments: alignments
//                 }),
//                 headers: {
//                     'Content-Type': 'application/json'
//                 }
//             };

//             fetch('/load_attention_map_for_bs_token', init)
//             .then(res => res.arrayBuffer())
//             .then(ab => {
//                 const view = new Uint8Array(ab);
//                 const url = URL.createObjectURL(new Blob([view], { type: "image/jpeg" }));
//                 return url;
//             })
//             .then(url => this.setState({ imgSrc: url, tokenId: null}));
//         }
//     }

//     onCaptionClick(captionId, tokenId) {
//         if (tokenId === this.state.tokenId) {
//             // user clicked on the currently selected caption token => display
//             // the original image again
//             this.setState({tokenId: null, imgSrc: this.imgSrc});
//         } else {
//             // fetch the attention map corresponding to the word from the
//             // caption the user clicked on
//             //this.fetchAttentionMap(this.runId, this.props.dataInstance.id, tokenId)
//             this.fetchAttentionMapForOriginal(this.runId, this.props.dataInstance.id, captionId, tokenId)
//             .then(src => {
//                 this.setState({ tokenId: tokenId, imgSrc: src });
//             });
//         }
//     }

//     onKeyDown(event) {
//         const key = event.keyCode;
//         // left or right arrow pressed:
//         if (key == "37" || key == "38" || key == "39" || key == "40") {
//             const newIdx = this.props.onInstanceChange(key);
//             console.log("newIdx", newIdx);
//             this.setState({ imgSrc: `/load_image/${this.props.dataset}/${newIdx}` });
//         }
//     }
// }

// function RunToggler(props) {
//     return (
//         <div className="runToggle" onClick={props.onClick}>
//             <span>{props.runId}</span>
//             <span>{props.runnerName}</span>
//         </div>
//     );
// }


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

// RunToggler.propTypes = {
//     runnerName: PropTypes.string.isRequired,
//     runId: PropTypes.number.isRequired
// };