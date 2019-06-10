class App extends React.Component {
    constructor(props) {
        super(props);
        this.handleNavClick = this.handleNavClick.bind(this);
        this.state = {
            models: props.state.models,
            datasets: props.state.datasets,
            selected_tab: 'home'
        }
    }

    handleNavClick(tab_key) {
        this.setState({selected_tab: tab_key});
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
            'add model': <AddModelTab />,
            'add dataset': <AddDatasetTab />,
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
            tab = <DatasetTab dataset={get_element(datasets)} />;
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
    console.log(props.navs);
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
    let elements = props.dataset.elements.map((e) => <div key={e.id}>{e.srcPath}</div>);
    
    return (
        <div>
            {elements}
        </div>
    );
}

function ModelTab(props) {
    return <div>Meh for now</div>;
}

function HomeTab() {
    return <Tab text="This is the home tab" />;
}

function AddModelTab() {
    return <Tab text="Options for adding a new model" />;
}

function AddMetricTab() {
    return <Tab text="Options for adding a new metric" />;
}

class AddDatasetTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            imgDir: "",
            imgSrcs: "",
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
        // let refs = this.state.refCaps.split(/\r?\n/);
        // let s = this.state;
        // s[refCaps] = refs;
        // this.props.onSubmit(s);
        console.log('Clicked dat button. Fetching...');
         
        const s = this.state;
        fetch('/add_dataset', {
            method: 'POST',
            body: JSON.stringify(s),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => res.json())
        .then(response => console.log('Success:', JSON.stringify(response)))
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
                    <label>
                        Image directory: 
                        <input name="imgDir" type="text" value={this.state.imgDir} onChange={(e) => this.handleChange("imgDir", e)} />
                    </label>
                    <label>
                        Image sources: 
                        <input name="imgSrcs" type="text" value={this.state.imgSrcs} onChange={(e) => this.handleChange("imgSrcs", e)} />
                    </label>
                    <label>
                        Source captions: 
                        <input name="srcCaps" type="text" value={this.srcCaps} onChange={(e) => this.handleChange("srcCaps", e)} />
                    </label>
                    <label>
                        Reference captions: 
                        <textarea name="refCaps" value={this.state.refCaps} onChange={(e) => this.handleChange("refCaps", e)} />
                    </label>
                    <label>
                        Batch size:
                        <input name="batchSize" type="number" value={this.state.batchSize} onChange={(e) => this.handleChange("batchSize", e)} />
                    </label>
                </form>
                <button type="button" onClick={this.submitDatasetConfig} >Create dataset</button>
            </div>
        );
    }
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
            {id:0, srcPath: "/home/img_0.jpg"},
            {id:1, srcPath: "/london/img_1.jpg"},
            {id:2, srcPath: "/paris/texas/img_2.jpg"}
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