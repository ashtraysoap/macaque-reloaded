import PropTypes from 'prop-types';
import React from 'react';

export { Navigation };


/**
 * Function component displaying application navigation.
 * 
 * Component Props:
 *      onSelectedChange: Function. Handles clicking on navigation elements.
 *      selected: String. The currently selected tab.
 *      public: Boolean. Whether the application is running on a public IP
 *              address.
 */
function Navigation(props) {
    let navElems = ['Home', 'About', 'Configure', 'Datasets', 'Models'];

    navElems = navElems.map((e) => 
        <div className={props.selected === e ? "selectedNav" : null}
            onClick={() => props.onSelectedChange(e)}>
            {e}
        </div>);

    return (
        <div className="navigation">{navElems}</div>
    );
}

Navigation.propTypes = {
    onSelectedChange: PropTypes.func.isRequired,
    selected: PropTypes.string.isRequired,
    public: PropTypes.bool.isRequired
};