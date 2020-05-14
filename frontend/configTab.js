import React from 'react';
import PropTypes from 'prop-types';

import { SidePanel } from './utils.js';

export { ConfigTab };


class ConfigTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: 'dataset'
        };
    }

    render() {
        const p = this.props;
        const sel = this.state.selected;
        let main;

        if (sel === "dataset") {
            main = p.dataset;
        } else if (sel === "prepro") {
            main = p.prepro;
        } else if (sel === "encoder") {
            main = p.encoder;
        } else if (sel === "model") {
            main = p.model;
        } else if (sel === "runner") {
            main = p.runner;
        }


        return (
            <div className="configTab">
                <SidePanel
                    label="Configuration"
                    keys={["dataset", "prepro", "encoder", "model", "runner"]}
                    values={["add dataset", "add preprocessor", "add encoder", "add model", "add runner"]}
                    callback={(key) => this.setState({selected: key})}
                    selectedKey={sel}
                />
                <div>
                    {main}
                </div>
            </div>
        );
    }
}

ConfigTab.propTypes = {
    prepro: PropTypes.object.isRequired,
    encoder: PropTypes.object.isRequired,
    model: PropTypes.object.isRequired,
    runner: PropTypes.object.isRequired,
    dataset: PropTypes.object.isRequired
};