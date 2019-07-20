import ReactDOM from 'react-dom';
import React from 'react';

function App(props) {
    return (
        <div>Hello mylords</div>
    );
}

// import { Nav, NavElement } from 'nav.js'; 

// class App extends React.Component {
//     constructor(props) {
//         super(props);
//         this.handleNavClick = this.handleNavClick.bind(this);
//         this.addDataset = this.addDataset.bind(this);
//         this.addModel = this.addModel.bind(this);
//         this.state = {
//             models: props.state.models,
//             datasets: props.state.datasets,
//             selected_tab: 'home'
//         }
//     }

//     handleNavClick(tab_key) {
//         this.setState({selected_tab: tab_key});
//     }

//     addDataset(dataset) {
//         let datasets = this.state.datasets;
//         datasets.push(dataset);
//         this.setState({datasets: datasets});
//     }

//     addModel(model) {
//         let models = this.state.models;
//         models.push(model);
//         this.setState({models: models});
//     }
    
//     render() {
//         let models = this.state.models;
//         let datasets = this.state.datasets;
//         let model_names = models.map((model) => model.name);
//         let dataset_names = datasets.map((ds) => ds.name);
//         let selected_tab = this.state.selected_tab;
//         let tab;

//         const default_tabs = {
//             'home': <HomeTab />,
//             'add model': <AddModelTab onSubmit={this.addModel} />,
//             'add dataset': <AddDatasetTab onSubmit={this.addDataset} />,
//             'add metric': <AddMetricTab />
//         };

//         let model_navs = model_names.map((name) =>
//             <NavElement key={name} textsauce={name} onClick={this.handleNavClick} />
//         );
//         let dataset_navs = dataset_names.map((name) =>
//             <NavElement key={name} textsauce={name} onClick={this.handleNavClick} />
//         );

//         let navs = [<NavElement key="home" textsauce="home" onClick={this.handleNavClick} />];
//         navs = navs.concat(model_navs).concat(dataset_navs);
//         //navs.unshift(<NavElement key="home" textsauce="home" onClick={this.handleNavClick} />);
//         navs.push(<NavElement key="add metric" textsauce="add metric" onClick={this.handleNavClick} />);
//         navs.push(<NavElement key="add model" textsauce="add model" onClick={this.handleNavClick} />);
//         navs.push(<NavElement key="add dataset" textsauce="add dataset" onClick={this.handleNavClick} />);
//         //const def_navs = 

//         function get_element(where) {
//             return where.filter((x) => x.name === selected_tab)[0];
//         }

//         if (default_tabs.hasOwnProperty(selected_tab)) {
//             tab = default_tabs[selected_tab];
//         } else if (model_names.includes(selected_tab)) {
//             tab = <ModelTab model={get_element(models)} />;
//         } else if (dataset_names.includes(selected_tab)) {
//             tab = <DatasetTab dataset={get_element(datasets)} models={models} />;
//         } else {
//             tab = <Tab text={selected_tab} />;
//         }

//         return (
//             <div>
//             <Nav navs={navs} />
//             <hr></hr>
//             {tab}
//             </div>
//         );
//     }
//   }

let state = {}

ReactDOM.render(
    <App state={state} />,
    document.getElementById('root')
);