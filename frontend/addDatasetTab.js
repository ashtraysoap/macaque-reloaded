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
    }

    handleChange(k, v) {
        let o = {};
        o[k] = v;
        this.setState(o);
    }

    render() {
        const s = this.state;

        return (
            <div>
                <InformativeInput
                    name="dataset name"
                    value={s.name}
                    optional={false}
                    hint="A name for the dataset."
                    handleChange={(e) => this.handleChange("name", e.target.value)}
                />
            </div>
        );
    }
} 

export { AddDatasetTab };