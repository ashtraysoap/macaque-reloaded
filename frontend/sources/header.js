import React from 'react';
import PropTypes from 'prop-types';

import { Navigation } from './nav.js';

export { Header };


/**
 * Function component displaying application header
 * including navigation.
 * 
 * Component Props:
 *      onSelectedChange: Function. Handles navigation clicks.
 *      selected: String. Identifier of the currently selected tab.
 *      public: Boolean. Whether the application is running on public IP
 *              addresses.
 */
function Header(props) {
    return (
        <Navigation
            onSelectedChange={props.onSelectedChange}
            selected={props.selected}
            public={props.public}
        />
    );
}

Header.propTypes = {
    onSelectedChange: PropTypes.func.isRequired,
    selected: PropTypes.string.isRequired,
    public: PropTypes.bool.isRequired
};