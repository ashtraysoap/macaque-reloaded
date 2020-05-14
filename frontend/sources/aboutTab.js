import React from 'react';

export { AboutTab };


/**
 * Functional component displaying general information about the application.
 */
function AboutTab() {
    return (
        <div className="aboutTab">
            <div>
                <p>An application for building intuitions about neural network inference and evaluation.</p>
                <br/>
                <i>Created by Samuel Michalik</i>
            </div>
        </div>
    );
}
