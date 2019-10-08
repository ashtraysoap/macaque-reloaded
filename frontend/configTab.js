import React from 'react';
import PropTypes from 'prop-types';

import { AddPreproTab } from './addPreproTab.js';
import { AddEncoderTab } from './addEncoderTab.js';
import { AddModelTab } from './newAddModelTab.js';
import { AddRunnerTab } from './addRunnerTab.js';

export { ConfigTab };


function ConfigTab(props) {
    return (
        <div className="configTab">
            {props.children}
        </div>
    )
}

// class ConfigTab extends React.Component {
//     constructor(props) {
//         super(props);
//     }

//     render() {
//         return (
//             <div>
//                 <AddPreproTab addPrepro={this.props.addPrepro} />
//                 <hr/>
//                 <AddEncoderTab addEncoder={this.props.addEncoder} />
//                 <hr/>
//                 <AddModelTab addModel={this.props.addModel} />
//                 <hr/ >
//                 <AddRunnerTab 
//                     preprocessors={this.props.preprocessors}
//                     encoders={this.props.encoders}
//                     models={this.props.models}
//                     addRunner={this.props.addRunner}
//                 />
//             </div>
//         );
//     }
// }

// ConfigTab.propTypes = {
//     addPrepro: PropTypes.func.isRequired,
//     addEncoder: PropTypes.func.isRequired,
//     addModel: PropTypes.func.isRequired,
//     addRunner: PropTypes.func.isRequired,
//     preprocessors: PropTypes.array.isRequired,
//     encoders: PropTypes.array.isRequired,
//     models: PropTypes.array.isRequired
// };