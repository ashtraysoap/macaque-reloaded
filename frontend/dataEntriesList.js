import React from 'react';
import PropTypes from 'prop-types';

import { range, round, TableRow } from './utils.js';

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
        this.getScoresForEntry = this.getScoresForEntry.bind(this);
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
            return "0";
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

    getScoresForEntry(id) {
        console.log("props.score", this.props.scores);
        console.log("state", this.state);
        const scores = this.props.scores.filter(s => s.runId === this.state.runId)[0].scores;
        let res = []
        for (let m in scores) {
            if (this.hasGreedy) {
                res.push(scores[m].greedy.scores[id]);
            } else if (this.beamSize > 0) {
                res.push(scores[m].beamSearch[this.state.caption].scores[id]);
            }
        }
        res = res.map(r => round(r));
        return res;
    }

    render() {
        let elems;
        let beamOpts;
        let runs;

        if (this.hasScores) {
            beamOpts = range(this.beamSize).map(i => 
                <option key={i} value={i}>{"beam " + i}</option>);
            
            runs = this.props.scores.map(s => s.runId);
            runs = runs.map(r => <option 
                key={r} 
                value={r}>
                {r}
            </option>);

            elems = this.state.elements.map(e => <DataInstanceEntry
                key={e.id}
                name={e.name}
                metrics={this.getScoresForEntry(e.id)}
                handleClick={() => this.props.handleEntryClick(e.id)}
            />);
        } else {
            elems = this.state.elements.map(e => <div 
                className="dataEntry"
                onClick={() => this.props.handleEntryClick(e.id)} 
                key={e.id}>
                {e.name}
            </div>);
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
                            <ListHeader
                                metrics={Object.keys(this.props.scores.filter(s => s.runId === this.state.runId)[0].scores)}
                                callback={(x) => console.log(x)}
                            />
                    </div>
                }
                <div className="dataList">
                    {elems}
                </div>
            </div>
        );
    }
}

function ListHeader({ metrics, callback }) {
    
    return (
        <div className="listHeader">
            <div onClick={() => callback("name")}>Name</div>
            {
                metrics.map(m => <div key={m} onClick={() => callback(m)}>{m}</div>)
            }
        </div>
    );
}

function DataInstanceEntry(props) {
    let { name, metrics, handleClick } = props;
    let entries = [name].concat(metrics);

    return (
        <div onClick={handleClick}>
            <TableRow entries={entries}/>
        </div>
    );
}

DataEntriesList.propTypes = {
    entries: PropTypes.shape({

    }).isRequired,
    scores: PropTypes.arrayOf(PropTypes.shape({
        runId: PropTypes.number,
        scores: PropTypes.object
    })),
    handleEntryClick: PropTypes.func
};

DataInstanceEntry.propTypes = {

}