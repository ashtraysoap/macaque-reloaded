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

InformativeInput.propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    optional: PropTypes.bool.isRequired,
    handleChange: PropTypes.func.isRequired,
    hint: PropTypes.string,
    error: PropTypes.string
}

export { InformativeInput };