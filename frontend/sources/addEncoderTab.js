import React from 'react';
import PropTypes from 'prop-types';

import { InformativeInput, InformativeLabel } from './utils.js';
import { AddSomethingTab } from './addSomethingTab.js';
import { PendingTab, ErrorTab, SuccessTab } from './statusTabs.js';

export { AddEncoderTab };


class AddEncoderTab extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            name: "encoder_1",
            type: "keras",
            plugin: {
                path: ""
            },
            keras: {
                network: "VGG16",
                layerSpec: "block5_conv3",
                ckptPath: ""
            },
            tfSlim: {
                network: "VGG16",
                ckptPath: "",
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
        const el = this.state.errorLog;

        if (this.state.status === "waiting") {
            statusTab = <PendingTab text="Processing."/>;
        } else if (this.state.status === "ok") {
            statusTab = <SuccessTab text="Encoder successfully created."/>
        } else if (this.state.status === "error") {
            statusTab = <ErrorTab text="Error."/>
        }

        if (type === 'plugin') {
            innerForm = <InformativeInput name="plugin path" 
                value={this.state.plugin.path}
                optional={false}
                hint="The path to the plugin source."
                error={el.plugin === undefined ? undefined : el.plugin.pluginPath}
                handleChange={(e) => { this.setState({ plugin: { path: e.target.value }}); }}
            />
        } else if (type === 'keras') {
            innerForm = <KerasEncoder
                network={this.state.keras.network}
                layerSpec={this.state.keras.layerSpec}
                ckptPath={this.state.keras.ckptPath}
                handleChange={this.handleKerasChange}
                errorLog={this.state.errorLog.keras}
            />;
        } else if (type === 'tfSlim') {
            innerForm = <NeuralMonkeyEncoder 
                network={this.state.tfSlim.network}
                checkpoint={this.state.tfSlim.ckptPath}
                featureMap={this.state.tfSlim.featureMap}
                handleNetChange={(e) => {this.setState({ tfSlim: { network: e.target.value }});}}
                handleCheckpointChange={(e) => { this.setState({ tfSlim: { ckptPath: e.target.value }}); }}
                handleFeatureMapChange={(e) => { this.setState({ tfSlim: { ckptPath: e.target.value }}); }}
                errorLog={this.state.errorLog.tfSlim}
            />;
        }

        return (
            <AddSomethingTab>
                <div>
                    <div className="addModelPartLabel">Encoder</div>

                    <InformativeInput name="name" value={this.state.name} 
                        optional={false}
                        hint="The name of the encoder. Unique among encoders."
                        error={this.state.errorLog.name}
                        handleChange={(e) => { this.setState({ name: e.target.value }); }}
                    />

                    <InformativeLabel name="type" hint="The type of encoder interface." optional={false}>
                        <select value={type} 
                            onChange={(e) => { this.setState({ type: e.target.value}); }} >
                            <option value='plugin'>plugin</option>
                            <option value='keras'>Keras</option>
                            <option value='tfSlim' >Neural Monkey / TensorFlow Slim</option>
                        </select>
                    </InformativeLabel>
                        
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
        const el = this.props.errorLog === undefined ? {} : this.props.errorLog;
        return (
            <div>
                <InformativeLabel name="network" hint="The type of network." optional={false}>
                    <select value={this.props.network} 
                        onChange={e => this.props.handleChange("network", e.target.value)}>
                        {nets}
                    </select>
                </InformativeLabel>

                <InformativeInput
                    name="layer"
                    value={this.props.layerSpec}
                    handleChange={e => this.props.handleChange("layerSpec", e.target.value)}
                    hint="An identifier of the layer whose output is extracted as features."
                    optional={false}
                    error={el.layer}
                />

                <InformativeInput
                    name="checkpoint path"
                    value={this.props.ckptPath}
                    optional={true}
                    hint="A path to the model's weights. If not provided, Keras' default is used.
                    Note, that if the weight checkpoint is not found at Keras' default location
                    it is downloaded automatically to this location."
                    handleChange={e => this.props.handleChange("ckptPath", e.target.value)}
                    error={el.ckptPath}
                />
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
        const maps = this.networks.filter(e => e.id === this.props.network)[0].maps
            .map(e => <option key={e}>{e}</option>);
        const el = this.props.errorLog === undefined ? {} : this.props.errorLog;

        return (
            <div>
                <InformativeLabel name="network" hint="The type of network." optional={false}>
                    <select 
                        name="net" 
                        value={this.props.network} 
                        onChange={this.props.handleNetChange} >
                        {nets}
                    </select>
                </InformativeLabel>

                <InformativeInput 
                    name="checkpoint path" 
                    value={this.props.checkpoint}
                    handleChange={this.props.handleCheckpointChange}
                    hint="The path to the model's serialized weights." 
                    optional={false}
                    error={el.ckptPath}
                />

                <InformativeLabel name="feature map" 
                    hint="An identifier of the layer whose output is used as features." 
                    optional={false}>
                    <select 
                        name="featureMap" 
                        value={this.props.featureMap} 
                        onChange={this.props.handleFeatureMapChange}>
                        {maps}
                    </select>
                </InformativeLabel>

            </div>
        );
    }
}


AddEncoderTab.propTypes = {
    addEncoder: PropTypes.func.isRequired,
};

KerasEncoder.propTypes = {
    network: PropTypes.string.isRequired,
    handleChange: PropTypes.func.isRequired,
    errorLog: PropTypes.object
};

NeuralMonkeyEncoder.propTypes = {
    network: PropTypes.string.isRequired,
    checkpoint: PropTypes.string.isRequired,
    featureMap: PropTypes.string.isRequired,
    handleNetChange: PropTypes.func.isRequired,
    handleCheckpointChange: PropTypes.func.isRequired,
    handleFeatureMapChange: PropTypes.func.isRequired,
    errorLog: PropTypes.object
};

