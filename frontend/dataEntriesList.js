import React from 'react';
import PropTypes from 'prop-types';

export { DataEntriesList };

class DataEntriesList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            elements: []
        };
        this.state.elements = this.props.entries.map(e => { return { name: e.source, id: e.id } });
        this.state.elements.forEach(e => { e.name = e.name.replace(/^.*[\\\/]/, '') });
    }

    render() {
        const elems = this.state.elements.map(e => <div 
            onClick={() => this.props.handleEntryClick(e.id)} 
            key={e.id}>
            {e.name}
        </div>);

        return (
            <div>
                {elems}
            </div>
        );
    }
}

// function DataInstanceEntry(props){
//     let entries = [];
//     return (
//         <div onClick={props.handleClick}>
//             <TableRow entries={entries}/>
//         </div>
//     );
// }

DataEntriesList.propTypes = {
    entries: PropTypes.shape({

    }).isRequired,
    scores: PropTypes.arrayOf(PropTypes.shape({

    })),
    handleEntryClick: PropTypes.func
};

// ids
// filenames
// metric scores
// metric names
// runs