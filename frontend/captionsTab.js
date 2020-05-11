import PropTypes from 'prop-types';
import React from 'react';

import { enumerate } from './utils.js';

export { CaptionsTab };

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
        console.log(p);

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
        console.log(tokens);
        let className = "tokens";

        if (this.props.hasAttnGreedy) {
            tokens = tokens.map(t => 
                <div onClick={() => cb(0, t[0])} className={this.getTokenClass(0, t[0])}>
                    {t[1]}
                </div>);

            className += " blueOnHoover";
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