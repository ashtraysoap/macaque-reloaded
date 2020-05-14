import React from 'react';
import PropTypes from 'prop-types';

import { SidePanel } from './utils.js';

export { ConfigTab };


/**
 * Component responsiblo for providing the configuration interface
 * which serves for the user to create his own models, preprocessors,
 * etc.
 * 
 * Component State:
 *      selected: String. Identifies which input form is currently
 *              selected.
 * 
 * Component Props:
 *      prepro: Component. The component for adding a preprocessor.
 *      encoder: Component. The component for adding an encoder.
 *      model: Component. The component for adding a model.
 *      runner: Component. The component for adding a runner.
 *      dataset: Component. The component for adding a dataset.
 */
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