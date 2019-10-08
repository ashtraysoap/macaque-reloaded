import React from 'react';
import PropTypes from 'prop-types';

import { AddPreproTab } from './addPreproTab.js';
import { AddEncoderTab } from './addEncoderTab.js';
import { AddModelTab } from './newAddModelTab.js';
import { AddRunnerTab } from './addRunnerTab.js';
import { SidePanel } from './utils.js';

export { ConfigTab };


// function ConfigTab(props) {
//     return (
//         <div className="configTab">
//             {props.children}
//         </div>
//     )
// }

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
                    keys={["add dataset", "add preprocessing", "add encoder", "add model", "add runner"]}
                    values={["dataset", "prepro", "encoder", "model", "runner"]}
                    callback={(val) => this.setState({selected: val})}
                    selectedKey={sel}
                />
                <div className="centerTab">
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