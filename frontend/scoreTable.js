import PropTypes from 'prop-types';
import React from 'react';

export { ScoreTable, Scores };

class Scores extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            showing: false
        };
    }

    render() {
        const p = this.props;

        if (p.results.filter(r => r.scores !== undefined).length === 0) {
            // no scores whatsoever
            return null;
        }

        const view = !this.state.showing ? null :
            <div className="transparentLayer" onClick={() => this.setState({showing: false})}>
                <div className="instanceView" onClick={(e) => e.stopPropagation()}>
                    <ScoreTable
                        results={p.results}
                        runners={p.runners}
                        metrics={p.metrics}
                    />
                </div>
            </div>

        return (
            <div>
                <label onClick={() => this.setState({showing: true})}>Scores</label>
                <hr/>
                {view}
            </div>
        );
    }
}

class ScoreTable extends React.Component {
    render() {
        const res = this.props.results;
       
        if (res.length === 0) {
            return null;
        }

        if (res.filter(r => r.scores !== undefined).length === 0) {
            return null;
        }

        let tHead = ["Run", "Runner", "Hypothesis"].concat(this.props.metrics);
        tHead = tHead.map(x => <th>{x}</th>);

        let rows = [];
        for (let i = 0; i < res.length; i++) {
            if (res[i].scores === undefined) continue;
            console.log(i, res[i]);
            const runId = res[i].runId;
            const runner = this.props.runners[res[i].runnerId].name;
            const greedy = res[i].captions[0].greedyCaption;
            const bs = res[i].captions[0].beamSearchCaptions;
            // If a greedy caption is present...
            if (greedy !== undefined) {
                const scores = this.props.metrics.map(m => {
                    if (res[i].scores[m] !== undefined) {
                        const mean = res[i].scores[m].greedy.mean
                        return Math.round(100 * mean ) / 100;
                    } else {
                        return "-";
                    }
                });
                const s = [runId, runner, "greedy"];
                rows.push(s.concat(scores));
            }
            if (bs !== undefined) {
                for (let j = 0; j < bs.length; j++) {
                    const scores = this.props.metrics.map(m => {
                        if (res[i].scores[m] !== undefined) {
                            const mean = res[i].scores[m].beamSearch[j].mean;
                            return Math.round(mean * 100) / 100;
                        } else {
                            return "-";
                        }
                    });
                    const s = [runId, runner, `beam search ${j}`];
                    rows.push(s.concat(scores));
                }
            }
        }

        console.log("rows", rows);

        rows = rows.map(r => {
            let xs = r.map(x => <td>{x}</td>);
            return <tr>{xs}</tr>;
        });

        return (
            <div>
                <table>
                    <thead>
                        <tr>{tHead}</tr>
                    </thead>
                    <tbody>
                        {rows}
                    </tbody>
                </table>
            </div>
        );
    }
}

ScoreTable.propTypes = {
    results: PropTypes.arrayOf(PropTypes.shape({
        runId: PropTypes.number,
        runnerId: PropTypes.number,
        datasetId: PropTypes.number,
        captions: PropTypes.arrayOf(PropTypes.shape({
            greedyCaption: PropTypes.arrayOf(PropTypes.string),
            beamSearchCaptions: PropTypes.arrayOf(
                PropTypes.arrayOf(PropTypes.string))
        })),
        scores: PropTypes.object
    })).isRequired,
    runners: PropTypes.arrayOf(PropTypes.object).isRequired,
    metrics: PropTypes.arrayOf(PropTypes.string).isRequired
};

Scores.propTypes = {
    results: PropTypes.arrayOf(PropTypes.object).isRequired,
    runners: PropTypes.arrayOf(PropTypes.object).isRequired,
    metrics: PropTypes.arrayOf(PropTypes.string).isRequired
};

/*

scores = {
    BLEU: {
        greedy: { scores: [...], mean: ... },
        beamSearch: [
            { scores: [...], mean: ... },
            ...
        ]
    },
    ...
}

*/
