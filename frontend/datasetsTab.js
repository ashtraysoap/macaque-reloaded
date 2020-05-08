import React from 'react';
import PropTypes from 'prop-types';

import { DatasetTab } from './datasetTab.js';
import { SidePanel, range } from './utils.js';
import { enumerate } from './utils.js';

export { DatasetsTab };

class DatasetsTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedDataset: 0,
            selectedRunner: 0
        };

        this.runOnDataset = this.runOnDataset.bind(this);
        this.buttonClick = this.buttonClick.bind(this);
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
                <div>
                    <SidePanel
                        label="Datasets"
                        keys={range(dsNames.length)}
                        values={dsNames}
                        callback={(key) => this.setState({selectedDataset: key})}
                        selectedKey={ds}
                    />

                    <div style={{marginTop: "7vh"}}>
                        <label className="customFileUpload" onClick={this.buttonClick}>Process dataset</label>
                        <RunnersMenu runners={p.runners} onClick={(r) => this.runOnDataset(r)}/>
                    </div>
                </div>

                <div>
                    <DatasetTab
                        dataset={p.datasets[ds]}
                        onResultsResponse={p.onResultsResponse}
                        runners={p.runners}
                        results={p.results.filter(r => r.datasetId === this.props.datasets[ds].id)}
                    />
                </div>
            </div>
        )

    }

    runOnDataset(r) {
        const d = this.props.datasets[this.state.selectedDataset].id;
        // const r = this.state.selectedRunner
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

    buttonClick() {
        let d = document.getElementById("runnersMenu");
        d.style.display = d.style.display === "none" ? "block" : "none";
        console.log(d);
    }
}

function RunnersMenu(props) {
    const rs = enumerate(props.runners).map(r => <div onClick={() => props.onClick(r[0])}>
        {r[1].name}
    </div>);
    
    return (
        <div id="runnersMenu" style={{display: "none"}}>
            {rs}
        </div>
    );
}

DatasetsTab.propTypes = {
    datasets: PropTypes.arrayOf(PropTypes.object).isRequired,
    results: PropTypes.arrayOf(PropTypes.object).isRequired,
    runners: PropTypes.arrayOf(PropTypes.object).isRequired,
    onResultsResponse: PropTypes.func.isRequired
};