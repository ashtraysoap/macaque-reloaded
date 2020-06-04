import React from 'react';
import PropTypes from 'prop-types';

import { InformativeInput, InformativeLabel } from './utils.js';
import { AddSomethingTab } from './addSomethingTab.js';
import { SuccessTab, ErrorTab, PendingTab } from './statusTabs.js';

export { AddModelTab };


/**
 * This class represents the input form for adding a model.
 * 
 * Its state consists merely of the user defined configuration
 * along with error logs returned from the server.
 * 
 * Component State:
 *      name: String. Name of the model.
 *      type: String. Type of the model. One of: "plugin", "neuralmonkey".
 *      input: String. Type of input. One of "features", "images".
 *      plugin: Object. The configuration of the plugin model.
 *      neuralmonkey: Object. The configuration of the NeuralMonkey model.
 *      errorLog: Object. Holds error messages from the server.
 * 
 * Component Props:
 *      addModel: Function. Registers the new model in the central application
 *              state.
 */
class AddModelTab extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            name: "model_1",
            type: "neuralmonkey",
            input: "features",
            plugin: { path: "./models/pytorch_image_captioning/plugin_model_0_additive.py" },
            neuralmonkey: {
                configPath: "./models/plugin_resources/neural_monkey_bs/experiment.ini",
                varsPath: "./models/plugin_resources/neural_monkey_bs/avg-0",
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
        const el = this.state.errorLog;
        let innerForm = null;

        if (type === 'plugin') {
            innerForm = <InformativeInput name="plugin path"
                value={this.state.plugin.path}
                optional={false}
                hint="The path to the plugin source."
                error={el.plugin === undefined ? undefined : el.plugin.pluginPath}
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
                errorLog={this.state.errorLog.neuralmonkey}
            />;
        }

        let statusTab = null;
        if (this.state.status === "ok") {
            statusTab = <SuccessTab text="Model successfuly created."/>;
        } else if (this.state.status === "error") {
            statusTab = <ErrorTab text="Error."/>;
        } else if (this.state.status === "waiting") {
            statusTab = <PendingTab text="Processing."/>;
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

                    <InformativeLabel name="runs on" optional={false} hint="Whether the model expects images or features as input.">
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


/**
 * Function Component for an input form to instantiate a Neural Monkey model.
 * 
 * Component Props:
 *      cfg: String. Path to the configuration file.
 *      vars: String. Path to the variables checkpoint.
 *      dataSeries: String. Name of the model's input image / features
 *               data series.
 *      srcCaptionSeries: String. Name of the model's input source captions
 *              series.
 *      greedySeries: String. Name of the greedy caption output data series.
 *      attnSeries: String. Name of the attention alignments output data 
 *              series.
 *      bsSeries: String. Name of the beam search output data series.
 *      handleChange: Function. Handles changes in input values.
 *      errorLog: Object. Holds error messages incoming from the server.
 */
function NeuralMonkeyModel(props) {
    const el = props.errorLog === undefined ? {} : props.errorLog;
    return (
        <div>

            <InformativeInput
                name="configuration file"
                value={props.cfg}
                handleChange={e => props.handleChange("configPath", e.target.value)}
                optional={false}
                hint="The path to the Neural Monkey configuration file."
                error={el.configPath}
            />

            <InformativeInput
                name="variables file"
                value={props.vars}
                handleChange={e => props.handleChange("varsPath", e.target.value)}
                optional={false}
                hint="The path to the experiment's variables."
                error={el.varsPath}
            />

            <InformativeInput
                name="data series"
                value={props.dataSeries}
                handleChange={e => props.handleChange("dataSeries", e.target.value)}
                optional={false}
                hint="The name of the data series under which inputs are fed."
                error={el.dataSeries}
            />

            <InformativeInput
                name="source caption series"
                value={props.srcCaptionSeries}
                handleChange={e => props.handleChange("srcCaptionSeries", e.target.value)}
                optional={true}
                hint="The name of the source captions data series."
                error={el.srcCapSeries}
            />

            <InformativeInput
                name="greedy caption series"
                value={props.greedySeries}
                handleChange={e => props.handleChange("greedySeries", e.target.value)}
                optional={true}
                hint="The name of the greedy captions data series."
                error={el.greedySeries}
            />

            <InformativeInput
                name="greedy alignment series"
                value={props.attnSeries}
                handleChange={e => props.handleChange("attnSeries", e.target.value)}
                optional={true}
                hint="The name of the greedy attention alignments data series."
                error={el.attnSeries}
            />

            <InformativeInput
                name="beam search output series"
                value={props.bsSeries}
                handleChange={e => props.handleChange("bsSeries", e.target.value)}
                optional={true}
                hint="The name of the beam search output data series."
                error={el.bsSeries}
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
    handleChange: PropTypes.func.isRequired,
    errorLog: PropTypes.object
};