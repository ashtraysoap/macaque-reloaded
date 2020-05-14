import React from 'react';
import PropTypes from 'prop-types';

export { DataEntriesList };


class DataEntriesList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            elements: [],
            runId: 0,
        };
        this.state.elements = this.props.entries.map(e => { return { name: e.source, id: e.id } });
        this.state.elements.forEach(e => { e.name = e.name.replace(/^.*[\\\/]/, '') });

    }

    render() {
        const elems = this.state.elements.map(e => <div 
            className="dataEntry"
            onClick={() => this.props.handleEntryClick(e.id)} 
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
}

DataEntriesList.propTypes = {
    entries: PropTypes.shape({

    }).isRequired,
    handleEntryClick: PropTypes.func
};
