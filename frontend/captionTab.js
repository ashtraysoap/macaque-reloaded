import PropTypes from 'prop-types';
import React from 'react';

import { range, zip } from './utils.js';

export { CaptionTab }

class CaptionTab extends React.Component {

    render() {
        const caption = this.props.caption;
        let toks = zip(caption, range(caption.length));
        toks = toks.map(([token, id]) => <CaptionToken 
            key={id} 
            caption={token} 
            onClick={() => this.props.onTokenClick(id)}
        />);

        return (
            <div className="background">
                <CaptionToggler 
                    captionId={this.props.captionId}
                    beamSize={this.props.beamSize}
                    onChange={(cid) => this.props.onCaptionChange(cid)}
                />

                <div id="caption">
                    <div style={{display: "inline"}}>
                        {toks}
                    </div>
                </div>
            </div>
        );
    }
}

function CaptionToken(props) {
    return (
        <div style={{display: "inline", padding: "3px"}} 
            onClick={props.onClick}>{props.caption}
        </div>
    );
}

function CaptionToggler(props) {
    // TODO: case when greedy caption is not provided
    const greedyOpt = <option value={0} >greedy</option>;
    const bsOpts = range(props.beamSize).map(i => 
        <option key={i} value={i + 1}>{`beam ${i + 1}`}</option>);

    return (
        <div>
            <select value={props.captionId} onChange={e => props.onChange(e.target.value)}>
                {greedyOpt}
                {bsOpts}
            </select>
        </div>
    );
}

CaptionTab.propTypes = {
    caption: PropTypes.arrayOf(PropTypes.string).isRequired,
    onTokenClick: PropTypes.func.isRequired,
    captionId: PropTypes.number.isRequired,
    onCaptionChange: PropTypes.func.isRequired,
    greedy: PropTypes.bool.isRequired,
    beamSize: PropTypes.number.isRequired
};

CaptionToggler.propTypes = {
    captionId: PropTypes.number,
    beamSize: PropTypes.number,
    onChange: PropTypes.func
};