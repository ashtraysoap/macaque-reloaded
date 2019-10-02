import PropTypes from 'prop-types';
import React from 'react';

export { DatasetMenu };


class DatasetMenu extends React.Component {
    constructor(props) {
        super(props);
    }
  
    render() {
        return (
            <div>
                <RunModelsTab 
                    datasetId={this.props.dataset}
                    runnerNames={this.props.runnerNames}
                    onServerResponse={this.props.onServerResponse}
                />
                <EvaluateMetricsTab
                    datasetId={this.props.dataset}
                    metricNames={this.props.metricNames}
                    onServerResponse={this.props.onServerResponse}
                />
            </div>
        );
    }
}

class RunModelsTab extends React.Component {
    constructor(props) {
        super(props);
        this.addOrRemoveRunner = this.addOrRemoveRunner.bind(this);
        this.runOnDataset = this.runOnDataset.bind(this);
        this.state = {
            selectedRunnerIds: []
        };
    }

    render() {
        const elements = this.props.runnerNames.map(r => 
            <Element key={r} text={r} onClick={() => this.addOrRemoveRunner(r)} />);

        return (
            <div style={{ border: "solid grey", borderRadius: "10px", padding: "10px", margin: "5px"}}>
                <div>run model on dataset</div>
                {elements}
                <button onClick={this.runOnDataset}>run</button>
            </div>
        );
    }

    runOnDataset() {
        this.state.selectedRunnerIds.forEach(runner => {
            fetch(`/run_on_dataset/${this.props.datasetId}/${runner}`)
            .then(res => res.json())
            .then(response => {
                console.log('Success:', JSON.stringify(response));
                this.props.onServerResponse(response);
            })
            .catch(error => console.log('Error:', error));
        });
    }

    // adds the runner to the selected runners if it is not present,
    // otherwise removes it from the selected runners
    addOrRemoveRunner(runnerName) {
        let runners = this.state.selectedRunnerIds;
        const idx = this.props.runnerNames.indexOf(runnerName);
        const selIdx = runners.indexOf(idx);
        if (selIdx === -1) {
            runners.push(idx);
        } else {
            runners.splice(selIdx, 1);
        }
        this.setState({ selectedRunnerIds: runners });
    }
}

class EvaluateMetricsTab extends React.Component {
    constructor(props) {
        super(props);
        this.addOrRemoveMetric = this.addOrRemoveMetric.bind(this);
        this.evaluateMetric = this.evaluateMetric.bind(this);
        this.state = {
            selectedMetricNames: []
        };
    }

    render() {
        const elements = this.props.metricNames.map(m => 
            <Element key={m} text={m} onClick={() => this.addOrRemoveMetric(m)} />);

        return (
            <div style={{ border: "solid grey", borderRadius: "10px", padding: "10px", margin: "5px"}}>
                <div>evaluate metrics</div>
                {elements}
                <button onClick={this.evaluateMetric}>evaluate</button>
            </div>
        );
    }

    evaluateMetric() {
        this.state.selectedMetricNames.forEach(m => {
            fetch(`/evaluate_metric/${this.props.datasetId}/${m}`)
            .then(res => res.json())
            .then(response => {
                console.log('Success:', JSON.stringify(response));
                this.props.onServerResponse(response);
            })
            .catch(error => console.log('Error:', error));
        });
    }

    // adds the metric to the selected metrics if it is not present,
    // otherwise removes it from the selected metrics
    addOrRemoveMetric(metricName) {
        let metrics = this.state.selectedMetricNames;
        const i = metrics.indexOf(metricName);
        if (i === -1) {
            metrics.push(metricName);
        } else {
            metrics.splice(i, 1);
        }
        console.log(metrics);
        this.setState({ selectedMetricNames: metrics });
    }
}

class Element extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.state = {
            selected: false
        };
    }

    handleClick() {
        this.setState({ selected: !this.state.selected });
        this.props.onClick();
    }

    render() {
        return (
            <div onClick={this.handleClick} className={this.state.selected ? "selElem" : "unselElem" }>
                {this.props.text}
            </div>
        );
    }
}

DatasetMenu.propTypes = {
    dataset: PropTypes.number.isRequired,
    runnerNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    metricNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    onServerResponse: PropTypes.func.isRequired
};

RunModelsTab.propTypes = {
    datasetId: PropTypes.number.isRequired,
    runnerNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    onServerResponse: PropTypes.func.isRequired
}

EvaluateMetricsTab.propTypes = {
    datasetId: PropTypes.number.isRequired,
    metricNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    onServerResponse: PropTypes.func.isRequired
}