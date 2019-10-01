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
                {/* <EvaluateMetricsTab
                    datasetId={this.props.dataset}
                    metricNames={this.props.metricNames}
                    onServerResponse={this.props.onServerResponse}
                /> */}
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

    runOnDataset() {
        console.log(this.state.selectedRunnerIds);
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
        console.log(runnerName);
        console.log(this.props.runnerNames);
        const idx = this.props.runnerNames.indexOf(runnerName);
        console.log('idx: ', idx);
        const selIdx = runners.indexOf(idx);
        if (selIdx === -1) {
            runners.push(idx);
        } else {
            runners.splice(selIdx, 1);
        }
        console.log('new state: ', runners);
        this.setState({ selectedRunnerIds: runners });
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
}

class EvaluateMetricsTab extends React.Component {

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