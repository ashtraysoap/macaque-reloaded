import React from 'react';
import PropTypes from 'prop-types';

import { Navigation } from './nav.js';

import './style.css';

export { Header };


function Header(props) {
    return (
        <div className="header">
            <div className={props.selected === "Home" ? "logoSelected" : "logo"} 
                onClick={() => props.onSelectedChange("Home")}>Macaque</div>
            <Navigation
                onSelectedChange={props.onSelectedChange}
                selected={props.selected}
                public={props.public}
            />
        </div>
    );
}

Header.propTypes = {
    onSelectedChange: PropTypes.func.isRequired,
    selected: PropTypes.string.isRequired,
    public: PropTypes.bool.isRequired
};