import React from 'react';
import PropTypes from 'prop-types';

import { DatasetTab } from './datasetTab.js';
import { SidePanel, range } from './utils.js';

export { DatasetsTab };

class DatasetsTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedDataset: 0,
            selectedRunner: 0
        };

        this.runOnDataset = this.runOnDataset.bind(this);
    }

    render() {
        const p = this.props;
        const ds = this.state.selectedDataset;
        const r = this.state.selectedRunner;
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
                <div>
                    <SidePanel
                        label="Datasets"
                        keys={range(dsNames.length)}
                        values={dsNames}
                        callback={(key) => this.setState({selectedDataset: key})}
                        selectedKey={ds}
                    />

                    <div style={{marginTop: "7vh"}}>
                        <label className="customFileUpload" onClick={this.runOnDataset}>Process dataset</label>
                    </div>
                </div>

                <div>
                    <DatasetTab
                        dataset={p.datasets[ds]}
                        onResultsResponse={p.onResultsResponse}
                        runners={p.runners}
                        results={p.results.filter(r => r.datasetId === ds)}
                    />
                </div>
            </div>
        )

    }

    runOnDataset() {
        const d = this.state.selectedDataset;
        const r = this.state.selectedRunner
        this.setState({ processing: true });

        fetch(`/run_on_dataset/${d}/${r}`)
        .then(res => res.json())
        .then(response => {
            console.log('Success:', JSON.stringify(response));
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