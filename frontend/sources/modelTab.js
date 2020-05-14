import React from 'react';
import PropTypes from 'prop-types';


export { ModelsTab };


/**
 * Function component displaying provided information about
 * currently active runners.
 * 
 * Component Props:
 *      models: Array. An array of runners.
 */
function ModelsTab(props) {
    const ms = props.models;

    if (ms.length === 0)
        return (
            <div className="aboutTab">
                <div>
                    <p>No model information currently available.</p>
                </div>
            </div>
        );

    let elems = [];
    for (let i = 0; i < ms.length; i++) {
        elems.push(<h3>{ms[i].name}</h3>);
        elems.push(<br/>);
        for (let j = 0; j < ms[i].about.length; j++) {
            elems.push(<p>{ms[i].about[j]}</p>);
            elems.push(<br/>);
        }
    }

    return (
        <div className="aboutTab">
            <div>
                {elems}
            </div>
        </div>
    );
}

ModelsTab.propTypes = {
    models: PropTypes.array.isRequired
};