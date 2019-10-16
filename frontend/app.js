import ReactDOM from 'react-dom';
import React from 'react';

import { AboutTab } from './aboutTab.js';
import { AddDatasetTab } from './addDatasetTab.js';
import { ConfigTab } from './configTab.js';
import { DatasetsTab } from './datasetsTab.js';
import { Header } from './header.js';
import { HomeTab } from './homeTab.js';
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
            metrics: [ "BLEU", "METEOR", "chrf3" ],
            results: [],
            selectedTab: "Home",
        };
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
        const id = s.selectedTab;
        let mainTab = null;

        if (id === "Home") {
            mainTab = <HomeTab/>;
        } else if (id === "About") {
            mainTab = <AboutTab/>;
        } else if (id === "Configure") {
            mainTab = <ConfigTab
                dataset={<AddDatasetTab
                    onServerResponse={this.addDataset}
                />}
                prepro={<AddPreproTab
                    addPrepro={this.addPrepro}
                />}
                encoder={<AddEncoderTab
                    addEncoder={this.addEncoder}
                />}
                model={<AddModelTab
                    addModel={this.addModel}
                />}
                runner={<AddRunnerTab
                    preprocessors={s.preprocessors}
                    encoders={s.encoders}
                    models={s.models}
                    addRunner={this.addRunner}
                />}
            />
        } else if (id === "Datasets") {

            mainTab = <DatasetsTab
                datasets={s.datasets}
                results={s.results}
                runners={s.runners}
                metrics={s.metrics}
                onResultsResponse={this.addResults}
                onMetricScoresResponse={this.addMetricScoresToResults}
            />;

        } else if (id === "Models") {
        
        }

        return (
            <div>
                <Header
                    onSelectedChange={this.handleSelectedTabChange}
                    selected={id}
                    />
                {mainTab}
            </div>
        );
    }
}

ReactDOM.render(
    <App/>,
    document.getElementById('root')
);
