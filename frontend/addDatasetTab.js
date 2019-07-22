import PropTypes from 'prop-types';
import React from 'react';

import { InformativeInput } from './utils.js';


class AddDatasetTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            prefix: "",
            sources: "",
            references: []
        }
        this.handleChange = this.handleChange.bind(this);
        this.addReference = this.addReference.bind(this);
        this.handleReferenceChange = this.handleReferenceChange.bind(this);
        this.handleDatasetSubmit = this.handleDatasetSubmit.bind(this);
    }

    handleChange(k, v) {
        let o = {};
        o[k] = v;
        this.setState(o);
    }

    addReference() {
        let refs = this.state.references;
        refs.push("");
        this.setState({ references: refs });
    }

    handleReferenceChange(ref, idx) {
        let refs = this.state.references;
        refs[idx] = ref;
        this.setState({ references: refs });
    }

    handleDatasetSubmit() {         
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
        const s = this.state;
        const refs = s.references.map((r, idx) => 
            <InformativeInput
                name={"reference #".concat(idx.toString())}
                value={r}
                optional={true}
                hint="A path to a file with reference captions. Each line should contain
                    one caption. The association between captions and input elements is
                    made based on line numbers."
                handleChange={(e) => this.handleReferenceChange(e.target.value, idx)}
                key={idx.toString()}
            />
        );

        return (
            <div>
                <InformativeInput
                    name="dataset name"
                    value={s.name}
                    optional={false}
                    hint="A name for the dataset."
                    handleChange={(e) => this.handleChange("name", e.target.value)}
                />
                <InformativeInput
                    name="path prefix"
                    value={s.prefix}
                    optional={false}
                    hint="The path to the directory containing dataset element files."
                    handleChange={(e) => this.handleChange("prefix", e.target.value)}
                />
                <InformativeInput
                    name="sources"
                    value={s.sources}
                    optional={true}
                    hint="The path to a file containing a list of dataset elements
                        to be used. Each line should contain one element given as its
                        corresponding filename."
                    handleChange={(e) => this.handleChange("sources", e.target.value)}
                />
                {refs}
                <button onClick={this.addReference}>add reference</button>
                <br/>
                <button onClick={this.handleDatasetSubmit}>load dataset</button>
            </div>
        );
    }
}

AddDatasetTab.propTypes = {
    onSubmit: PropTypes.func.isRequired
};

export { AddDatasetTab };