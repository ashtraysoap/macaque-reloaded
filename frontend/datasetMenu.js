import PropTypes from 'prop-types';
import React from 'react';

export { DatasetMenu };


class DatasetMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
        this.props.modelNames.forEach(m => this.state[m] = false);
        this.runModelsOnDataset = this.runModelsOnDataset.bind(this);
    }
    
    runModelsOnDataset() {
        const msg = {
            dataset: this.props.datasetName,
            models: Object.keys(this.state).filter(x => this.state[x])
        }
        // unselect chosen models for next time
        this.props.modelNames.forEach(m => this.state[m] = false);
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
            this.props.onServerResponse(response);
        })
        .catch(error => console.log('Error:', error));
    }
    
    render() {
        const models = this.props.modelNames;
        const buttons = models.map(m => <div key={m} 
            onClick={() => { console.log(`Selected model: ${m}`); this.state[m] = !this.state[m];}}>
            {m}
            </div>);

        return (
            <div>
                {buttons}
                <button onClick={this.runModelsOnDataset}>Run</button>
            </div>
        );
    }
}

DatasetMenu.propTypes = {
    datasetName: PropTypes.string.isRequired,
    modelNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    onServerResponse: PropTypes.func.isRequired
};