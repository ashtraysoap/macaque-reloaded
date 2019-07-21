import PropTypes from 'prop-types';
import React from 'react';


class Navigation extends React.Component {
    render() {
        const p = this.props;
        let cb = p.onSelectedChange;
        let names = p.datasetNames.concat(p.modelNames).concat(p.defaultNames);
        let elems = names.map((e) => <NavElement key={e} text={e} handleClick={cb}/>);

        return (
            <div>{elems}</div>
        );
    }
}

class NavElement extends React.Component {
    render() {
        const text = this.props.text;
        return (
            <div onClick={ () => this.props.handleClick(text) }>{text}</div>
        );
    }
}

Navigation.propTypes = {
    datasetNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    modelNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    defaultNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    onSelectedChange: PropTypes.func.isRequired
};

NavElement.propTypes = {
    text: PropTypes.string.isRequired,
    handleClick: PropTypes.func.isRequired
};

export { Navigation, NavElement };