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
            name: "flickr8k",
            prefix: "/home/sam/Documents/CodeBox/BC/code/macaque/tests/data/flickr8k_sample_imgs",
            sources: "/home/sam/Documents/CodeBox/BC/code/macaque/tests/data/flickr8k_sample_imgs.txt",
            references: [],
            srcCaptions: "",
            batchSize: 32,
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
                hint="A path to a file with reference captions. Each line should contain
                    one caption. The association between captions and input elements is
                    made based on line numbers."
                handleChange={(e) => this.handleReferenceChange(e.target.value, idx)}
                key={idx.toString()}
            />
        );

        let statusTab = null;
        if (s.status === "waiting") {
            statusTab = <PendingTab text="neco delam"/>;
        } else if (s.status === "ok") {
            statusTab = <SuccessTab text="hezky"/>;
        } else if (s.status === "error") {
            statusTab = <ErrorTab text="spatny"/>
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
                        hint="A name for the dataset."
                        handleChange={(e) => this.handleChange("name", e.target.value)}
                    />
                    <InformativeInput
                        name="path prefix"
                        value={s.prefix}
                        optional={false}
                        error={s.errorLog.prefix}
                        hint="The path to the directory containing dataset element files."
                        handleChange={(e) => this.handleChange("prefix", e.target.value)}
                    />
                    <InformativeInput
                        name="sources"
                        value={s.sources}
                        optional={true}
                        error={s.errorLog.sources}
                        hint="The path to a file containing a list of dataset elements
                            to be used. Each line should contain one element given as its
                            corresponding filename."
                        handleChange={(e) => this.handleChange("sources", e.target.value)}
                    />
                    {refs}
                    <button onClick={this.addReference}>add reference</button>
                    <br/>
                    <button onClick={this.handleDatasetSubmit}>load dataset</button>

                    {statusTab}
                </div>
            </AddSomethingTab>
        );
    }
}

AddDatasetTab.propTypes = {
    onServerResponse: PropTypes.func.isRequired
};