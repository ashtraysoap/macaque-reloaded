import PropTypes from 'prop-types';
import React from 'react';

export { Navigation, NavElement };


function Navigation(props) {
    const callback = props.onSelectedChange;

    let navElems = ['Home', 'About'];
    if (!props.public)
        navElems = navElems.concat(['Configure', 'Datasets', 'Models']);

    navElems = navElems.map((e) => <NavElement 
        key={e}
        text={e}
        class={props.selected === e ? "selectedNav" : null}
        handleClick={callback}
    />);

    return (
        <div className="navigation">{navElems}</div>
    );
}

function NavElement(props) {
    return (
        <div className={props.class}
        onClick={ () => props.handleClick(props.text) }>{props.text}</div>
    );
}

Navigation.propTypes = {
    onSelectedChange: PropTypes.func.isRequired,
    selected: PropTypes.string.isRequired,
    public: PropTypes.bool.isRequired
};

NavElement.propTypes = {
    text: PropTypes.string.isRequired,
    handleClick: PropTypes.func.isRequired,
    class: PropTypes.string,
};