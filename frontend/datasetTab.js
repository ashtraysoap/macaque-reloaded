import PropTypes from 'prop-types';
import React from 'react';

import { TableRow } from './utils.js';

import './style.css';

class DataInstanceView extends React.Component {
    render() {
        return (
            <div className="transparentLayer">
                <div className="instanceView">
                    This is a demonstrational text.
                </div>
            </div>
        );
    }
}

class DataInstanceEntry extends React.Component {
    
    render() {
        let entries = [this.props.dataInstance.source]
        
        return (
            <div onClick={this.props.handleClick}>
                <TableRow entries={entries}/>
            </div>
        );
    }
}

class DatasetTab extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            elemIdx: null
        };

        this.showView = this.showView.bind(this);
        this.closeView = this.closeView.bind(this);
        this.moveViewLeft = this.moveViewLeft.bind(this);
        this.moveViewRight = this.moveViewRight.bind(this);
    }

    get elementCount() {
        return this.state.dataset.elements.length();
    }

    get showingElementView() {
        return (this.state.elemIdx === null) ? false : true;
    }

    showView(idx) {
        this.setState({ elemIdx: idx });
    }

    closeView() {
        this.setState({ elemIdx: null });
    }

    moveViewLeft() {
        if (this.state.elemIdx === undefined)
            return;
        
        const i = this.state.elemIdx;
        const max = this.elementCount;
        const j = (i === 0) ? max : (i - 1);

        this.setState({ elemIdx: j });
    }

    moveViewRight() {
        if (this.state.elemIdx === undefined)
            return;
        
        const i = this.state.elemIdx;
        const max = this.elementCount;
        const j = (i === max) ? 0 : (i + 1);

        this.setState({ elemIdx: j });
    }

    render() {
        const view = this.showingElementView ? <DataInstanceView /> : null;
        const elements = this.props.dataset.elements.map((e => <DataInstanceEntry key={e.id} 
            dataInstance={e} handleClick={() => {}}/>));

        return (
            <div>
                {elements}
                {view}
            </div>
        );
    }
}

DatasetTab.propTypes = {
    dataset: PropTypes.shape({
        name: PropTypes.string,
        elements: PropTypes.array
    }).isRequired
};

DataInstanceEntry.propTypes = {
    dataInstance: PropTypes.shape({

    }).isRequired,
    handleClick: PropTypes.func.isRequired
};

export { DatasetTab };