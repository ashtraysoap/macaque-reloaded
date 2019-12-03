import React from 'react';
import PropTypes from 'prop-types';

import { InformativeInput } from './utils.js';
import { AddSomethingTab } from './addSomethingTab.js';
import { PendingTab, ErrorTab, SuccessTab } from './statusTabs.js';

export { AddEncoderTab };


class AddEncoderTab extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            name: "xaxana",
            type: "keras",
            plugin: {
                path: ""
            },
            keras: {
                netType: "VGG16",
                layerSpec: "block5_conv3",
                ckptPath: ""
            },
            tfSlim: {
                netType: "VGG16",
                checkpoint: "",
                featureMap: ""
            },
            errorLog: {}
        };
        this.addEncoder = this.addEncoder.bind(this);
        this.handleKerasChange = this.handleKerasChange.bind(this);
    }

    addEncoder() {
        this.setState({ status: "waiting" });

        const encoderCfg = this.state;
        fetch('/add_encoder', {
            method: 'POST',
            body: JSON.stringify(encoderCfg),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => res.json())
        .then(res => {
            if (res.id === undefined) {
                this.setState({ status: "error", errorLog: res.log });
            } else {
                this.setState({ status: "ok", errorLog: {} });
                this.props.addEncoder(encoderCfg);
            }    
        })
        .catch(error => console.log('Error:', error));
    }

    render() {
        const type = this.state.type;
        let innerForm = null;
        let statusTab = null;

        if (this.state.status === "waiting") {
            statusTab = <PendingTab text="neco dela"/>;
        } else if (this.state.status === "ok") {
            statusTab = <SuccessTab text="hezky"/>
        } else if (this.state.status === "error") {
            statusTab = <ErrorTab text="spatny"/>
        }


        if (type === 'plugin') {
            innerForm = <InformativeInput name="plugin path" 
                value={this.state.plugin.path}
                optional={false}
                hint=""
                error={this.state.errorLog.path}
                handleChange={(e) => { this.setState({ plugin: { path: e.target.value }}); }}
            />
        } else if (type === 'keras') {
            innerForm = <KerasEncoder
                netType={this.state.keras.netType}
                layerSpec={this.state.keras.layerSpec}
                ckptPath={this.state.keras.ckptPath}
                handleChange={this.handleKerasChange}
            />;
        } else if (type === 'neuralmonkey') {
            innerForm = <NeuralMonkeyEncoder 
                netType={this.state.tfSlim.netType}
                checkpoint={this.state.tfSlim.checkpoint}
                featureMap={this.state.tfSlim.featureMap}
                handleNetChange={(e) => {this.setState({ tfSlim: { netType: e.target.value }});}}
                handleCheckpointChange={(e) => {this.setState({ tfSlim: { checkpoint: e.target.value }});}}
                handleFeatureMapChange={(e) => {this.setState({ tfSlim: { featureMap: e.target.value }});}}
            />;
        }

        return (
            <AddSomethingTab>
                <div>
                    <div className="addModelPartLabel">Encoder</div>
                    <InformativeInput name="name" value={this.state.name} 
                        optional={false}
                        hint=""
                        error={this.state.errorLog.name}
                        handleChange={(e) => { this.setState({ name: e.target.value }); }}
                    />
                    <form>
                        <label>type</label>
                        <select value={type} 
                            onChange={(e) => { this.setState({ type: e.target.value}); }} >
                            <option value='plugin'>plugin</option>
                            <option value='keras'>Keras</option>
                            <option value='neuralmonkey' >Neural Monkey / TensorFlow Slim</option>
                        </select>
                    </form>
                    {innerForm}
                    <button onClick={this.addEncoder}>Add encoder</button>

                    {statusTab}
                </div>
            </AddSomethingTab>
        );
    }

    handleKerasChange(key, value) {
        let kerasCfg = this.state.keras;
        kerasCfg[key] = value;
        this.setState({ keras: kerasCfg });
    }
}

class KerasEncoder extends React.Component {

    constructor(props) {
        super(props);
        this.networks = [
            'Xception',
            'VGG16',
            'VGG19',
            'ResNet50',
            'ResNet101',
            'ResNet152'
        ];
    }

    render() {
        const nets = this.networks.map((e) => <option key={e}>{e}</option>);
        return (
            <div>
                <form>
                    <label>network</label>
                    <select value={this.props.netType} 
                        onChange={e => this.props.handleChange("netType", e.target.value)}>
                        {nets}
                    </select>
                    <br/>
                    layer <input type="text"
                        name="layer"
                        value={this.props.layerSpec}
                        onChange={e => this.props.handleChange("layerSpec", e.target.value)}
                    />
                    <br/>
                    checkpoint path <input type="text"
                        name="ckpt"
                        value={this.props.ckptPath}
                        onChange={e => this.props.handleChange("ckptPath", e.target.value)}
                    />
                </form>
            </div>
        )
    }
}

class NeuralMonkeyEncoder extends React.Component {

    constructor(props) {
        super(props);
        this.networks = [
            {
                id: 'VGG16',
                maps: [
                    'vgg16/conv5/conv5_3',
                    'a',
                    'b'
                ]
            },
            {
                id: 'VGG19',
                maps: ['x', 'y']
            },
            {
                id: 'ResNet50V2',
                maps: ['z']
            },
            {
                id: 'ResNet101V2',
                maps: ['c', 'd']
            },
            {
                id: 'ResNet152V2',
                maps: ['h', 'g']
            }
        ]
    }

    render() {
        const nets = this.networks.map(e => <option key={e.id}>{e.id}</option>);
        const maps = this.networks.filter(e => e.id === this.props.netType)[0].maps
            .map(e => <option key={e}>{e}</option>);

        return (
            <div>
                <form>
                    network: <select 
                        name="net" 
                        value={this.props.netType} 
                        onChange={this.props.handleNetChange} >
                        {nets}
                    </select>
                    <br/>
                    checkpoint path: <input 
                        type="text" 
                        name="ckpt" 
                        value={this.props.checkpoint}
                        onChange={this.props.handleCheckpointChange}/>
                    <br/>
                    feature map: <select 
                        name="featureMap" 
                        value={this.props.featureMap} 
                        onChange={this.props.handleFeatureMapChange}>
                        {maps}
                    </select>
                </form>
            </div>
        );
    }
}


AddEncoderTab.propTypes = {
    addEncoder: PropTypes.func.isRequired,
};

KerasEncoder.propTypes = {
    netType: PropTypes.string.isRequired,
    handleChange: PropTypes.func.isRequired
};

NeuralMonkeyEncoder.propTypes = {
    netType: PropTypes.string.isRequired,
    checkpoint: PropTypes.string.isRequired,
    featureMap: PropTypes.string.isRequired,
    handleNetChange: PropTypes.func.isRequired,
    handleCheckpointChange: PropTypes.func.isRequired,
    handleFeatureMapChange: PropTypes.func.isRequired
};

