import PropTypes from 'prop-types';
import React from 'react';

export { PendingTab, SuccessTab, ErrorTab };

function PendingTab(props) {
    return (
        <div className="pendingTab">
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