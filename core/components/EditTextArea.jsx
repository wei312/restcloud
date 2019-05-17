import React from 'react';
import ReactDOM from 'react-dom';
import {Input} from 'antd';

class EditTextArea extends React.Component {
  constructor(props){
    super(props);
    this.state = {value: props.value}
  }
  shouldComponentUpdate(nextProps, nextState) {
    return nextState.value !== this.state.value;
  }
  handleChange(e) {
    const value = e.target.value;
    this.setState({ value });
    this.props.onChange(value);
  }
  render() {
    const {value} = this.state;
    const size=this.props.size||'large';
    return (<Input.TextArea size={size}  autosize style={{maxHeight:'260px'}} value={value} onChange={e => this.handleChange(e)} />);
  }
}

export default EditTextArea;
