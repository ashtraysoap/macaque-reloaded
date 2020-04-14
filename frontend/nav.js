import PropTypes from 'prop-types';
import React from 'react';

export { Navigation, NavElement };


function Navigation(props) {
    const callback = props.onSelectedChange;

    let navElems = ['About', 'Configure', 'Datasets'];
    navElems = navElems.map((e) => <NavElement 
        key={e}
        text={e}
        class={props.selected === e ? "navElementSel" : "navElement"}
        handleClick={callback}
    />);

    return (
        <div className="nav" >{navElems}</div>
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
    selected: PropTypes.string.isRequired
};

NavElement.propTypes = {
    text: PropTypes.string.isRequired,
    class: PropTypes.string.isRequired,
    handleClick: PropTypes.func.isRequired,
};