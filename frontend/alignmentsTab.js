import PropTypes from 'prop-types';
import React from 'react';

import { zip } from './utils.js';

export { AlignmentsTab };

class AlignmentsTab extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            srcs: Array(this.props.length)
        };

        const runId = this.props.runId;
        const instanceId = this.props.instanceId;
        const captionId = this.props.captionId;
        const caption = this.props.caption;
        const fetchMap = this.props.fetchAttentionMap;
        
        for (let i = 0; i < caption.length; i++) {
            const j = i
            fetchMap(runId, instanceId, captionId, j)
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
            <div>
                {imgs}
            </div>
        );
    };
}

function ImageWithCaptionFrame(props) {
    return (
        <div style={{display: "inline-block", padding: "5px"}}>
            <img style={{display: "block"}} src={props.src} alt=""/>
            <div style={{display: "block"}}>{props.token}</div>
        </div>
    );
}


AlignmentsTab.propTypes = {
    caption: PropTypes.arrayOf(PropTypes.string).isRequired,
    runId: PropTypes.number.isRequired,
    instanceId: PropTypes.number.isRequired,
    captionId: PropTypes.number.isRequired,
    fetchAttentionMap: PropTypes.func.isRequired
};
