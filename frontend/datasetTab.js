import PropTypes from 'prop-types';
import React from 'react';

import { DataInstanceView } from './dataInstanceView.js';
import { DataEntriesList } from './dataEntriesList.js';

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
        this.getInstance = this.getInstance.bind(this);
        this.instanceChange = this.instanceChange.bind(this);
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

    getInstance() {
        let x = this.props.dataset.elements[this.state.elemIdx];
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
            onInstanceChange={this.instanceChange}
            /> : null;

        const list = <DataEntriesList
            entries={p.dataset.elements}
            handleEntryClick={(idx) => this.showView(idx)}
        />;

        return (
            <div className="datasetTab">
                    <div className="addModelPartLabel">Entries</div>
                    {list}
                    {view}
            </div>
        );
    }

    getResultsForElement(results, elemId) {
        return results.map(r => {
            return {
                runId: r.runId,
                runnerId: r.runnerId,
                datasetId: r.datasetId,
                results: r.results[elemId],
            }
        });
    }

    instanceChange(keyCode) {
        // user pressed either '<--' or '-->' : switch to next instance
        const idx = this.state.elemIdx;
        const count = this.props.dataset.elements.length;
        
        let newIdx;
        if (keyCode == "37" || keyCode == "40") {
            newIdx = idx === 0 ? (count - 1) : (idx - 1);
        }

        if (keyCode == "38" || keyCode == "39") {
            newIdx = idx === count - 1 ? 0 : (idx + 1);
        }

        this.setState({ elemIdx: newIdx });
        return newIdx;
    }

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
    runners: PropTypes.array.isRequired,
};