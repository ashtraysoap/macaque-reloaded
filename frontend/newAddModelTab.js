import React from 'react';
import PropTypes from 'prop-types';

import { InformativeInput } from './utils.js';
import { AddSomethingTab } from './addSomethingTab.js';

export { AddModelTab };


class AddModelTab extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            name: "papaya",
            type: "plugin",
            input: "images",
            plugin: { path: "/home/sam/Documents/CodeBox/BC/code/macaque/tests/mock_plugin_model.py" },
            neuralmonkey: {
                configPath: "",
                varsPath: "",
                dataSeries: "",
                srcCaptionSeries: ""
            }
        };
        this.addModel = this.addModel.bind(this);
    }

    addModel() {
        const modelCfg = this.state;
        fetch('/add_model', {
            method: 'POST',
            body: JSON.stringify(modelCfg),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => res.text())
        .then(serverModelIdx => {
            let modelIdx = this.props.addModel(modelCfg);
            if (Number(serverModelIdx) !== modelIdx) {
                console.log("Model ids don't match!");
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
                onCfgChange={e => this.setState({ neuralmonkey: { configPath: e.target.value } })}
                onVarsChange={e => this.setState({ neuralmonkey: { varsPath: e.target.value } })}
                onDataSeriesChange={e => this.setState({ neuralmonkey: { dataSeries: e.target.value } })}
                onSrcCapSeriesChange={e => this.setState({ neuralmonkey: { srcCaptionSeries: e.target.value } })}
            />;
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
                </div>
            </AddSomethingTab>
        );
    }
}

function NeuralMonkeyModel(props) {
    return (
        <div>
            <form>
                configuration file: <input type="text" 
                                            name="config" 
                                            value={props.cfg} 
                                            onChange={props.onCfgChange} />
                                <br/>
                variables file: <input type="text" 
                                            name="vars" 
                                            value={props.vars} 
                                            onChange={props.onVarsChange} />
                                <br/>
                data series: <input type="text"
                                    name="dataSeries" 
                                    value={props.dataSeries} 
                                    onChange={props.onDataSeriesChange} />
                                <br/>
                source caption series: <input type="text" 
                                        name="srcCaptionSeries"
                                        value={props.srcCaptionSeries} 
                                        onChange={props.onSrcCapSeriesChange} />
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
    onCfgChange: PropTypes.func.isRequired,
    onVarsChange: PropTypes.func.isRequired,
    onDataSeriesChange: PropTypes.func.isRequired,
    onSrcCapSeriesChange: PropTypes.func.isRequired
};