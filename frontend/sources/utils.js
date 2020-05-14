import PropTypes from 'prop-types';
import React from 'react';

export { InformativeInput, InformativeLabel, SidePanel, 
    range, zip, enumerate, round, basename, wait };


/**
 * Returns the first 0,...,n-1 integers.
 * 
 * Params:
 *      n: Number. Specifies the upper bound of the range.
 */
function range(n) {
    return [...Array(n).keys()];
}


/**
 * Zips the elements of two Arrays into one
 * array. zip([1,2],[8,9]) produces [[1,8],[2,9]].
 * 
 * Params:
 *      x: Array. The first Array.
 *      y: Array. The second Array.  
 */
function zip(x, y) {
    let z = []
    for (let i = 0; i < x.length; i++) {
        z.push([x[i], y[i]]);
    }
    return z;
}

/**
 * Analogous to Python's enumerate(). enumerate([1,2,3])
 * produces [[0,1],[1,2],[2,3]].
 * 
 * Params:
 *      list: Array. The input array.
 */
function enumerate(list) {
    return zip(range(list.length), list);
}

/**
 * Rounds a number to the closest smaller
 * integer.
 * 
 * Params:
 *      n: Number.
 */
function round(n) {
    return Math.round(n * 100) / 100
}


/**
 * Returns the basename of a file given a
 * path.
 * 
 * Params:
 *      fp: String. A string file path.
 */
function basename(fp) {
    return fp.replace(/^.*[\\\/]/, '');
}


/**
 * Blocks for a given time.
 * 
 * Params:
 *      ms: Number. The duration in miliseconds for
 *              which execution should block.
 */
function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
      end = new Date().getTime();
   }
 }


 /**
  * Component for generic text input forms with additional
  * embelishments.
  * 
  * Component State:
  *     clicked: Boolean. Whether the hint should be displayed.
  * 
  * Component Props:
  *     name: String. The name of the input field.
  *     value: String. The current value in the input field.
  *     optional: Boolean. Whether the input is optional.
  *     handleChange: Function. Callback for changes in input value.
  *     hint: String. A hint to display when user clicks on the label.
  *     error: String. An error associated with the filled value.
  */
class InformativeInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = { clicked: false };
        this.onLabelClick = this.onLabelClick.bind(this);
    }

    onLabelClick() {
        this.setState({ clicked: !this.state.clicked });
    }

    render() {
        const labelText = this.props.optional ? <i>{this.props.name}</i> : this.props.name;

        return (
            <div>
                <div className="informative">
                    <label onClick={this.onLabelClick} >{labelText}</label>
                    <input type="text" value={this.props.value} onChange={this.props.handleChange} />
                </div>
                {
                    this.state.clicked &&
                        <div className="hint">
                            {this.props.hint}
                        </div>
                }
                {   this.props.error &&
                        <div className="error">
                            {this.props.error}
                        </div>
                }
            </div>
        )
    }
}


/**
  * Component for generic labels for forms with additional
  * embelishments.
  * 
  * Component State:
  *     clicked: Boolean. Whether the hint should be displayed.
  * 
  * Component Props:
  *     name: String. The name of the input field.
  *     optional: Boolean. Whether the input is optional.
  *     children: DOM Element. The corresponding HTML form.
  *     hint: String. A hint to display when user clicks on the label.
  *     error: String. An error associated with the filled value.
  */
class InformativeLabel extends React.Component {
    constructor(props) {
        super(props);
        this.state = { clicked: false };
        this.onLabelClick = this.onLabelClick.bind(this);
    }

    onLabelClick() {
        this.setState({ clicked: !this.state.clicked });
    }

    render() {
        const labelText = this.props.optional ? <i>{this.props.name}</i> : this.props.name;

        return (
            <div className="informative">
                <label onClick={this.onLabelClick} >{labelText}</label>
                {
                    this.props.children
                }
                {
                    this.state.clicked &&
                        <div className="hint">{this.props.hint}</div>
                }
                {
                    this.props.error &&
                        <div className="error">{this.props.error}</div>
                }
            </div>
        )
    }
}


/**
 * Component displaying a generic top-down menu with a label.
 * 
 * Menu displays props' keys and on an item click invokes the
 * callback with the keys' value as parameter.
 * 
 * Component Props:
 *     label: String. The label of the menu.
 *     keys: Array. An array of string keys for the menu elements.
 *     values: Array. An array of values passed to the callback 
 *          function on click.
 *     callback: Function. Callback for element clicking.
 *     selectedKey: String. The currently selected key.
 */
function SidePanel(props) {
    const p = props;
    let keys = p.keys.map(k => {

        if (k === p.selectedKey) {
            return (
                <div 
                key={k} 
                onClick={() => p.callback(k)}
                className="selected">
                {p.values[p.keys.indexOf(k)]}
                </div>
            );
        } else {
            return (
                <div 
                key={k} 
                onClick={() => p.callback(k)}>
                {p.values[p.keys.indexOf(k)]}
                </div>
            );
        }
    });

    return (
        <div className="sideTab">
            <div className="addModelPartLabel">{p.label}</div>
            {keys}
        </div>
    );
}

InformativeInput.propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    optional: PropTypes.bool.isRequired,
    handleChange: PropTypes.func.isRequired,
    hint: PropTypes.string,
    error: PropTypes.string
};

InformativeLabel.propTypes = {
    name: PropTypes.string.isRequired,
    optional: PropTypes.bool.isRequired,
    children: PropTypes.object.isRequired,
    hint: PropTypes.string,
    error: PropTypes.string
};

SidePanel.propTypes = {
    label: PropTypes.string.isRequired,
    keys: PropTypes.arrayOf(PropTypes.string).isRequired,
    values: PropTypes.arrayOf(PropTypes.any).isRequired,
    callback: PropTypes.func.isRequired,
    selectedKey: PropTypes.string.isRequired
};