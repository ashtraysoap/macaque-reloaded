import PropTypes from 'prop-types';
import React from 'react';


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
                <label onClick={this.onLabelClick} >{labelText}</label>
                <input type="text" value={this.props.value} onChange={this.props.handleChange} />
                {this.state.clicked &&
                    <div>
                        {this.props.hint}
                    </div>
                }
                {this.props.error &&
                    <div>
                        {this.props.error}
                    </div>
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

InformativeInput.propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    optional: PropTypes.bool.isRequired,
    handleChange: PropTypes.func.isRequired,
    hint: PropTypes.string,
    error: PropTypes.string
};

TableRow.propTypes = {
    entries: PropTypes.arrayOf(PropTypes.string).isRequired
};

export { InformativeInput, TableRow };