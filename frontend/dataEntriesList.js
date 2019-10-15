import React from 'react';
import PropTypes from 'prop-types';

import { range } from './utils.js';

export { DataEntriesList };

class DataEntriesList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            elements: [],
            runId: 0,
            caption: undefined
        };
        this.state.elements = this.props.entries.map(e => { return { name: e.source, id: e.id } });
        this.state.elements.forEach(e => { e.name = e.name.replace(/^.*[\\\/]/, '') });

        if (this.props.scores.length > 0) {
            this.state.runId = this.props.scores[0].runId;
        }

        this.changeRun = this.changeRun.bind(this);
        this.getDefaultCaptionForRun = this.getDefaultCaptionForRun.bind(this);

    }

    get hasScores() {
        return this.props.scores.length > 0 &&
            this.props.scores[0].scores !== undefined
    }

    get beamSize() {
        const scores = this.props.scores.filter(s => 
            s.runId === this.state.runId)[0].scores;
        const someMetric = Object.keys(scores)[0];
        if (scores[someMetric].beamSearch === undefined)
            return 0;

        return scores[someMetric].beamSearch.length;
    }

    get hasGreedy() {
        const scores = this.props.scores.filter(s => 
            s.runId === this.state.runId)[0].scores;
        const someMetric = Object.keys(scores)[0];
        return scores[someMetric].greedy !== undefined;
    }

    getDefaultCaptionForRun(runId) {
        const scores = this.props.scores.filter(s => 
            s.runId === this.state.runId)[0].scores;
        const someMetric = Object.keys(scores)[0];
        if (scores[someMetric].beamSearch !== undefined &&
            scores[someMetric].beamSearch.length > 0)
            return "beam 0";
        else if (scores[someMetric].greedy !== undefined)
            return "greedy";
        
        return undefined;
    }

    changeRun(runId) {
        const c = this.getDefaultCaptionForRun(runId);
        this.setState({
            runId: runId,
            caption: c
        });
    }

    render() {
        const elems = this.state.elements.map(e => <div 
            onClick={() => this.props.handleEntryClick(e.id)} 
            key={e.id}>
            {e.name}
        </div>);

        let beamOpts;
        let runs
        if (this.hasScores) {
            beamOpts = range(this.beamSize).map(i => 
                <option key={i} value={`beam ${i}`}>{`beam ${i}`}</option>);
            
            runs = this.props.scores.map(s => s.runId);
            runs = runs.map(r => <option 
                key={r} 
                value={r}>
                {r}
            </option>);
        }

        return (
            <div>
                {
                    this.hasScores &&
                    <div>
                    <span>Run: 
                        <select name="run" 
                            value={this.state.runId} 
                            onChange={e => this.changeRun(e.target.value)}>
                            {runs}
                        </select>
                    </span>
                    <span>Caption:
                        <select name="caption"
                            value={this.state.caption}
                            onChange={e => this.setState({caption: e.target.value})}>
                            {
                                this.hasGreedy &&
                                    <option value="greedy">greedy</option>
                            }
                            {
                                this.beamSize > 0 &&
                                    beamOpts
                            }
                        </select>   
                    </span>
                    </div>
                }
                {elems}
            </div>
        );
    }
}

// function DataInstanceEntry(props){
//     let entries = [];
//     return (
//         <div onClick={props.handleClick}>
//             <TableRow entries={entries}/>
//         </div>
//     );
// }

DataEntriesList.propTypes = {
    entries: PropTypes.shape({

    }).isRequired,
    scores: PropTypes.arrayOf(PropTypes.shape({
        runId: PropTypes.number,
        scores: PropTypes.object
    })),
    handleEntryClick: PropTypes.func
};

// ids
// filenames
// metric scores
// metric names
// runs