import PropTypes from 'prop-types';
import React from 'react';

import { zip } from './utils.js';

export { AlignmentsTab };

class AlignmentsTab extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const capt = this.props.caption;
        const urls = this.props.urls;

        if (urls.length !== capt.length) return <div>No alignments present.</div>;

        const imgs = zip(urls, capt).map(x =>
            <ImageWithCaptionFrame src={x[0]} token={x[1]}/>);

        return (
            <div className="background">
                {imgs}
            </div>
        );
    };
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
    caption: PropTypes.arrayOf(PropTypes.string).isRequired,
    urls: PropTypes.arrayOf(PropTypes.string).isRequired
};
