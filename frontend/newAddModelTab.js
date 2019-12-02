import React from 'react';
import PropTypes from 'prop-types';

import { InformativeInput } from './utils.js';
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
            }
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
                this.setState({ status: "error" });
            } else {
                this.setState({ status: "ok"});
                let modelIdx = this.props.addModel(modelCfg);
                if (Number(res.id) !== modelIdx) {
                    console.log("Model ids don't match!");
                }    
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
                        handleChange={(e) => { this.setState({ name: e.target.value }); }}
                    />
                    <form>
                        <label>runs on</label>
                        <select value={this.state.input}
                            onChange={(e) => { this.setState({ input: e.target.value }); }}>
                            <option value='features' >features</option>
                            <option value='images' >images</option>
                        </select>
                    </form>
                    <form>
                        <label>type</label>
                        <select value={type} 
                            onChange={(e) => { this.setState({ type: e.target.value}); }} >
                            <option value='plugin' >plugin</option>
                            <option value='neuralmonkey' >Neural Monkey</option>
                        </select>
                    </form>
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
            <form>
                configuration file: <input type="text" 
                                            name="config" 
                                            value={props.cfg} 
                                            onChange={e => props.handleChange("config", e.target.value)} />
                                <br/>
                variables file: <input type="text" 
                                            name="vars" 
                                            value={props.vars} 
                                            onChange={e => props.handleChange("vars", e.target.value)} />
                                <br/>
                data series: <input type="text"
                                    name="dataSeries" 
                                    value={props.dataSeries} 
                                    onChange={e => props.handleChange("dataSeries", e.target.value)} />
                                <br/>
                source caption series: <input type="text" 
                                        name="srcCaptionSeries"
                                        value={props.srcCaptionSeries} 
                                        onChange={e => props.handleChange("srcCaptionSeries", e.target.value)}
                />
                <br/>
                greedy caption series: <input 
                                        type="text"
                                        name="greedySeries"
                                        value={props.greedySeries}
                                        onChange={e => props.handleChange("greedySeries", e.target.value)}
                />
                <br/>
                greedy alignment series: <input type="text"
                                            name="attnSeries"
                                            value={props.attnSeries}
                                            onChange={e => props.handleChange("attnSeries", e.target.value)}
                />
                <br/>
                beam search output series: <input type="text"
                                            name="bsSeries"
                                            value={props.bsSeries}
                                            onChange={e => props.handleChange("bsSeries", e.target.value)}
                />
            </form>
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