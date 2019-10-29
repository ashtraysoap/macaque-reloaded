import React from 'react';
import PropTypes from 'prop-types';

import { DatasetTab } from './datasetTab.js';
import { SidePanel, range } from './utils.js';

export { DatasetsTab };

class DatasetsTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: 0
        };
    }

    render() {
        const p = this.props;
        const sel = this.state.selected;
        const dsNames = p.datasets.map(d => d.name);

        if (p.datasets.length === 0)
            return (
                <div className="datasetsTab">
                    <div className="datasetCenter">
                        No datasets present. Add a dataset in the Configure tab.
                    </div>
                </div>
            );

        return (
            <div className="datasetsTab">
                <SidePanel
                    label="Datasets"
                    keys={range(dsNames.length)}
                    values={dsNames}
                    callback={(key) => this.setState({selected: key})}
                    selectedKey={sel}
                />
                <div>
                    {
                        p.datasets.length > 0 &&
                        <DatasetTab
                            dataset={p.datasets[sel]}
                            onResultsResponse={p.onResultsResponse}
                            onMetricScoresResponse={p.onMetricScoresResponse}
                            runners={p.runners}
                            metrics={p.metrics}
                            results={p.results.filter(r => r.datasetId === sel)}
                        />
                    }
                </div>
            </div>
        )

    }
}

DatasetsTab.propTypes = {
    datasets: PropTypes.any.isRequired,
    // selectedDataset: PropTypes.string        later consider moving state up
};