class App extends React.Component {
    constructor(props) {
        super(props);
        this.handleNavClick = this.handleNavClick.bind(this);
        this.state = {
            models: props.state.models,
            selected_tab: 'home'
        }
    }

    handleNavClick(tab_key) {
        this.setState({selected_tab: tab_key});
    }
    
    render() {
        let models = this.state.models;
        let names = models.map((model) => model.name);
        let selected_tab = this.state.selected_tab;
        let tab;

        const default_tabs = {
            'home': <HomeTab />,
            'add model': <AddModelTab />,
            'add dataset': <AddDatasetTab />,
            'add metric': <AddMetricTab />
        };

        let navs = names.map((name) =>
            <NavElement key={name} textsauce={name} onClick={this.handleNavClick} />
        );

        navs.unshift(<NavElement key="home" textsauce="home" onClick={this.handleNavClick} />);
        navs.push(<NavElement key="add metric" textsauce="add metric" onClick={this.handleNavClick} />);
        navs.push(<NavElement key="add model" textsauce="add model" onClick={this.handleNavClick} />);
        navs.push(<NavElement key="add dataset" textsauce="add dataset" onClick={this.handleNavClick} />);
        //const def_navs = 

        console.log(names);

        if (default_tabs.hasOwnProperty(selected_tab)) {
            tab = default_tabs[selected_tab];
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

function HomeTab() {
    return <Tab text="This is the home tab" />;
}

function AddModelTab() {
    return <Tab text="Options for adding a new model" />;
}

function AddMetricTab() {
    return <Tab text="Options for adding a new metric" />;
}

// function AddDatasetTab() {
//     //return <Tab text="Options for adding a new dataset" />;
//     return (
//         <div>

//         </div>
//     );
// }

class AddDatasetTab extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <label>Add a new Dataset</label>
                <form>
                    <label>Image directory: <input name="img_sources" type="text" /></label>
                    <label>Image sources: <input name="img_sources" type="text" /></label>
                    <label>Source captions: <input name="src_captions" type="text" /></label>
                    <label>Reference captions: <textarea name="references" /></label>
                </form>
                <button type="button">Load dataset</button>
            </div>
        );
    }
}

  
const state = {
    models: [
        {name: 'Model A'},
        {name: 'Model B'}
    ]
};
          
ReactDOM.render(
    <App state={state} />,
    document.getElementById('root')
);