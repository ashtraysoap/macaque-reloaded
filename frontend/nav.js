import PropTypes from 'prop-types';
import React from 'react';


class Navigation extends React.Component {
    render() {
        const props = this.props;
        const callback = props.onSelectedChange;

        const defaults = props.defaultNames.map((e) => <NavElement 
            key={e} 
            text={e} 
            handleClick={callback}
            styleClass="defaultNavElement"
        />);

        const datasets = props.datasetNames.map((e) => <NavElement 
            key={e} 
            text={e} 
            handleClick={callback}
            styleClass="datasetNavElement"
        />);

        const models = props.modelNames.map((e) => <NavElement 
            key={e} 
            text={e} 
            handleClick={callback}
            styleClass="modelNavElement"
        />);

        const elements = defaults.concat(models).concat(datasets);

        return (
            <div className="nav" >{elements}</div>
        );
    }
}

class NavElement extends React.Component {
    render() {
        const text = this.props.text;
        const styleClass = this.props.styleClass;
        return (
            <div className={"navElement" + " " + styleClass} 
                onClick={ () => this.props.handleClick(text) }>{text}</div>
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
    handleClick: PropTypes.func.isRequired,
    styleClass: PropTypes.string
};

export { Navigation, NavElement };