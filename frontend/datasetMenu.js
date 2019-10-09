import PropTypes from 'prop-types';
import React from 'react';

import { MultipleSelectionWithButton, range } from './utils.js';

export { DatasetMenu };


function DatasetMenu(props) {
    return (
        <div>
            <RunModelsTab 
                datasetId={props.dataset}
                runnerNames={props.runnerNames}
                onResultsResponse={props.onResultsResponse}
            />
            <EvaluateMetricsTab
                datasetId={props.dataset}
                metricNames={props.metricNames}
                onMetricScoresResponse={props.onMetricScoresResponse}
            />
        </div>
    );
}

class RunModelsTab extends React.Component {
    constructor(props) {
        super(props);
        this.runOnDataset = this.runOnDataset.bind(this);
    }

    runOnDataset(runnerIds) {
        runnerIds.forEach(runner => {
            fetch(`/run_on_dataset/${this.props.datasetId}/${runner}`)
            .then(res => res.json())
            .then(response => {
                console.log('Success:', JSON.stringify(response));
                this.props.onResultsResponse(response);
            })
            .catch(error => console.log('Error:', error));
        });
    }

    render() {
        return (
            <MultipleSelectionWithButton
                label="Inference"
                keys={range(this.props.runnerNames.length)}
                values={this.props.runnerNames}
                onSubmit={this.runOnDataset}
                buttonText="run"
            />
        );
    }
}

class EvaluateMetricsTab extends React.Component {
    constructor(props) {
        super(props);
        this.evaluateMetrics = this.evaluateMetrics.bind(this);
    }

    evaluateMetrics(metrics) {
        metrics.forEach(m => {
            fetch(`/evaluate_metric/${this.props.datasetId}/${m}`)
            .then(res => res.json())
            .then(response => {
                console.log('Success:', JSON.stringify(response));
                response.metric = m;
                this.props.onMetricScoresResponse(response);
            })
            .catch(error => console.log('Error:', error));
        });
    }

    render() {
        return (
            <MultipleSelectionWithButton
                label="Evaluation"
                keys={this.props.metricNames}
                values={this.props.metricNames}
                onSubmit={this.evaluateMetrics}
                buttonText="evaluate"
            />
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

EvaluateMetricsTab.propTypes = {
    datasetId: PropTypes.number.isRequired,
    metricNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    onMetricScoresResponse: PropTypes.func.isRequired
}