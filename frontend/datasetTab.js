import PropTypes from 'prop-types';
import React from 'react';

import { DataInstanceView } from './dataInstanceView.js';
import { DatasetMenu } from './datasetMenu.js';
import { ScoreTable } from './scoreTable.js';
import { TableRow } from './utils.js';

import './style.css';

export { DatasetTab };


class DatasetTab extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            elemIdx: null
        };

        this.showView = this.showView.bind(this);
        this.closeView = this.closeView.bind(this);
        this.moveViewLeft = this.moveViewLeft.bind(this);
        this.moveViewRight = this.moveViewRight.bind(this);
        this.getInstance = this.getInstance.bind(this);
    }

    get showingElementView() {
        return (this.state.elemIdx === null) ? false : true;
    }

    showView(idx) {
        this.setState({ elemIdx: idx });
    }

    closeView() {
        this.setState({ elemIdx: null });
    }

    moveViewLeft() {
        if (this.state.elemIdx === undefined)
            return;
        
        const i = this.state.elemIdx;
        const max = this.elementCount;
        const j = (i === 0) ? max : (i - 1);

        this.setState({ elemIdx: j });
    }

    moveViewRight() {
        if (this.state.elemIdx === undefined)
            return;
        
        const i = this.state.elemIdx;
        const max = this.elementCount;
        const j = (i === max) ? 0 : (i + 1);

        this.setState({ elemIdx: j });
    }

    getInstance() {
        let x = this.props.dataset.elements[this.state.elemIdx];
        console.log(x); 
        return x;
    }

    render() {
        const p = this.props;
        const results = p.results;
        const idx = this.state.elemIdx;
        console.log(results);
        const selectedResults = this.getResultsForElement(results, idx);
        const view = this.showingElementView ? <DataInstanceView 
            dataInstance={this.getInstance()} 
            dataset={p.dataset.id}
            results={selectedResults}
            onClick={this.closeView}
            runners={p.runners}
            /> : null;

        let elems = p.dataset.elements;
        elems = elems.map(e => <DataInstanceEntry key={e.id} dataInstance={e} handleClick={() => this.showView(e.id)}/>);

        return (
            <div>
                <div className="datasetRight">
                    <DatasetMenu 
                        dataset={p.dataset.id}
                        runnerNames={p.runners.map(r => r.name)}
                        metricNames={p.metrics}
                        onResultsResponse={p.onResultsResponse}
                        onMetricScoresResponse={p.onMetricScoresResponse}
                    />
                </div>

                <div className="datasetCenter">
                    {elems}
                    {view}
                </div>

                <ScoreTable 
                        results={p.results}
                        runners={p.runners}
                        metrics={p.metrics}
                    />
            </div>
        );
    }

    getResultsForElement(results, elemId) {
        return results.map(r => {
            return {
                runId: r.runId,
                runnerId: r.runnerId,
                datasetId: r.datasetId,
                captions: r.captions[elemId]
            }
        });
    }

}

function DataInstanceEntry(props){
    let entries = [props.dataInstance.source]    
    return (
        <div onClick={props.handleClick}>
            <TableRow entries={entries}/>
        </div>
    );
}


DatasetTab.propTypes = {
    dataset: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        elements: PropTypes.array
    }).isRequired,
    results: PropTypes.arrayOf(
        PropTypes.shape({
            runId: PropTypes.number,
            runnerId: PropTypes.number,
            datasetId: PropTypes.number,
            captions: PropTypes.arrayOf(PropTypes.shape({
                greedyCaption: PropTypes.arrayOf(PropTypes.string),
                beamSearchCaptions: PropTypes.arrayOf(
                    PropTypes.arrayOf(PropTypes.string))
            })
        )})
    ).isRequired,
    onResultsResponse: PropTypes.func.isRequired,
    onMetricScoresResponse: PropTypes.func.isRequired,
    runners: PropTypes.array.isRequired,
    metrics: PropTypes.arrayOf(PropTypes.string).isRequired
};

DataInstanceEntry.propTypes = {
    dataInstance: PropTypes.shape({

    }).isRequired,
    handleClick: PropTypes.func.isRequired
};