import React from 'react';
import PropTypes from 'prop-types';

export { AddRunnerTab };


class AddRunnerTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "krtek",
            prepro: null,
            encoder: null,
            model: null
        };
        this.addRunner = this.addRunner.bind(this);
    }

    addRunner() {
        console.log(this.state);
        const runnerCfg = this.state;
        fetch('/add_runner', {
            method: 'POST',
            body: JSON.stringify(runnerCfg),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => res.text())
        .then(serverRunnerIdx => {
            let runnerIdx = this.props.addRunner(runnerCfg);
            if (Number(serverRunnerIdx) !== runnerIdx) {
                console.log("Runner ids don't match!");
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

        return (
            <div>
                <label>Runner</label>
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
                <input 
                    type="text"
                    name="name"
                    value={s.name}
                    onChange={e => this.setState({ name: e.target.value })}
                />
                <br/>
                <button onClick={this.addRunner}>Add run configuration</button>
            </div>
        );
    }
}

AddRunnerTab.propTypes = {
    preprocessors: PropTypes.array.isRequired,
    encoders: PropTypes.array.isRequired,
    models: PropTypes.array.isRequired,
    addRunner: PropTypes.func.isRequired
};