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

        const runners = props.runnerNames.map((e) => <NavElement 
            key={e} 
            text={e} 
            handleClick={callback}
            styleClass="runnerNavElement"
        />);

        const elements = defaults.concat(runners).concat(datasets);

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
    runnerNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    defaultNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    onSelectedChange: PropTypes.func.isRequired
};

NavElement.propTypes = {
    text: PropTypes.string.isRequired,
    handleClick: PropTypes.func.isRequired,
    styleClass: PropTypes.string
};

export { Navigation, NavElement };