import ReactDOM from 'react-dom';
import React from 'react';

import { AboutTab } from './aboutTab.js';
import { AddDatasetTab } from './addDatasetTab.js';
import { ConfigTab } from './configTab.js';
import { DatasetsTab } from './datasetsTab.js';
import { ModelsTab } from './modelTab.js';
import { Header } from './header.js';
import { HomeTab } from './homeTab.js';
import { Footer } from './footer.js';
import { AddPreproTab } from './addPreproTab.js';
import { AddEncoderTab } from './addEncoderTab.js';
import { AddModelTab } from './addModelTab.js';
import { AddRunnerTab } from './addRunnerTab.js';

import style from './assets/style.css';


/**
 * The root component of the application.
 * 
 * The DOM element tree returned by this component's `render` method is
 * injected into the body of the HTML entrypoint at the application launch.
 * 
 * It is responsible for the entire user interface and its frontend functionality.
 * 
 * The component's state is the central application state. The central entities -
 * models, encoders, preprocessors, runners, datasets, results, are stored in it.
 * These entities are subsequently passed as props to other, lower components.
 * 
 * This component has no props. Upon launching, it fetches its initial state from
 * the server.
 * 
 * 
 * Component State:
 *      datasets: Array. Array of dataset objects.
 *      preprocessors: Array. Array of preprocessor objects.
 *      encoders: Array. Array of encoder objects.
 *      models: Array. Array of model objects.
 *      runners: Array. Array of runner objects. 
 *      results: Array. Array of results objects.
 *      selectedTab: String. Identifier of the currently active tab.
 *      homeTabResults: Object. Results for single image datasets originating
 *              from the Home tab.
 *      public: Boolean. Whether the application is listening on public IP
 *              addresses.
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
        
        this.handleSelectedTabChange = this.handleSelectedTabChange.bind(this);

        this.homeTabResponse = this.homeTabResponse.bind(this);

        this.state = {
            datasets: [],
            preprocessors: [],
            encoders: [],
            models: [],
            runners: [],
            results: [],
            selectedTab: "Home",
            homeTabResults: null,
            public: false
        };

        // fetch initial server-side Macaque state
        fetch('/initial_state').then(response => response.json())
        .then(result => {
            this.setState({
                datasets: result.datasets,
                preprocessors: result.preprocessors,
                encoders: result.encoders,
                models: result.models,
                runners: result.runners,
                public: result.public
            });
        });
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

    homeTabResponse(results) {
        this.addResults(results);
        let htr = this.state.homeTabResults;
        
        if (htr === null)
            htr = {};
        
        const runnerId = results.runnerId;
        htr[runnerId] = results;
        this.setState({ homeTabResults: htr });
    }

    render() {
        const s = this.state;
        const id = s.selectedTab;
        let mainTab = null;

        if (id === "Home") {
            mainTab = <HomeTab
                runners={this.state.runners}
                results={this.state.homeTabResults}
                onServerResponse={(res) => this.homeTabResponse(res)}
            />;
        } else if (id === "About") {
            mainTab = <AboutTab/>;
        } else if (id === "Configure" && !s.public) {
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
        } else if (id === "Configure" && s.public) {

            mainTab = <div className="incompatibleTab">
                <p>This feature is currently incompatible with running online.</p>
            </div>;
        
        } else if (id === "Datasets") {

            mainTab = <DatasetsTab
                datasets={s.datasets}
                results={s.results}
                runners={s.runners}
                onResultsResponse={this.addResults}
            />;

        } else if (id === "Models") {
            mainTab = <ModelsTab
                models={this.state.runners.filter(r => r.about !== undefined)}
            />;
        }

        return (
            <div>
                <Header
                    onSelectedChange={this.handleSelectedTabChange}
                    selected={id}
                    public={this.state.public}
                    />
                {mainTab}
                <Footer/>
            </div>
        );
    }
}

ReactDOM.render(
    <App/>,
    document.getElementById('root')
);
