import PropTypes from 'prop-types';
import React from 'react';

export { ScoreTable };

class ScoreTable extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const res = this.props.results;
       
        if (res.length === 0 || res[0].scores === undefined) {
            return null;
        }

        const rows = res.map(r =>
            <tr key={r.runId}>
                <th>{r.runId}</th>
                {
                    Object.values(r.scores).map(s =>
                        <td key={s}>
                            {s.greedy.mean}
                        </td>
                    )
                }
            </tr>
        );

        return (
            <div>
                <table>
                    {rows}
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
        // scores
    })).isRequired,
    runnerNames: PropTypes.arrayOf(PropTypes.string).isRequired
};
