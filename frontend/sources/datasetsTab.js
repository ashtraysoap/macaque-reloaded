import React from 'react';
import PropTypes from 'prop-types';

import { DatasetTab } from './datasetTab.js';
import { SidePanel, range } from './utils.js';

export { DatasetsTab };


/**
 * Component responsible for displaying the dataset tab.
 * 
 * Component State:
 *      selectedDataset: Number. Identifier of the currently selected dataset.
 *      selectedRunner: Number. Identifier of the currently selected runner.
 *      processing: Boolean. Whether the component is currently expecting
 *              a response from the server.
 * 
 * Component Props:
 *      datasets: Array. An array of dataset objects.
 *      results: Array. An array of results objects.
 *      runners: Array. An array of runner objects.
 *      onResultsResponse: Function. Handles arriving results from the server.
 */
class DatasetsTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedDataset: 0,
            selectedRunner: 0,
            processing: false
        };

        this.runOnDataset = this.runOnDataset.bind(this);
    }

    render() {
        const p = this.props;
        const ds = this.state.selectedDataset;
        const dsNames = p.datasets.map(d => d.name);

        if (p.datasets.length === 0)
            return (
                <div className="aboutTab">
                    <div>
                        <p>No datasets present. Add a dataset in the Configure tab.</p>
                    </div>
                </div>
            );

        return (
            <div className="datasetsTab">
                <div className="datasetSidePanel">
                    <SidePanel
                        label="Datasets"
                        keys={range(dsNames.length)}
                        values={dsNames}
                        callback={(key) => this.setState({selectedDataset: key})}
                        selectedKey={ds}
                    />

                    <SidePanel
                        label="Runners"
                        keys={range(p.runners.length)}
                        values={p.runners.map(r => r.name)}
                        callback={(key) => {this.setState({ selectedRunner: key })}}
                        selectedKey={this.state.selectedRunner}
                    />

                    <div>
                        <label className="customFileUpload" onClick={this.runOnDataset}>Process dataset</label>
                    </div>

                    {
                        this.state.processing &&
                        <div className="pendingTab">Processing dataset.</div>
                    }
                </div>

                <div>
                    <DatasetTab
                        dataset={p.datasets[ds]}
                        onResultsResponse={p.onResultsResponse}
                        runners={p.runners}
                        results={p.results.filter(r => r.datasetId === this.props.datasets[ds].id)}
                        selectedRunner={this.state.selectedRunner}
                    />
                </div>

            </div>
        )

    }

    runOnDataset() {
        const d = this.props.datasets[this.state.selectedDataset].id;
        const r = this.state.selectedRunner
        this.setState({ processing: true });

        fetch(`/run_on_dataset/${d}/${r}`)
        .then(res => res.json())
        .then(response => {
            this.setState({ processing: false });
            this.props.onResultsResponse(response);
        })
        .catch(error => {
            console.log('Error:', error);
            this.setState({ processing: false });
        });
    }
}

DatasetsTab.propTypes = {
    datasets: PropTypes.arrayOf(PropTypes.object).isRequired,
    results: PropTypes.arrayOf(PropTypes.object).isRequired,
    runners: PropTypes.arrayOf(PropTypes.object).isRequired,
    onResultsResponse: PropTypes.func.isRequired
};