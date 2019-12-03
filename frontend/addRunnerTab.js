import React from 'react';
import PropTypes from 'prop-types';

import { AddSomethingTab } from './addSomethingTab.js';
import { SuccessTab, ErrorTab, PendingTab } from './statusTabs.js';
import { InformativeInput, InformativeLabel } from './utils.js';

export { AddRunnerTab };


class AddRunnerTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "jelen v ruji",
            prepro: null,
            encoder: null,
            model: null,
            errorLog: {}
        };
        this.addRunner = this.addRunner.bind(this);
    }

    addRunner() {
        const runnerCfg = this.state;
        this.setState({ status: "waiting" });

        fetch('/add_runner', {
            method: 'POST',
            body: JSON.stringify(runnerCfg),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => res.json())
        .then(res => {
            if (res.id === undefined) {
                this.setState({ 
                    status: "error", 
                    errorLog: res.log
                });
            } else {
                this.setState({ 
                    status: "ok",
                    errorLog: {}
                });
                this.props.addRunner(runnerCfg);
            }
        })
        .catch(error => console.log('Error:', error));
    }

    render() {
        const p = this.props;
        const s = this.state;

        const ps = p.preprocessors.map(p => p.name);
        const es = p.encoders.map(e => e.name);
        const ms = p.models.map(m => m.name);

        const setPrepro = e => {
            this.setState({
                prepro: e.target.value === "none" ? null : ps.indexOf(e.target.value)
            });
        };
        const setEncoder = e => {
            this.setState({
                encoder: e.target.value === "none" ? null : es.indexOf(e.target.value)
            });
        };
        const setModel = e => {
            this.setState({
                model: e.target.value === "none" ? null : ms.indexOf(e.target.value)
            });
        };

        let statusTab = null;
        if (s.status === "ok") {
            statusTab = <SuccessTab text="hezky"/>;
        } else if (s.status === "error") {
            statusTab = <ErrorTab text="spatne"/>;
        } else if (s.status === "waiting") {
            statusTab = <PendingTab text="neco dela"/>;
        }

        return (
            <AddSomethingTab>
            <div>
                <div className="addModelPartLabel">Runner</div>
                
                <InformativeInput
                    name="text"
                    value={s.name}
                    optional={false}
                    handleChange={e => this.setState({ name: e.target.value })}
                    hint="The name of the runner."
                    error={s.errorLog.name}
                />

                <InformativeLabel
                    name="preprocessor"
                    hint=""
                    optional={false}>
                    <select value={s.prepro === null ? "none" : ps[s.prepro]} onChange={setPrepro}>
                        <option value='none'>none</option>
                        { ps.map(p => <option value={p} key={p}>{p}</option>) }
                    </select>    
                </InformativeLabel>

                <InformativeLabel name="encoder"
                    hint=""
                    optional={false}>
                    <select value={s.encoder === null ? "none" : es[s.encoder]} onChange={setEncoder}>
                        <option value='none'>none</option>
                        { es.map(e => <option value={e} key={e}>{e}</option>) }
                    </select>
                </InformativeLabel>

                <InformativeLabel
                    name="model"
                    hint=""
                    optional={false}>
                    <select value={s.model === null ? "none" : ms[s.model]} onChange={setModel}>
                        <option value='none'>none</option>
                        { ms.map(m => <option value={m} key={m}>{m}</option>) }
                    </select>
                </InformativeLabel>

                <button onClick={this.addRunner}>Add run configuration</button>
                
                {statusTab}
            </div>
            </AddSomethingTab>
        );
    }
}

AddRunnerTab.propTypes = {
    preprocessors: PropTypes.array.isRequired,
    encoders: PropTypes.array.isRequired,
    models: PropTypes.array.isRequired,
    addRunner: PropTypes.func.isRequired
};