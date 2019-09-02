import React from 'react';


// function AddModelTab() {
//     return MockTab();
// }

function AddModelTab(props) {
    return (
        <div>
            <TaskForm onSubmit={props.onServerResponse}/>
        </div>
    );
}

class TaskForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            // modelConfig holds the configuration which is sent to
            // the server for constructing a new model interface.
            modelConfig: {
                name: "LamaodeL",
                preprocessing: {
                    // Todo
                },
                featureExtractor: {
                    type: 'keras',
                    tfSlim: {
                        netType: 'VGG16',
                        modelCkpt: '',
                        featureMap: 'vgg16/conv5/conv5_3'
                    },
                    keras: {
                        netType: 'Xception'
                    },
                    plugin: {
                        sourcePath: ''
                    }
                },
                model: {
                    type: 'neuralmonkey',
                    neuralMonkey: {
                        configPath: '/home/sam/Documents/CodeBox/BC/code/enc-dec-test/original.ini',
                        varsPath: '/home/sam/Documents/CodeBox/BC/code/enc-dec-test/variables.data',
                        imageSeries: '',
                        featureSeries: '',
                        srcCaptionSeries: ''
                    },
                    plugin: {
                        sourcePath: ''
                    }
                }
            },
            // modelConfigOpts holds the data which describe the available
            // options for individual configuration variables, as well as
            // several interdependency relations among these variables
            // and the configuration present in the forms.
            modelConfigOpts: {
                preprocessing: {},
                featureExtractor: {
                    tfSlim: {
                        nets: [
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
                    },
                    keras: {
                        nets: [
                            'Xception',
                            'VGG16',
                            'VGG19',
                            'ResNet50',
                            'ResNet101',
                            'ResNet152'
                        ]
                    }
                },
                model: {
                    neuralMonkey: {}
                }
            }
        };

        this.submitModelConfig = this.submitModelConfig.bind(this);
        this.handlePreproChange = this.handlePreproChange.bind(this);
        this.handleFeatureChange = this.handleFeatureChange.bind(this);
        this.handleModelChange = this.handleModelChange.bind(this);
        this.handleModelNameChange = this.handleModelNameChange.bind(this);
    }

    submitModelConfig() {         
        const cfg = this.state.modelConfig;
        console.log(cfg);
        fetch('/add_model', {
            method: 'POST',
            body: JSON.stringify(cfg),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => res.json())
        .then(response => {
            console.log('Success:', JSON.stringify(response));
            this.props.onSubmit(response);
        })
        .catch(error => console.log('Error:', error));
    }

    handlePreproChange(cfg) {
        this.setState({ preprocessing: cfg });
    }

    handleFeatureChange(cfg) {
        this.setState({ featureExtractor: cfg });
    }

    handleModelChange(cfg) {
        this.setState({ model: cfg });
    }

    handleModelNameChange(e) {
        let s = this.state;
        s.modelConfig.name = e.target.value;
        this.setState(s);
    }

    render() {
        const cfgOpts = this.state.modelConfigOpts;
        const preproOpts = cfgOpts.preprocessing;
        const featureOpts = cfgOpts.featureExtractor;
        const modelOpts = cfgOpts.model;

        const cfg = this.state.modelConfig;
        const preproCfg = cfg.preprocessing;
        const featureCfg = cfg.featureExtractor;
        const modelCfg = cfg.model;

        return (
            <div>
                <form>
                    model name: <input type="text" 
                                        name="name" 
                                        value={cfg.name} 
                                        onChange={this.handleModelNameChange} />
                </form>
                <hr/>
                <PreprocessingForm preproCfg={preproCfg}
                                    preproCfgOpts={preproOpts} 
                                    onCfgChange={this.handlePreproChange}
                />
                <hr/>
                <FeatureExtractionForm featureCfg={featureCfg} 
                                        featureCfgOpts={featureOpts}
                                        onCfgChange={this.handleFeatureChange} 
                />
                <hr/>
                <ModelForm modelCfg={modelCfg} 
                            modelCfgOpts={modelOpts} 
                            onCfgChange={this.handleModelChange}
                />
                <hr/>
                <button onClick={this.submitModelConfig} >Load Model</button>
            </div>
        );
    }
}

class PreprocessingForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            type: 'none'
        };

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({type: event.target.value})
    }

    render() {
        const type = this.state.type;
        let innerForm = null;

        if (type === 'plugin') {
            innerForm = <PluginForm />;
        } else if (type === 'image') {
            innerForm = <ImagePreprocessing />;
        } else if (type === 'imagenet') {
            innerForm = <ImageNetPreprocessing />;
        }

        return (
            <div>
                Preprocessing
                <form>
                    <select value={this.state.type} onChange={this.handleChange}>
                        <option value='none' >No Preprocessing</option>
                        <option value='plugin' >Plugin</option>
                        <option value='image' >Neural Monkey Image Preprocessing</option>
                        <option value='imagenet' >Neural Monkey ImageNet Preprocessing</option>
                    </select>
                </form>
                {innerForm}
            </div>
        );
    }
}

function ImagePreprocessing() {
    return (
        <div>
            <form>
                prefix: <input type="text" name="prefix" /><br/>
                padded width: <input type="number" name="padW" /><br/>
                padded height: <input type="number" name="padH" /><br/>
                rescaled height: <input type="number" name="rescaleW" /><br/>
                rescaled width: <input type="number" name="rescaleH" /><br/>
                channels: <input type="number" name="channels" /><br/>
                keep aspect ratio: <input type="text" name="keepAspectRatio" /><br/>
                mode: <input type="text" name="mode" /><br/>
            </form>
        </div>
    );
}

function ImageNetPreprocessing() {
    return (
        <div>
            <form>
                prefix: <input type="text" name="prefix" /><br/>
                target width: <input type="number" name="width" /><br/>
                target height: <input type="number" name="height" /><br/>
                VGG normalization: <input type="text" name="vggNorm" /><br/>
                zero-one normalization: <input type="text" name="zeroOneNorm" /><br/>
            </form>
        </div>
    );
}

class FeatureExtractionForm extends React.Component {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(key, value) {
        let cfg = this.props.featureCfg;
        cfg[key] = value;
        this.props.onCfgChange(cfg);
    }

    render() {
        const opts = this.props.featureCfgOpts;
        const cfg = this.props.featureCfg;
        const type  = cfg.type;
        const handlePluginChange = (e) => this.handleChange('plugin', e.target.value);
        const handleKerasChange = (value) => this.handleChange('keras', value);
        const handleSlimChange = (value) => this.handleChange('tfSlim', value);
        const handleTypeChange = (e) => this.handleChange('type', e.target.value);
        let innerForm = null;


        if (type === 'plugin') {
            innerForm = <PluginForm pluginCfg={cfg.plugin} 
                onChange={handlePluginChange} />;
        } else if (type === 'keras') {
            innerForm = <KerasFeatureExtractor kerasCfg={cfg.keras} kerasOpts={opts.keras}
                onChange={handleKerasChange} />;
        } else if (type === 'neuralmonkey') {
            innerForm = <NeuralMonkeyFeatureExtractor slimCfg={cfg.tfSlim} slimOpts={opts.tfSlim} 
                onChange={handleSlimChange} />;
        }

        return (
            <div>
                Feature Extraction
                <form>
                    <select value={type} 
                        onChange={handleTypeChange} >
                        <option value='none' >No Feature Extraction</option>
                        <option value='plugin' >Plugin</option>
                        <option value='keras' >Keras Feature Extractor</option>
                        <option value='neuralmonkey' >Neural Monkey - TF Slim Feature Extractor</option>
                    </select>
                </form>
                {innerForm}
            </div>
        );
    }
}

function KerasFeatureExtractor(props) {
    const nets = props.kerasOpts.nets;
    const netElems = nets.map((e) => <option key={e}>{e}</option>);
    const selNet = props.kerasCfg.netType;
    
    const changeNet = (e) => {
        let cfg = props.kerasCfg;
        cfg['netType'] = e.target.value;
        props.onChange(cfg);
    }
    
    return (
        <div>
            <form>
                network: <select name="net" value={selNet} onChange={changeNet} >
                    {netElems}
                </select>
            </form>
        </div>
    );
}

