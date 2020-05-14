import PropTypes from 'prop-types';
import React from 'react';

export { InformativeInput, InformativeLabel, TableRow, SidePanel, 
    range, zip, enumerate, round, basename, wait, MultipleSelectionWithButton };


function range(n) {
    return [...Array(n).keys()];
}

function zip(x, y) {
    let z = []
    for (let i = 0; i < x.length; i++) {
        z.push([x[i], y[i]]);
    }
    return z;
}

function enumerate(list) {
    return zip(range(list.length), list);
}

function round(n) {
    return Math.round(n * 100) / 100
}

function basename(fp) {
    return fp.replace(/^.*[\\\/]/, '');
}

function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
      end = new Date().getTime();
   }
 }

class InformativeInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = { clicked: false };
        this.onLabelClick = this.onLabelClick.bind(this);
    }

    onLabelClick() {
        this.setState({ clicked: !this.state.clicked });
    }

    render() {
        const labelText = this.props.optional ? <i>{this.props.name}</i> : this.props.name;

        return (
            <div>
                <div className="informative">
                    <label onClick={this.onLabelClick} >{labelText}</label>
                    <input type="text" value={this.props.value} onChange={this.props.handleChange} />
                </div>
                {
                    this.state.clicked &&
                        <div className="hint">
                            {this.props.hint}
                        </div>
                }
                {   this.props.error &&
                        <div className="error">
                            {this.props.error}
                        </div>
                }
            </div>
        )
    }
}

class InformativeLabel extends React.Component {
    constructor(props) {
        super(props);
        this.state = { clicked: false };
        this.onLabelClick = this.onLabelClick.bind(this);
    }

    onLabelClick() {
        this.setState({ clicked: !this.state.clicked });
    }

    render() {
        const labelText = this.props.optional ? <i>{this.props.name}</i> : this.props.name;

        return (
            <div className="informative">
                <label onClick={this.onLabelClick} >{labelText}</label>
                {
                    this.props.children
                }
                {
                    this.state.clicked &&
                        <div className="hint">{this.props.hint}</div>
                }
                {
                    this.props.error &&
                        <div className="error">{this.props.error}</div>
                }
            </div>
        )
    }
}

function TableRow(props) {
    const divStyle = {
        display: 'inline-block',
        margin: '3px'
    }

    const es = props.entries.map(e => <div key={e.toString()} style={divStyle}>{e}</div>);

    return (
        <div>
            {es}
        </div>
    );
}

class SidePanel extends React.Component {

    render() {
        const p = this.props;
        let keys = p.keys.map(k => {

            if (k === p.selectedKey) {
                return (
                    <div 
                    key={k} 
                    onClick={() => p.callback(k)}
                    className="selected">
                    {p.values[p.keys.indexOf(k)]}
                    </div>
                );
            } else {
                return (
                    <div 
                    key={k} 
                    onClick={() => p.callback(k)}>
                    {p.values[p.keys.indexOf(k)]}
                    </div>
                );
            }
        });

        return (
            <div className="sideTab">
                <div className="addModelPartLabel">{p.label}</div>
                {keys}
            </div>
        );
    }
}

class MultipleSelectionWithButton extends React.Component {
    
    constructor(props) {
        super(props);
        this.onItemClick = this.onItemClick.bind(this);
        this.state = {
            selected: false,
            keys: []
        };
    }

    onItemClick(k) {
        let keys = this.state.keys;
        const i = keys.indexOf(k);
        i === -1 ? keys.push(k) : keys.splice(i, 1);
        this.setState({keys: keys});
    }

    render() {
        const p = this.props;
        const s = this.state;
        const sel = s.selected;
        const handleLabelClick = () => this.setState({selected: !sel});
        const handleButtonClick = () => p.onSubmit(s.keys);
        const labelClass = sel ? "selected" : "";

        let body = null;
        if (sel) {     
            const values = p.keys.map(k => {
                if (s.keys.indexOf(k) !== -1) {
                    return ( <div key={k}
                        className="selected"
                        onClick={() => this.onItemClick(k)}>
                        {p.values[p.keys.indexOf(k)]}
                    </div>);
                } else {
                    return (<div key={k}
                        onClick={() => this.onItemClick(k)}>
                        {p.values[p.keys.indexOf(k)]}
                    </div>);
                }
            });
            
            body = <div>
                {values}    
                <button onClick={handleButtonClick}>{p.buttonText}</button>
            </div>;
        }

        return (
            <div className="multiSel">
                <label onClick={handleLabelClick} className={labelClass}>{p.label}</label>
                <hr/>
                {body}
            </div>
        );
    }
}


InformativeInput.propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    optional: PropTypes.bool.isRequired,
    handleChange: PropTypes.func.isRequired,
    hint: PropTypes.string,
    error: PropTypes.string
};

InformativeLabel.propTypes = {
    name: PropTypes.string.isRequired,
    optional: PropTypes.bool.isRequired,
    children: PropTypes.object.isRequired,
    hint: PropTypes.string,
    error: PropTypes.string
};

TableRow.propTypes = {
    entries: PropTypes.arrayOf(PropTypes.string).isRequired
};

SidePanel.propTypes = {
    label: PropTypes.string.isRequired,
    keys: PropTypes.arrayOf(PropTypes.string).isRequired,
    values: PropTypes.arrayOf(PropTypes.any).isRequired,
    callback: PropTypes.func.isRequired,
    selectedKey: PropTypes.string.isRequired
}

MultipleSelectionWithButton.propTypes = {
    label: PropTypes.string.isRequired,
    keys: PropTypes.arrayOf(PropTypes.string).isRequired,
    values: PropTypes.arrayOf(PropTypes.any).isRequired,
    onSubmit: PropTypes.func.isRequired,
    buttonText: PropTypes.string.isRequired
}