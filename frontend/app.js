import ReactDOM from 'react-dom';
import React from 'react';

import { AboutTab } from './aboutTab.js';
import { AddDatasetTab } from './addDatasetTab.js';
import { ConfigTab } from './configTab.js';
import { DatasetTab } from './datasetTab.js';
import { Header } from './header.js';
import { ModelTab } from './modelTab.js';
import { Navigation } from './nav.js';
import { AddPreproTab } from './addPreproTab.js';
import { AddEncoderTab } from './addEncoderTab.js';
import { AddModelTab } from './newAddModelTab.js';
import { AddRunnerTab } from './addRunnerTab.js';

/*

results incoming from the server are objects of shape:
{
    runId: number,
    runnerId: number,
    datasetId: number,
    captions: [
        {
            greedyCaption: [string],
            beamSearchCaptions: [[string]]    
        }
    ]
}

*/


class App extends React.Component {
    constructor(props) {
        super(props);

        this.addDataset = this.addDataset.bind(this);
        this.addPrepro = this.addPrepro.bind(this);
        this.addEncoder = this.addEncoder.bind(this);
        this.addModel = this.addModel.bind(this);
        this.addRunner = this.addRunner.bind(this);
        this.addResults = this.addResults.bind(this);
        this.addMetricScoresToResults = this.addMetricScoresToResults.bind(this);
        this.handleSelectedTabChange = this.handleSelectedTabChange.bind(this);

        this.state = {
            datasets: [],
            preprocessors: [],
            encoders: [],
            models: [],
            runners: [],
            metrics: [ "BLEU1", "BLEU2", "BLEU3", "BLEU4", "METEOR" ],
            results: [],
            selectedTab: "About",
        };
        this.state.defaultTabs = [ "About", "Configure", "Datasets", "Models" ];
    }

    handleSelectedTabChange(tabKey) {
        this.setState({ selectedTab: tabKey });
    }

    addDataset(dataset) {
        let ds = this.state.datasets;
        ds.push(dataset);
        this.setState({datasets: ds});
        return this.state.datasets.length - 1;
    }

    addPrepro(p) {
        let ps = this.state.preprocessors;
        ps.push(p);
        this.setState({preprocessors: ps});
        return this.state.preprocessors.length - 1;
    }

    addEncoder(e) {
        let es = this.state.encoders;
        es.push(e);
        this.setState({encoders: es});
        return this.state.encoders.length - 1; 
    }

    addModel(model) {
        let ms = this.state.models;
        ms.push(model)
        this.setState({models: ms});
        return this.state.models.length - 1;
    }

    addRunner(runner) {
        let rs = this.state.runners;
        rs.push(runner)
        this.setState({runners: rs});
        return this.state.runners.length - 1;
    }

    addResults(results) {
        let res = this.state.results;
        res.push(results)
        this.setState({results: res});
        return this.state.results.length - 1;
    }

    addMetricScoresToResults(scores) {
        let res = this.state.results;
        const metric = scores.metric;
        for (let i = 0; i < res.length; i++) {
            let runId = res[i].runId;
            // if there are new scores for this run
            if (scores[runId] !== -1) {
                if (res[i].scores === undefined)
                    res[i].scores = {};
                res[i].scores[metric] = scores[runId];
            }
        }
        this.setState({ results: res });
    }

    render() {
        const s = this.state;
        const runners = s.runners.map(r => r.name);
        const datasets = s.datasets.map(d => d.name);
        const defaultTabs = s.defaultTabs;
        const id = s.selectedTab;
        let mainTab = null;

        if (id === "Configure") {
            // mainTab = <ConfigTab
            //     addPrepro={this.addPrepro}
            //     addEncoder={this.addEncoder}
            //     addModel={this.addModel}
            //     addRunner={this.addRunner}
            //     preprocessors={this.state.preprocessors}
            //     encoders={this.state.encoders}
            //     models={this.state.models}
            // />;
            mainTab = <ConfigTab>
                <AddDatasetTab
                    onServerResponse={this.addDataset}
                />
                <AddPreproTab
                    addPrepro={this.addPrepro}
                />
                <AddEncoderTab
                    addEncoder={this.addEncoder}
                />
                <AddModelTab
                    addModel={this.addModel}
                />
                <AddRunnerTab
                    preprocessors={s.preprocessors}
                    encoders={s.encoders}
                    models={s.models}
                    addRunner={this.addRunner}
                />
            </ConfigTab>
        } else if (id === "About") {
            mainTab = <AboutTab />;
        } else if (runners.includes(id)) {
            const m = s.runners.filter(m => m.name === id)[0];
            mainTab =  <ModelTab model={m} />
        } else if (datasets.includes(id)) {
            const d = s.datasets.filter(d => d.name === id)[0];
            const results = s.results.filter(r => r.datasetId === d.id);
            mainTab = <DatasetTab 
                dataset={d} 
                onResultsResponse={this.addResults}
                onMetricScoresResponse={this.addMetricScoresToResults}
                results={results}
                runners={this.state.runners}
                metrics={this.state.metrics}
            />
        }

        return (
            <div>
                <Header
                    nav={
                        <Navigation
                            datasetNames={datasets} 
                            runnerNames={runners} 
                            defaultNames={defaultTabs}
                            onSelectedChange={this.handleSelectedTabChange}
                        />
                    } />
                <div className="mainTab">
                    {mainTab}
                </div>
            </div>
        );
    }
}

ReactDOM.render(
    <App/>,
    document.getElementById('root')
);
