import ReactDOM from 'react-dom';
import React from 'react';

import { AboutTab } from './aboutTab.js';
import { AddDatasetTab } from './addDatasetTab.js';
import { AddMetricTab } from './addMetricTab.js';
import { AddModelTab } from './addModelTab.js';
import { DatasetTab } from './datasetTab.js';
import { Header } from './header.js';
import { ModelTab } from './modelTab.js';
import { Navigation } from './nav.js';


class App extends React.Component {
    constructor(props) {
        super(props);

        this.addDataset = this.addDataset.bind(this);
        this.addModel = this.addModel.bind(this);
        this.addResults = this.addResults.bind(this);
        this.handleSelectedTabChange = this.handleSelectedTabChange.bind(this);
        this.getMainTab = this.getMainTab.bind(this);


        this.state = props.state;
        this.state.defaultTabs = {
            "About": <AboutTab />,
            "Add Dataset": <AddDatasetTab onServerResponse={this.addDataset}/>,
            "Add Model": <AddModelTab onServerResponse={this.addModel}/>,
            "Add Metric": <AddMetricTab />
        }
    }

    handleSelectedTabChange(tabKey) {
        this.setState({ selectedTab: tabKey });
    }

    getMainTab() {
        const s = this.state;
	    const id = s.selectedTab;
        const models = s.models.map(m => m.name);
        const datasets = s.datasets.map(d => d.name);
        const defaults = s.defaultTabs;

        if (defaults[id])
            return defaults[id];
        
        if (models.includes(id)) {
            const m = s.models.filter(m => m.name === id)[0];
            return <ModelTab model={m} />
        }
        if (datasets.includes(id)) {
            const d = s.datasets.filter(d => d.name === id)[0];
            const results = this.state.results.filter(r => r.datasetId === d.name);
            console.log("App -> getMainTab: ", results);

            return <DatasetTab 
                dataset={d} 
                modelNames={this.state.models.map((m) => m.name)} 
                onServerResponse={this.addResults}
                results={results}
                />
        }

        return null;
    }

    addDataset(dataset) {
        let ds = this.state.datasets;
        ds.push(dataset);
        this.setState({datasets: ds});
    }

    addModel(model) {
        let ms = this.state.models;
        ms.push(model)
        this.setState({models: ms});
    }

    addResults(results) {
        console.log("App -> addResults: ", results);
        let res = this.state.results;
        this.setState({results: res.concat(results)});
    }

    render() {
        const models = this.state.models.map(m => m.name);
        const datasets = this.state.datasets.map(d => d.name);
        const defaults = Object.keys(this.state.defaultTabs);

        console.log("App -> render: ", this.state.results);

        return (
            <div>
                <Header />
                <hr/>
                <Navigation
                    datasetNames={datasets} 
                    modelNames={models} 
                    defaultNames={defaults}
                    onSelectedChange={this.handleSelectedTabChange}
                />
                <hr/>
                {this.getMainTab()}
            </div>
        );
    }

}

let state = {
    models: [],
    datasets: [],
    metrics: [],
    results: [],
    selectedTab: "About",
}

ReactDOM.render(
    <App state={state} />,
    document.getElementById('root')
);
