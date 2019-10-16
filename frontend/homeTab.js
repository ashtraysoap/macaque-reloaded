// import PropTypes from 'prop-types';
import React from 'react';

export { HomeTab };

class HomeTab extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="homeTab">
                <form method="post" enctype="multipart/form-data">
                    <input id="inFile" type="file" name="input-file" accept=".jpg"/>
                    <input id="caption-button" type="submit" value="Caption" hidden/>
                </form>
            </div>
        );
    }
}