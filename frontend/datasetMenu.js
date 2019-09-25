import PropTypes from 'prop-types';
import React from 'react';

export { DatasetMenu };


class DatasetMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            runner: null
        };
        this.runOnDataset = this.runOnDataset.bind(this);
    }
    
    runOnDataset() {
        if (this.state.runner === null) return;

        fetch(`/run_on_dataset/${this.props.dataset}/${this.state.runner}`)
        .then(res => res.json())
        .then(response => {
            console.log('Success:', JSON.stringify(response));
            this.props.onServerResponse(response);
        })
        .catch(error => console.log('Error:', error));
    }
    
    render() {
        const runners = this.props.runnerNames;
        const buttons = runners.map(r => <div key={r} 
            onClick={() => this.setState({ runner: runners.indexOf(r) })}>
            {r}
            </div>
        );

        return (
            <div>
                {buttons}
                <button onClick={this.runOnDataset}>Run</button>
            </div>
        );
    }
}

DatasetMenu.propTypes = {
    dataset: PropTypes.number.isRequired,
    runnerNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    onServerResponse: PropTypes.func.isRequired
};