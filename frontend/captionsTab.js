import PropTypes from 'prop-types';
import React from 'react';

import { enumerate } from './utils.js';

export { CaptionsTab };

class CaptionsTab extends React.Component {
    
    constructor(props) {
        super(props);

        this.getGreedyBar = this.getGreedyBar.bind(this);
        this.getBeamsBar = this.getBeamsBar.bind(this);
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
        const cb = this.props.onTokenClick;
        let tokens = enumerate(caption);
        let className = "tokens";

        if (this.props.hasAttnGreedy) {
            tokens = tokens.map(t => <div onClick={() => cb(0, t[0])} key={t[1]}>{t[1]}</div>);
            className += " blueOnHoover";
        } else {
            tokens = tokens.map(t => <div key={t[1]}>{t[1]}</div>);
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
        const cb = this.props.onTokenClick;
        let rows = [];
        let className = "tokens";

        if (beams.length === 0) {
            return null;
        }

        for (let i = 0; i < beams.length; i++) {
            const j = i;
            let tokens = enumerate(beams[i]);

            if (this.props.hasAttnBeamSearch) {
                tokens = tokens.map(t => <div onClick={() => cb(j + 1, t[0])} key={t[1]}>{t[1]}</div>);
                className += " blueOnHover";
            } else
                tokens = tokens.map(t => <div key={t[1]}>{t[1]}</div>);

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

}

CaptionsTab.propTypes = {
    greedyCaption: PropTypes.arrayOf(PropTypes.string),
    beamSearchCaptions: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
    onTokenClick: PropTypes.func.isRequired,
    hasAttnGreedy: PropTypes.bool,
    hasAttnBeamSearch: PropTypes.bool
};