import PropTypes from 'prop-types';
import React from 'react';

import { enumerate } from './utils.js';

export { CaptionsTab };


/**
 * This component displays the greedy and beam search captions.
 *
 * Component State:
 *      captionId: Number. The identifier of the currently selected caption.
 *              Greedy captions have captionId 0, beam search caption #i has
 *              id i+1. If no caption is selected, its value is null.
 *      tokenId: Number. The identifier of the selected token in the selected
 *              caption. Null, if not selected.
 * 
 * Component Props:
 *      greedyCaption: Array. The array of string tokens representing the greedy
 *              caption.
 *      beamSearchCaption: Array. An array of beam search captions. Each caption
 *              is an Array of string tokens.
 *      onTokenClick: Function. Handles the user clicking on a caption token.
 *      hasAttnGreedy: Boolean. Whether the caption has associated attention
 *              alignments.
 *      hasAttnBeamSearch: Boolean. Whether the beam search captions have
 *              associated attention alignments.
 */
class CaptionsTab extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            captionId: null,
            tokenId: null
        };

        this.getGreedyBar = this.getGreedyBar.bind(this);
        this.getBeamsBar = this.getBeamsBar.bind(this);
        this.onTokenClick = this.onTokenClick.bind(this);
        this.getTokenClass = this.getTokenClass.bind(this);
    }

    render() {
        const p = this.props;
        const greedy = p.greedyCaption === null ? null : this.getGreedyBar(p.greedyCaption);
        const beams = p.beamSearchCaptions === null ? null : this.getBeamsBar(p.beamSearchCaptions); 

        return (
            <div className="captionsBar">

                {greedy}
                {beams}

            </div>
        );
    }

    getGreedyBar(caption) {
        const cb = this.onTokenClick;
        let tokens = enumerate(caption);
        let className = "tokens";

        if (this.props.hasAttnGreedy) {
            tokens = tokens.map(t => 
                <div onClick={() => cb(0, t[0])} className={this.getTokenClass(0, t[0])}>
                    {t[1]}
                </div>);

            className += " blueOnHover";
        } else {
            tokens = tokens.map(t => <div>{t[1]}</div>);
        }

        return (
            <div className="captionRow">

                <div className="typeGreedy"><div>greedy</div></div>
                <div className={className}>
                    {tokens}
                </div>

            </div>
        );
    }

    getBeamsBar(beams) {
        const cb = this.onTokenClick;
        let rows = [];
        let className = "tokens";

        if (beams.length === 0) {
            return null;
        }

        for (let i = 0; i < beams.length; i++) {
            const j = i;
            let tokens = enumerate(beams[i]);

            if (this.props.hasAttnBeamSearch) {
                tokens = tokens.map(t => 
                    <div onClick={() => cb(j + 1, t[0])} className={this.getTokenClass(j + 1, t[0])}>
                        {t[1]}
                    </div>);

                className += " blueOnHover";
            } else
                tokens = tokens.map(t => <div>{t[1]}</div>);

            const row = <div className="captionRow">
                <div className="typeBeam"><div>{"beam " + (j + 1)}</div></div>
                <div className={className}>
                    {tokens}
                </div>
            </div>;
            rows.push(row);
        }

        return rows;
    }

    onTokenClick(cid, tid) {
        const s = this.state;

        if (cid === s.captionId && tid === s.tokenId)
            this.setState({ captionId: null, tokenId: null });
        else
            this.setState({ captionId: cid, tokenId: tid });

        this.props.onTokenClick(cid, tid);
    }

    getTokenClass(cid, tid) {
        const s = this.state;
        if (cid === s.captionId && tid === s.tokenId) {
            return "selectedToken";
        }
        return "";
    }
}

CaptionsTab.propTypes = {
    greedyCaption: PropTypes.arrayOf(PropTypes.string),
    beamSearchCaptions: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
    onTokenClick: PropTypes.func.isRequired,
    hasAttnGreedy: PropTypes.bool,
    hasAttnBeamSearch: PropTypes.bool
};