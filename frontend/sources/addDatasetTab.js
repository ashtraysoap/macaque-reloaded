import PropTypes from 'prop-types';
import React from 'react';

import { InformativeInput } from './utils.js';
import { AddSomethingTab } from './addSomethingTab.js';
import { PendingTab, SuccessTab, ErrorTab } from './statusTabs.js';

export { AddDatasetTab };


class AddDatasetTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "flickr8k_sample",
            prefix: "./tests/data/flickr8k_sample_imgs",
            sources: "./tests/data/flickr8k_sample_imgs.txt",
            srcCaps: "",
            references: [],
            batchSize: "32",
            errorLog: {},
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
        this.setState({ status: "waiting" });

        fetch('/add_dataset', {
            method: 'POST',
            body: JSON.stringify(s),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => res.json())
        .then(response => {
            if (response.name === undefined) {
                this.setState({ 
                    errorLog: response.log,
                    status: "error"
                 });
            } else {
                this.setState({ 
                    status: "ok",
                    errorLog: {}
                });
                this.props.onServerResponse(response);   
            }
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
                error={s.errorLog.refs === undefined ? undefined : s.errorLog.refs[idx.toString()]}
                hint="A path to a file with reference captions. Each line should contain
                    one caption. The association between captions and input elements is
                    made based on line numbering."
                handleChange={(e) => this.handleReferenceChange(e.target.value, idx)}
                key={idx.toString()}
            />
        );

        let statusTab = null;
        if (s.status === "waiting") {
            statusTab = <PendingTab text="Processing."/>;
        } else if (s.status === "ok") {
            statusTab = <SuccessTab text="Dataset successfully created."/>;
        } else if (s.status === "error") {
            statusTab = <ErrorTab text="Error. Unable to create dataset."/>;
        }

        return (
            <AddSomethingTab>
                <div>
                    <div className="addModelPartLabel">Dataset</div>
                    <InformativeInput
                        name="dataset name"
                        value={s.name}
                        optional={false}
                        error={s.errorLog.name}
                        hint="A unique name for the dataset."
                        handleChange={(e) => this.handleChange("name", e.target.value)}
                    />
                    <InformativeInput
                        name="path prefix"
                        value={s.prefix}
                        optional={false}
                        error={s.errorLog.prefix}
                        hint="The path to the directory containing dataset element files.
                        If `sources` is not provided, all files of suitable format in the directory 
                        are used."
                        handleChange={(e) => this.handleChange("prefix", e.target.value)}
                    />
                    <InformativeInput
                        name="batch size"
                        value={s.batchSize}
                        optional={false}
                        error={s.errorLog.batchSize}
                        hint="The batch size. Dataset elements are fed to the model in sets of this size."
                        handleChange={(e) => this.handleChange("batchSize", e.target.value)}
                    />
                    <InformativeInput
                        name="sources"
                        value={s.sources}
                        optional={true}
                        error={s.errorLog.sources}
                        hint="Optional. The path to a file containing a list of dataset elements
                            to be used. Each line should contain one element given as its
                            corresponding filename."
                        handleChange={(e) => this.handleChange("sources", e.target.value)}
                    />
                    <InformativeInput
                        name="source captions"
                        value={s.srcCaps}
                        optional={true}
                        error={s.errorLog.srcCaps}
                        hint="Optional. The path to a file containing source captions for the dataset
                            to be used. Each line should contain one caption."
                        handleChange={(e) => this.handleChange("srcCaps", e.target.value)}
                    />
                    <button onClick={this.handleDatasetSubmit}>Add dataset</button>

                    {statusTab}
                </div>
            </AddSomethingTab>
        );
    }
}

AddDatasetTab.propTypes = {
    onServerResponse: PropTypes.func.isRequired
};