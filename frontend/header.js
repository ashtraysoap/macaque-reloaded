import React from 'react';
import PropTypes from 'prop-types';

import { Navigation } from './nav.js';

import './style.css';

export { Header };


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