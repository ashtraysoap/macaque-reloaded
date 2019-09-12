import PropTypes from 'prop-types';
import React from 'react';

import './style.css';


class DataInstanceView extends React.Component {

    render() {
        const instance = this.props.dataInstance;
        
        return (
            <div className="transparentLayer" onClick={() => this.props.onClick()}>
                <div className="instanceView" style={{border: "solid 4px black", borderRadius: "15px"}} onClick={(e) => e.stopPropagation()}>
                    This is a demonstrational DataInstanceView.
                    <br/>
                    {instance.source}
                    <div style={{border: "solid blue"}}>
                        <img src={`/load_image/${this.props.dataset}/${this.props.dataInstance.id}`} alt=""/>
                    </div>
                    <div style={{border: "solid green"}}>Caption</div>
                    <div style={{border: "solid red"}}>Beam Search Output Graph</div>
                    <div style={{border: "solid purple"}}>Metrics Table</div>
                </div>
            </div>
        );
    }
}

DataInstanceView.propTypes = {
    dataInstance: PropTypes.shape(
        {
            source: PropTypes.string,
            id: PropTypes.number
        }
    ).isRequired,
    dataset: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
};

export { DataInstanceView };