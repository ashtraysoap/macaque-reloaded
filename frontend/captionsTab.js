import PropTypes from 'prop-types';
import React from 'react';

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
        // pes

        return (
            <div className="captionsBar">

                {greedy}
                {beams}

            </div>
        );
    }

    getGreedyBar(caption) {
        console.log(caption);
        const tokens = caption.map(t => <div key={t}>{t}</div>);

        return (
            <div className="captionRow">

                <div className="typeGreedy"><div>greedy</div></div>
                <div className="tokens">
                    {tokens}
                </div>

            </div>
        );
    }

    getBeamsBar(beams) {
        return (
            null
        );
    }

}

CaptionsTab.propTypes = {
    greedyCaption: PropTypes.arrayOf(PropTypes.string),
    beamSearchCaptions: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
    onTokenClick: PropTypes.func.isRequired,
};