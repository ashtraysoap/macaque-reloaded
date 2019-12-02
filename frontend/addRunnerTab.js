import React from 'react';
import PropTypes from 'prop-types';

import { AddSomethingTab } from './addSomethingTab.js';
import { SuccessTab, ErrorTab, PendingTab } from './statusTabs.js';

export { AddRunnerTab };


class AddRunnerTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "jelen v ruji",
            prepro: null,
            encoder: null,
            model: null
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
                this.setState({ status: "error" });
            } else {
                this.setState({ status: "ok" });
                let runnerIdx = this.props.addRunner(runnerCfg);
                if (Number(res.id) !== runnerIdx) {
                    console.log("Runner ids don't match!");
                }
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
                <label>name</label>
                <input 
                    type="text"
                    name="name"
                    value={s.name}
                    onChange={e => this.setState({ name: e.target.value })}
                />
                <br/>
                <label>preprocessor</label>
                <select value={s.prepro === null ? "none" : ps[s.prepro]} onChange={setPrepro}>
                    <option value='none'>none</option>
                    { ps.map(p => <option value={p} key={p}>{p}</option>) }
                </select>
                <br/>
                <label>encoder</label>
                <select value={s.encoder === null ? "none" : es[s.encoder]} onChange={setEncoder}>
                    <option value='none'>none</option>
                    { es.map(e => <option value={e} key={e}>{e}</option>) }
                </select>
                <br/>
                <label>model</label>
                <select value={s.model === null ? "none" : ms[s.model]} onChange={setModel}>
                    <option value='none'>none</option>
                    { ms.map(m => <option value={m} key={m}>{m}</option>) }
                </select>
                <br/>
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