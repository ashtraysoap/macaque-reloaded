class App extends React.Component {
    constructor(props) {
        super(props);
        this.handleNavClick = this.handleNavClick.bind(this);
        this.addDataset = this.addDataset.bind(this);
        this.addModel = this.addModel.bind(this);
        this.state = {
            models: props.state.models,
            datasets: props.state.datasets,
            selected_tab: 'home'
        }
    }

    handleNavClick(tab_key) {
        this.setState({selected_tab: tab_key});
    }

    addDataset(dataset) {
        let datasets = this.state.datasets;
        datasets.push(dataset);
        this.setState({datasets: datasets});
    }

    addModel(model) {
        let models = this.state.models;
        models.push(model);
        this.setState({models: models});
    }
    
    render() {
        let models = this.state.models;
        let datasets = this.state.datasets;
        let model_names = models.map((model) => model.name);
        let dataset_names = datasets.map((ds) => ds.name);
        let selected_tab = this.state.selected_tab;
        let tab;

        const default_tabs = {
            'home': <HomeTab />,
            'add model': <AddModelTab onSubmit={this.addModel} />,
            'add dataset': <AddDatasetTab onSubmit={this.addDataset} />,
            'add metric': <AddMetricTab />
        };

        let model_navs = model_names.map((name) =>
            <NavElement key={name} textsauce={name} onClick={this.handleNavClick} />
        );
        let dataset_navs = dataset_names.map((name) =>
            <NavElement key={name} textsauce={name} onClick={this.handleNavClick} />
        );

        let navs = [<NavElement key="home" textsauce="home" onClick={this.handleNavClick} />];
        navs = navs.concat(model_navs).concat(dataset_navs);
        //navs.unshift(<NavElement key="home" textsauce="home" onClick={this.handleNavClick} />);
        navs.push(<NavElement key="add metric" textsauce="add metric" onClick={this.handleNavClick} />);
        navs.push(<NavElement key="add model" textsauce="add model" onClick={this.handleNavClick} />);
        navs.push(<NavElement key="add dataset" textsauce="add dataset" onClick={this.handleNavClick} />);
        //const def_navs = 

        function get_element(where) {
            return where.filter((x) => x.name === selected_tab)[0];
        }

        if (default_tabs.hasOwnProperty(selected_tab)) {
            tab = default_tabs[selected_tab];
        } else if (model_names.includes(selected_tab)) {
            tab = <ModelTab model={get_element(models)} />;
        } else if (dataset_names.includes(selected_tab)) {
            tab = <DatasetTab dataset={get_element(datasets)} models={models} />;
        } else {
            tab = <Tab text={selected_tab} />;
        }

        return (
            <div>
            <Nav navs={navs} />
            <hr></hr>
            {tab}
            </div>
        );
    }
  }
  
function Nav(props) {
    return (
        <div>
            <h1>Le titulok</h1>
            <ul>
            {props.navs}
            </ul>
        </div>
    );
}

class NavElement extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.props.onClick(this.props.textsauce);
    }

    render() {
        return <li onClick={this.handleClick}>{this.props.textsauce}</li>;
    }
}
  
function Tab(props) {
    return (
        <div>{props.text}</div>
    );
}

function DatasetTab(props) {
    let elements = props.dataset.elements.map((e) => <div key={e.id}>{e.source}</div>);
    
    return (
        <div>
            <RunOnDatasetTab dataset={props.dataset} models={props.models} />
            <hr/>
            {elements}
        </div>
    );
}

class RunOnDatasetTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = { selectedModels: {}, selectedMetrics: {} };
        this.props.models.forEach((m) => this.state.selectedModels[m.name] = true);

        this.handleRunModelsClick = this.handleRunModelsClick.bind(this);
        this.handleEvaluateMetricsClick = this.handleEvaluateMetricsClick.bind(this);
        this.onModelChange = this.onModelChange.bind(this);
    }

    handleRunModelsClick() {         
        const modelEntries = Object.entries(this.state.selectedModels);
        let modelNames = modelEntries.filter((x) => x[1] === true).map((x) => x[0]);
        let msg = {
            dataset: this.props.dataset.name,
            models: modelNames
        };
        console.log(msg);

        fetch('/run_model_on_dataset', {
            method: 'POST',
            body: JSON.stringify(msg),
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

    handleEvaluateMetricsClick() {

    }

    onModelChange(model) {
        let models = this.state.selectedModels;
        models[model] = !models[model];
        this.setState({ selectedModels: models });
    }

    render() {
        // debug log to know which models are selected, later change div appearence by css on clicks
        console.log(this.state.selectedModels);

        const modelCheckBoxes = this.props.models.map((m) => 
            <CheckBoxElement key={m.name} value={m.name} onModelChange={() => this.onModelChange(m.name)} />);

        return (
            <div>
                {modelCheckBoxes}
                <button onClick={this.handleRunModelsClick} >Run models on dataset</button>
                <hr/>
                {/* {metrics} */}
                <button onClick={this.handleRunModelsClick} >Evaluate metrics on dataset</button>
            </div>
        );
    }
}

function CheckBoxElement(props) {
    return (
        <div onClick={props.onModelChange}>
            {props.value}
            <br/>
        </div>
    );
}

function ModelTab(props) {
    return <div>Meh for now</div>;
}

function HomeTab() {
    return <Tab text="This is the home tab" />;
}


function AddMetricTab() {
    return <Tab text="Options for adding a new metric" />;
}

class AddDatasetTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "Experimental_Transcendental",
            imgDir: "/home/sam/Documents/CodeBox/BC/code/",
            imgSrcs: "/home/sam/Documents/CodeBox/BC/code/macaque/list.txt",
            srcCaps: "",
            refCaps: "",
            batchSize: 32
        }
        this.handleChange = this.handleChange.bind(this);
        this.submitDatasetConfig = this.submitDatasetConfig.bind(this);
    }

    handleChange(name, event) {
        let s = this.state;
        s[name] = event.target.value;
        this.setState(s);
    }

    submitDatasetConfig() {
        console.log('Fetching...');
         
        const s = this.state;
        fetch('/add_dataset', {
            method: 'POST',
            body: JSON.stringify(s),
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

    render() {
        return (
            <div>
                <label>Add a new Dataset</label>
                <form>
                    <label>
                        Dataset name:
                        <input name="name" type="text" value={this.state.name} onChange={(e) => this.handleChange("name", e)} />
                    </label>
                    <br/>
                    <label>
                        Image directory: 
                        <input name="imgDir" type="text" value={this.state.imgDir} onChange={(e) => this.handleChange("imgDir", e)} />
                    </label>
                    <br/>
                    <label>
                        Image sources: 
                        <input name="imgSrcs" type="text" value={this.state.imgSrcs} onChange={(e) => this.handleChange("imgSrcs", e)} />
                    </label>
                    <br/>
                    <label>
                        Source captions: 
                        <input name="srcCaps" type="text" value={this.srcCaps} onChange={(e) => this.handleChange("srcCaps", e)} />
                    </label>
                    <br/>
                    <label>
                        Reference captions: 
                        <textarea name="refCaps" value={this.state.refCaps} onChange={(e) => this.handleChange("refCaps", e)} />
                    </label>
                    <br/>
                    <label>
                        Batch size:
                        <input name="batchSize" type="number" value={this.state.batchSize} onChange={(e) => this.handleChange("batchSize", e)} />
                    </label>
                </form>
                <br/>
                <button onClick={this.submitDatasetConfig} >Create dataset</button>
            </div>
        );
    }
}

function AddModelTab(props) {
    return (
        <div>
            <TaskForm onSubmit={props.onSubmit}/>
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

const state = {
    models: [
        {name: 'Model A'},
        {name: 'Model B'}
    ],
    datasets: [
    {
        name: 'Dataset X',
        elements: [
            {id:0, source: "/home/img_0.jpg"},
            {id:1, source: "/london/img_1.jpg"},
            {id:2, source: "/paris/texas/img_2.jpg"}
        ]
    },{
        name: 'Dataset Y',
        elements: []
    }]
};

ReactDOM.render(
    <App state={state} />,
    document.getElementById('root')
);