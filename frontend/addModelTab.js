import React from 'react';
import PropTypes from 'prop-types';

import { InformativeInput, InformativeLabel } from './utils.js';
import { AddSomethingTab } from './addSomethingTab.js';
import { SuccessTab, ErrorTab, PendingTab } from './statusTabs.js';

export { AddModelTab };


class AddModelTab extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            name: "akamafera",
            type: "neuralmonkey",
            input: "features",
            plugin: { path: "/home/sam/Documents/CodeBox/BC/code/macaque/tests/mock_plugin_model.py" },
            neuralmonkey: {
                configPath: "/home/sam/thesis-code/NeuralMonkeyModels/experiment.ini",
                varsPath: "/media/sam/Kafka/190424-1/avg-0",
                dataSeries: "images",
                srcCaptionSeries: "",
                greedySeries: "greedy_caption",
                attnSeries: "alpha",
                bsSeries: "bs_target"
            },
            errorLog: {}
        };
        this.addModel = this.addModel.bind(this);
        this.NMvalueChange = this.NMvalueChange.bind(this);
    }

    addModel() {
        const modelCfg = this.state;
        this.setState({ status: "waiting" });
        fetch('/add_model', {
            method: 'POST',
            body: JSON.stringify(modelCfg),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => res.json())
        .then(res => {
            if (res.id === undefined) {
                this.setState({ status: "error", errorLog: res.log });
            } else {
                this.setState({ status: "ok", errorLog: {} });
                this.props.addModel(modelCfg);
            }
        })
        .catch(error => console.log('Error:', error));
    }

    render() {
        const type = this.state.type;
        let innerForm = null;

        if (type === 'plugin') {
            innerForm = <InformativeInput name="plugin path"
                value={this.state.plugin.path}
                optional={false}
                hint="The path to the plugin source."
                handleChange={(e) => { this.setState({ plugin: { path: e.target.value }}); }}
            />
        } else if (type === 'neuralmonkey') {
            innerForm = <NeuralMonkeyModel
                cfg={this.state.neuralmonkey.configPath}
                vars={this.state.neuralmonkey.varsPath}
                dataSeries={this.state.neuralmonkey.dataSeries}
                srcCaptionSeries={this.state.neuralmonkey.srcCaptionSeries}
                greedySeries={this.state.neuralmonkey.greedySeries}
                attnSeries={this.state.neuralmonkey.attnSeries}
                bsSeries={this.state.neuralmonkey.bsSeries}
                handleChange={this.NMvalueChange}
            />;
        }

        let statusTab = null;
        if (this.state.status === "ok") {
            statusTab = <SuccessTab text="hezky"/>;
        } else if (this.state.status === "error") {
            statusTab = <ErrorTab text="spatne"/>;
        } else if (this.state.status === "waiting") {
            statusTab = <PendingTab text="neco delam"/>;
        }

        return (
            <AddSomethingTab>
                <div>
                    <div className="addModelPartLabel">Model</div>
                    <InformativeInput name="name" value={this.state.name} 
                        optional={false}
                        hint="The name of the model unique among models."
                        error={this.state.errorLog.name}
                        handleChange={(e) => { this.setState({ name: e.target.value }); }}
                    />

                    <InformativeLabel name="runs on" optional={false}>
                        <select value={this.state.input}
                            onChange={(e) => { this.setState({ input: e.target.value }); }}>
                            <option value='features' >features</option>
                            <option value='images' >images</option>
                        </select>
                    </InformativeLabel>

                    <InformativeLabel name="type" hint="The type of model interface." optional={false}>
                        <select value={type} 
                            onChange={(e) => { this.setState({ type: e.target.value}); }} >
                            <option value='plugin' >plugin</option>
                            <option value='neuralmonkey' >Neural Monkey</option>
                        </select>
                    </InformativeLabel>
                    
                    {innerForm}
                    <button onClick={this.addModel}>Add model</button>
                    {statusTab}
                </div>
            </AddSomethingTab>
        );
    }

    NMvalueChange(key, value) {
        let nmCfg = this.state.neuralmonkey;
        nmCfg[key] = value;
        this.setState({ neuralmonkey: nmCfg });
    }
}

function NeuralMonkeyModel(props) {
    return (
        <div>

            <InformativeInput
                name="configuration file"
                value={props.cfg}
                onChange={e => props.handleChange("config", e.target.value)}
                optional={false}
                hint="The path to the Neural Monkey configuration file."
                error={undefined}
            />

            <InformativeInput
                name="variables file"
                value={props.vars}
                onChange={e => props.handleChange("vars", e.target.value)}
                optional={false}
                hint="The path to the experiment's variables."
                error={undefined}
            />

            <InformativeInput
                name="data series"
                value={props.dataSeries}
                onChange={e => props.handleChange("dataSeries", e.target.value)}
                optional={false}
                hint="The name of the data series under which inputs are fed."
                error={undefined}
            />

            <InformativeInput
                name="source caption series"
                value={props.srcCaptionSeries}
                onChange={e => props.handleChange("srcCaptionSeries", e.target.value)}
                optional={true}
                hint="The name of the source captions data series."
                error={undefined}
            />

            <InformativeInput
                name="greedy caption series"
                value={props.greedySeries}
                onChange={e => props.handleChange("greedySeries", e.target.value)}
                optional={true}
                hint="The name of the greedy captions data series."
                error={undefined}
            />

            <InformativeInput
                name="greedy alignment series"
                value={props.attnSeries}
                onChange={e => props.handleChange("attnSeries", e.target.value)}
                optional={true}
                hint="The name of the greedy attention alignments data series."
                error={undefined}
            />

            <InformativeInput
                name="beam search output series"
                value={props.bsSeries}
                onChange={e => props.handleChange("bsSeries", e.target.value)}
                optional={true}
                hint="The name of the beam search output data series."
                error={undefined}
            />
        </div>
    );
}


AddModelTab.propTypes = {
    addModel: PropTypes.func.isRequired,
};

NeuralMonkeyModel.propTypes = {
    cfg: PropTypes.string.isRequired,
    vars: PropTypes.string.isRequired,
    dataSeries: PropTypes.string.isRequired,
    srcCaptionSeries: PropTypes.string.isRequired,
    greedySeries: PropTypes.string.isRequired,
    attnSeries: PropTypes.string.isRequired,
    bsSeries: PropTypes.string.isRequired,
    handleChange: PropTypes.func.isRequired
};