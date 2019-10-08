import React from 'react';

import './style.css';

export { Header };


function Header(props) {
    return (
        <div className="header">
            <div className="logo" >Macaque</div>
            {props.nav}
        </div>
    );
}
