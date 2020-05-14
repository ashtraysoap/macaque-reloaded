import React from 'react';
import PropTypes from 'prop-types';

export { DataEntriesList };


/**
 * Component for listing dataset entries.
 * 
 * Component Props:
 *      entries: Array. An array of dataset elements.
 *      handleEntryClick: Function. Handles user clicks on the
 *              list entries.
 */
function DataEntriesList(props) {
    let elems = props.entries.map(e => { return { name: e.source, id: e.id } });
    elems = elems.forEach(e => { e.name = e.name.replace(/^.*[\\\/]/, '') });
    elems = elems.map(e => <div 
        className="dataEntry"
        onClick={() => props.handleEntryClick(e.id)} 
        key={e.id}>
        {e.name}
    </div>);

    return (
        <div>
            <div className="dataList">
                {elems}
            </div>
        </div>
    );
}

DataEntriesList.propTypes = {
    entries: PropTypes.array.isRequired,
    handleEntryClick: PropTypes.func
};
