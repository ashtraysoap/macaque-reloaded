import PropTypes from 'prop-types';
import React from 'react';

import { MultipleSelectionWithButton, range } from './utils.js';
import { PendingTab } from './statusTabs.js';


export { DatasetMenu };


function DatasetMenu(props) {
    return <RunModelsTab 
                datasetId={props.dataset}
                runnerNames={props.runnerNames}
                onResultsResponse={props.onResultsResponse}
            />;
}

class RunModelsTab extends React.Component {
    constructor(props) {
        super(props);
        this.runOnDataset = this.runOnDataset.bind(this);
        this.state = { processing: 0 };
    }

    runOnDataset(runnerIds) {
        runnerIds.forEach(runner => {
            this.setState({ processing: this.state.processing + 1 });

            fetch(`/run_on_dataset/${this.props.datasetId}/${runner}`)
            .then(res => res.json())
            .then(response => {
                console.log('Success:', JSON.stringify(response));
                this.setState({ processing: this.state.processing - 1 });
                this.props.onResultsResponse(response);
            })
            .catch(error => {
                console.log('Error:', error);
                this.setState({ processing: this.state.processing - 1 });
            });
        });
    }

    render() {
        let statusTab = this.state.processing > 0 ? <PendingTab text="Processing."/> : null;

        return (
            <div>
                <MultipleSelectionWithButton
                    label="Inference"
                    keys={range(this.props.runnerNames.length)}
                    values={this.props.runnerNames}
                    onSubmit={this.runOnDataset}
                    buttonText="run"
                />
                { statusTab }
            </div>
            
        );
    }
}


DatasetMenu.propTypes = {
    dataset: PropTypes.number.isRequired,
    runnerNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    metricNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    onResultsResponse: PropTypes.func.isRequired,
    onMetricScoresResponse: PropTypes.func.isRequired
};

RunModelsTab.propTypes = {
    datasetId: PropTypes.number.isRequired,
    runnerNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    onResultsResponse: PropTypes.func.isRequired,
}