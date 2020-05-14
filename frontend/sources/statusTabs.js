import React from 'react';

export { PendingTab, SuccessTab, ErrorTab };


/**
 * Function components for simple iformative
 * messages for the user.
 * 
 * Component Props:
 *      text: String. The message to be displayed.
 */

function PendingTab(props) {
    return (
        <div className="processingTab">
            {props.text}
        </div>
    );
}

function SuccessTab(props) {
    return (
        <div className="successTab">
            {props.text}
        </div>
    )
}

function ErrorTab(props) {
    return (
        <div className="errorTab">
            {props.text}
        </div>
    )
}