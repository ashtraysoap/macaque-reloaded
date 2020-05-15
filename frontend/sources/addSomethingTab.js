import React from 'react';

export { AddSomethingTab };

/**
 * A functional wrapper providing unified style to all
 * model part input forms (preprocessor, encoder, model,
 * runner).
 * 
 * Component Props:
 *      children: DOM elements. The child input form component.
 */
const AddSomethingTab = (props) => (
    <div className="addSomethingTab">
        {props.children}
    </div>
);