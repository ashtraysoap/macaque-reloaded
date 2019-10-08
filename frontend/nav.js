import PropTypes from 'prop-types';
import React from 'react';

export { Navigation, NavElement };


function Navigation(props) {
    const callback = props.onSelectedChange;

    let navElems = ['About', 'Configure', 'Datasets', 'Models'];
    navElems = navElems.map((e) => <NavElement 
        key={e}
        text={e}
        handleClick={callback}
    />);

    return (
        <div className="nav" >{navElems}</div>
    );
}

function NavElement(props) {
    return (
        <div className="navElement" 
            onClick={ () => props.handleClick(props.text) }>{props.text}</div>
    );
}

Navigation.propTypes = {
    onSelectedChange: PropTypes.func.isRequired
};

NavElement.propTypes = {
    text: PropTypes.string.isRequired,
    handleClick: PropTypes.func.isRequired,
};