class NeuralMonkeyFeatureExtractor extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(key, value) {
        let cfg = this.props.slimCfg;
        cfg[key] = value;
        this.props.onChange(cfg);
    }

    render() {
        const cfg = this.props.slimCfg;
        const nets = this.props.slimOpts.nets.map((n) => <option key={n.id}>{n.id}</option>);
        const maps = this.props.slimOpts.nets.filter((n) => n.id === cfg.netType)[0].maps
            .map((m) => <option key={m}>{m}</option>);
        const changeNet = (e) => this.handleChange('netType', e.target.value);
        const changeCkpt = (e) => this.handleChange('modelCkpt', e.target.value);
        const changeMap = (e) => this.handleChange('featureMap', e.target.value);

        return (
            <div>
                <form>
                    network: <select name="net" value={cfg.netType} onChange={changeNet} >
                        {nets}
                    </select>
                    <br/>
                    checkpoint path: <input type="text" name="ckpt" value={cfg.modelCkpt} onChange={changeCkpt} />
                    <br/>
                    feature map: <select name="featureMap" value={cfg.featureMap} onChange={changeMap} >
                        {maps}
                    </select>
                </form>
            </div>
        );
    }
}

class ModelForm extends React.Component {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(key, value) {
        let cfg = this.props.modelCfg;
        cfg[key] = value;
        this.props.onCfgChange(cfg);
    }

    render() {
        const modelType = this.props.modelCfg.type;
        const cfg = this.props.modelCfg;
        const handleTypeChange = (event) => this.handleChange('type', event.target.value);
        const handleNMChange = (value) => this.handleChange('neuralMonkey', value);
        const handlePluginChange = (value) => this.handleChange('plugin', value);
        let innerForm = null;
        
        if (modelType === 'neuralmonkey') {
            innerForm = <NeuralMonkeyModel nmCfg={cfg.neuralMonkey} 
                                            nmOpts={this.props.modelCfgOpts.neuralMonkey} 
                                            onChange={handleNMChange} />;
        } else if (modelType === 'plugin') {
            innerForm = <PluginForm pluginCfg={cfg.plugin} onChange={handlePluginChange} />;
        }

        return (
            <div>
                Model
                <form>
                    <select value={modelType} onChange={handleTypeChange} >
                        <option value="neuralmonkey" >Neural Monkey Model</option>
                        <option value="plugin" >Plugin</option>
                    </select>
                </form>
                {innerForm}
            </div>
        );
    }
}

class NeuralMonkeyModel extends React.Component {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(key, value) {
        let cfg = this.props.nmCfg;
        cfg[key] = value;
        this.props.onChange(cfg);
    }

    render() {
        const cfg = this.props.nmCfg;
        const imageSerieChange = (e) => this.handleChange('imageSeries', e.target.value);
        const featureSerieChange = (e) => this.handleChange('featureSeries', e.target.value);
        const srcCaptionSerieChange = (e) => this.handleChange('srcCaptionSeries', e.target.value);
        const configPathChange = (e) => this.handleChange('configPath', e.target.value);
        const varsPathChange = (e) => this.handleChange('varsPath', e.target.value);

        return (
            <div>
                <form>
                    configuration file: <input type="text" name="config" 
                                                value={cfg.configPath} 
                                                onChange={configPathChange} />
                                    <br/>
                    variables file: <input type="text" name="vars" 
                                                value={cfg.varsPath} 
                                                onChange={varsPathChange} />
                                    <br/>
                    image series: <input type="checkbox" name="imageSeries" />
                                    <input type="text" 
                                            value={cfg.imageSeries} 
                                            onChange={imageSerieChange} />
                                    <br/>
                    feature series: <input type="checkbox" name="featureSeries" />
                                    <input type="text" 
                                            value={cfg.featureSeries} 
                                            onChange={featureSerieChange} />
                                    <br/>
                    source caption series: <input type="checkbox" name="srcCapSeries" />
                                    <input type="text" 
                                            value={cfg.srcCaptionSeries} 
                                            onChange={srcCaptionSerieChange} />
                                    <br/>
                </form>
            </div>
        );
    }
}

function PluginForm(props) {
    return (
        <div>
            <form>
                plugin source: <input type="text" name="src" />
            </form>
        </div>
    );
}


export { AddModelTab };