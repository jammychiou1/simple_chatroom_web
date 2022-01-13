import logo from './logo.svg';
import './App.css';
import React, { Component } from 'react';

class App extends Component{
  constructor(props){
    super(props);
    this.state = {
      msg: {
        "user": "daodaodao",
        "friend": "jammy",
        "message": [
          {
            "from": "daodaodao", 
            "type": "message",
            "data": "hello from daodaodao"
          },
          {
            "from": "jammy",
            "type": "message",
            "data": "hi"
          },
        ]
      },
    };
  }
  componentDidMount() {
    this.timerId = setInterval(this.updateMessage, 1000)
  }
  componentWillUnmount() {
    clearInterval(this.timerId)
  }
  updateMessage = () => {
    const dao = this.state.msg
    // dao["message"].push({
    //   "from": "daodaodao",
    //   "type": "message",
    //   "data": "ctf"
    // })
    this.setState({
      msg: dao
    })
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Simple Chatroom</h1> 
          <h5>User: {this.state.msg["user"]},  Friend: {this.state.msg["friend"]}</h5>
        </header>
          <div>
            {this.state.msg["message"].map(x => {
              if(x["from"] === this.state.msg["user"]){
                return <div className="userMessageBox">{x["data"]}</div>
              }
              else if(x["from"] === this.state.msg["friend"]){
                return <div className="friendMessageBox">{x["data"]}</div>
              }
            })}
          </div>
          <div>
          <input placeholder="send text..."></input>
          </div>
      </div>
    );
  }
}

export default App;
