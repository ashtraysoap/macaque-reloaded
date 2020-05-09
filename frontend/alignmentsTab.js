import PropTypes from 'prop-types';
import React from 'react';

import { zip } from './utils.js';

export { AlignmentsTab };

class AlignmentsTab extends React.Component {
    constructor(props) {
        super(props);
        this.fetchAttentionMap = this.fetchAttentionMap.bind(this);
    }

    render() {
        const p = this.props;
        const bsc = p.beamSearchCaptions;

        if (!p.hasAttnGreedy && !p.hasAttnBeamSearch) {
            return (<div>
                No attention alignments present.
            </div>);
        }

        let segments = [];
        if (p.hasAttnGreedy) {
            segments.push(<div>greedy</div>);
            segments.push(<AlignmentSegment
                caption={p.greedyCaption}
                fetchAttentionURL={(t) => this.fetchAttentionMap(0, t)}
                key={"0"}
            />);
        }

        if (p.hasAttnBeamSearch) {
            for (let i = 0; i < p.beamSearchCaptions.length; i++) {
                const j = i;
                segments.push(<div>{"beam " + (j + 1)}</div>);
                segments.push(<AlignmentSegment
                    caption={bsc[j]}
                    fetchAttentionURL={(t) => this.fetchAttentionMap(j + 1, t)}
                    key={(j + 1).toString()}
                />);
            }
        }

        return (
            <div>
                {segments}
            </div>
        );
    };

    fetchAttentionMap(captionId, tokenId) {
        const runId = this.props.runId;
        const instanceId = this.props.instanceId;
        return fetch(`/load_attention_map/${runId}/${instanceId}/${captionId}/${tokenId}`)
        .then(res => res.arrayBuffer())
        .then(ab => {
            const view = new Uint8Array(ab);
            const url = URL.createObjectURL(new Blob([view], { type: "image/jpeg" }));
            return url;
        });
    }
}

class AlignmentSegment extends React.Component {
    constructor(props) {
        super(props);

        const len = this.props.caption.length;

        this.state = {
            urls: Array(len)
        }

        for (let i = 0; i < len; i++) {
            const j = i;
            this.props.fetchAttentionURL(j)
            .then(url => {

                console.log();
                console.log(j);
                console.log(url);

                let s = this.state;
                s.urls[j] = url;
                this.setState(s)
            });
        }
    }

    render() {
        const imgs = zip(this.state.urls, this.props.caption).map(x =>
            <ImageWithCaptionFrame src={x[0]} token={x[1]}/>);

        return (
            <div className="background">
                {imgs}
            </div>
        );
    }
}

function ImageWithCaptionFrame(props) {
    return (
        <div style={{display: "inline-block", padding: "5px", marginRight: "20px"}}>
            <img style={{display: "block"}} src={props.src} alt=""/>
            <div style={{display: "block"}}>{props.token}</div>
        </div>
    );
}


AlignmentsTab.propTypes = {
    greedyCaption: PropTypes.arrayOf(PropTypes.string),
    beamSearchCaptions: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
    runId: PropTypes.number,
    instanceId: PropTypes.number,
    hasAttnGreedy: PropTypes.bool,
    hasAttnBeamSearch: PropTypes.bool    
};

AlignmentSegment.propTypes = {
    caption: PropTypes.arrayOf(PropTypes.string),
    fetchAttentionURL: PropTypes.func
}