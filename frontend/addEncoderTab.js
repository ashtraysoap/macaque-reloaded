import React from 'react';
import PropTypes from 'prop-types';

import { InformativeInput } from './utils.js';

export { AddEncoderTab };


class AddEncoderTab extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            name: "",
            type: "keras",
            plugin: {
                path: ""
            },
            keras: {
                netType: ""
            },
            tfSlim: {
                netType: "",
                checkpoint: "",
                featureMap: ""
            }
        };
        this.addEncoder = this.addEncoder.bind(this);
    }

    addEncoder() {
        const encoderCfg = this.state;
        fetch('/add_encoder', {
            method: 'POST',
            body: JSON.stringify(encoderCfg),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => res.text())
        .then(serverEncoderIdx => {
            let encoderIdx = this.props.addEncoder(encoderCfg);
            if (Number(serverEncoderIdx) !== encoderIdx) {
                console.log("Encoder ids don't match!");
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
        } else if (type === 'keras') {
            innerForm = <KerasEncoder
                netType={this.state.keras.netType}
                handleNetChange={(e) => { this.setState({ keras: { netType: e.target.value }}); }}
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
            <div>
                <label>Encoder</label>
                <InformativeInput name="name" value={this.state.name} 
                    optional={false}
                    handleChange={(e) => { this.setState({ name: e.target.value }); }}
                />
                <form>
                    <label>type</label>
                    <select value={type} 
                        onChange={(e) => { this.setState({ type: e.target.value}); }} >
                        <option value='plugin' >plugin</option>
                        <option value='keras' >Keras</option>
                        <option value='neuralmonkey' >Neural Monkey / TensorFlow Slim</option>
                    </select>
                </form>
                {innerForm}
                <button onClick={this.addEncoder}>Add encoder</button>
            </div>
        );
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
                        onChange={this.props.handleNetChange}>
                        {nets}
                    </select>
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
    handleNetChange: PropTypes.func.isRequired
};

NeuralMonkeyEncoder.propTypes = {
    netType: PropTypes.string.isRequired,
    checkpoint: PropTypes.string.isRequired,
    featureMap: PropTypes.string.isRequired,
    handleNetChange: PropTypes.func.isRequired,
    handleCheckpointChange: PropTypes.func.isRequired,
    handleFeatureMapChange: PropTypes.func.isRequired
};

