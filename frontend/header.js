import React from 'react';

import './style.css';

function Header(props) {
    return (
        <div className="header">
            <div className="logo" >Macaque</div>
            {props.nav}
        </div>
    );
}

export { Header };