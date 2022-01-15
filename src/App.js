import logo from './logo.svg';
import './App.css';
import React, { Component } from 'react';
// import { response } from 'express';

class App extends Component{
  constructor(props){
    super(props);
    this.state = {
      login: true,
      inChat: false,
      username: "daodaodao",
      password: "",
      friend: "jammy",
      error: 0,
      chatRoomID: -1,
      messageTail: 0,
      friendBuf: "",
      chatroomBuf: "",
      friendList: ["fuckyou1", "fuckyou2"],
      chatroomList: [{"friend": "fuckyou1", "id": 1}, {"friend": "fuckyou2", "id": 2}],
      textBuf: "",
      message: [
          {
            "from": "daodaodao", 
            "type": "text",
            "data": "hello from daodaodao",
            "token": ""
          },
          {
            "from": "jammy",
            "type": "text",
            "data": "hi",
            "token": ""
          },
        ]
      ,

    };
  }
  componentDidMount() {
    if(this.state.inChat === true){
      this.timerId = setInterval(this.updateMessage, 1000)
    }
  }
  componentWillUnmount() {
    clearInterval(this.timerId)
  }
  updateMessage = () => {
    fetch(`${window.location.host}/chatrooms/${this.state.chatRoomID}/messages?begin=${this.state.messageTail}`, {method: 'GET'}).then(
      res => {
        const data = res.json()
        if (data["result"] !== []) {
          let currentMsg = this.state.message
          currentMsg.push(data["result"])
          this.setState({
            message: currentMsg,
            messageTail: currentMsg.length
          })
        }
      }
    )
  }
  handleErrorMsg = (err) => {
    if (err === 0) {
      return
    } else if (err === 1) {
      return <div className="container">User Not Found</div>
    } else if (err === 2) {
      return <div className="container">Username is in use, please create a new one</div>
    }
  }
  handleChange = (event) => {
    if (event.target.name === "username") {
      this.setState({
        username: event.target.value
      })
    } else if (event.target.name === "password") {
      this.setState({
        password: event.target.value
      })
    }
  }
  sendMessage = () => {
    console.log(this.state.textBuf)
    if (this.state.textBuf !== "") {
      fetch(`${window.location.host}/chatrooms/${this.state.chatRoomID}/message`, {
        method: 'PUT',
        body: JSON.stringify({"message":this.state.textBuf})
      }).then(
        res => {
          const data = res.json()
          if(data["result"] !== "ok"){
            alert("message not sent")
          }
        }
      )
    }
    this.setState({
      textBuf: ""
    })
  }
  handleSendText = (event) => {
    this.setState({
      textBuf: event.target.value
    })
  }
  handleFriendInput = (event) => {
    this.setState({
      friendBuf: event.target.value
    })
  }
  handleChatroomInput = (event) => {
    this.setState({
      chatroomBuf: event.target.value
    })
  }
  Login = () => {
    console.log("login")
    fetch(`${window.location.host}/login`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${window.btoa(this.state.username+':'+this.state.password)}` 
      }
    }).then(response => {
      response = response.json()
      if(response["result"] ===  "ok"){
        this.setState({
          login: true,
          error: 0
        })
      } else {
        this.setState({
          error: 1
        })
      }
    })
    this.fetchChatroom()
  }
  Register = () => {
    console.log("register")
    fetch(`${window.location.host}/register`, {
      method: 'POST',
      body: JSON.stringify({"username":this.state.username, "password":this.state.password})
    }).then(response => {
      response = response.json()
      if(response["result"] ===  "ok"){
        this.setState({
          login: true,
          error: 0
        })
      } else {
        this.setState({
          error: 2
        })
      }
    })
  }
  switchChatroom = (idx) => {
    this.setState({
      friend: this.state.chatroomList[idx]["friend"],
      chatRoomID: this.state.chatroomList[idx]["id"],
      messageTail: 0,
      message: [],
      inChat: true
    })
  }
  fetchChatroom = () => {
    fetch(`${window.location.host}/chatrooms`, {method: 'GET'}).then(
      res => {
        const data = res.json()
        this.setState({
          chatroomList: data["result"],
          inChat: true
        })
      }
    )
  }
  addChatroom = () => {
    if(this.state.chatroomBuf !== ""){
      fetch(`${window.location.host}/chatrooms`, {
        method: 'PUT',
        body: JSON.stringify({"friend":this.state.chatroomBuf})
      }).then(
        res => {
          const data = res.json()
          const id = data["result"]
          if (id !== -1){
            let currentChatList = this.state.chatroomList
            currentChatList.push({"friend":this.state.chatroomBuf, "id": id})
            this.setState({
              chatroomList: currentChatList,
              chatroomBuf: ""
            })
          } else {
            alert("add chatroom failed")
          }
        })
    }
  }
  fetchFriend = () => {
    fetch(`${window.location.host}/friends`, {method: 'GET'}).then(
      res => {
        const data = res.json()
        this.setState({
          friendList: data["result"],
          inChat: true
        })
      }
    )
  }
  addFriend = () => {
    if(this.state.friendBuf !== ""){
      fetch(`${window.location.host}/friends`, {
        method: 'PUT',
        body: JSON.stringify({"friend":this.state.friendBuf})
      }).then(
        res => {
          const data = res.json()
          if (data["result"] === "ok"){
            let currentFriendList = this.state.chatroomList
            currentFriendList.push(this.state.friendBuf)
            this.setState({
              friendList: currentFriendList,
              friendBuf: ""
            })
          } else {
            alert("add friend failed")
          }
        })
    }
  }
  deleteFriend = () => {
    if(this.state.friendBuf !== "") {
      fetch(`${window.location.host}/friends`, {
        method: 'DELETE',
        body: JSON.stringify({"friend":this.state.friendBuf})
      }).then(
        res => {
          const data = res.json()
          if (data["result"] === "ok"){
            let currentFriendList = this.state.friendList
            for(let i = 0; i < currentFriendList.length; i++) {
              if(currentFriendList[i] === this.state.friendBuf) {
                currentFriendList.splice(i, 1)
                break
              }
            }
            this.setState({
              friendList: currentFriendList,
              friendBuf: ""
            })
          } else{
            alert("delete friend failed")
          }
        })
    }
  }
  render() {
    if (this.state.login === true) {
      return (
        <div>
          <header className="App-header">
            <h1>Simple Chatroom</h1> 
            <h5>User: {this.state.username},  Friend: {this.state.friend}</h5>
          </header>
            <div className="leftCol1">
              <div className="title"><h3>Friend List</h3></div>
              {this.state.friendList.map((x, i) => {
                return <div className="friendList"><h3>{x}</h3></div>
              })}
            </div>
            <div className="leftCol2">
              <input type="text" className="friendWidth" onChange={this.handleFriendInput.bind(this)}/>
              <button className="friendButton" onClick={this.addFriend.bind(this)}>Add</button>
              <button className="friendButton" onClick={this.deleteFriend.bind(this)}>Delete</button>
            </div>
            <div className="midCol1">
              <div className="title"><h3>Chatroom</h3></div>
              {this.state.chatroomList.map((x, i) => {
                return <div className="chatList" onClick={this.switchChatroom.bind(this, i)}><h3>{x["friend"]}</h3></div>
              })}
            </div>
            <div className="midCol2">
              <input type="text" className="friendWidth" onChange={this.handleChatroomInput.bind(this)}/>
              <button className="friendButton" onClick={this.addChatroom.bind(this)}>Add</button>
            </div>
            <div className="rightCol1">
              {this.state.message.map(x => {
                if(x["from"] === this.state.username){
                  if(x["type"] === "text"){
                    return <div className="userMessageBox">{x["data"]}</div>
                  } else if(x["type"] === "image") {
                    return <div className="userMessageBox"><img src={`${window.location.host}/images/${x["token"]}`} alt={x["data"]}></img></div>
                  } else if(x["type"] === "file") {
                    return <div className="userMessageBox"><a href={`${window.location.host}/images/${x["token"]}`}>[{x["data"]}]</a></div>
                  }
                }
                else if(x["from"] === this.state.friend){
                  if(x["type"] === "text"){
                    return <div className="friendMessageBox">{x["data"]}</div>
                  } else if(x["type"] === "image") {
                    return <div className="friendMessageBox"><img src={`${window.location.host}/files/${x["token"]}`} alt={x["data"]}></img></div>
                  } else if(x["type"] === "file") {
                    return <div className="friendMessageBox"><a href={`${window.location.host}/files/${x["token"]}`}>[{x["data"]}]</a></div>
                  }
                }
              })}
              
            </div>
            <div className="rightCol2">
              <div className="textInput">
                <input placeholder="send text..." name="newMsg" className="textWidth" value={this.state.textBuf} onChange={this.handleSendText.bind(this)}></input>
                <button onClick={this.sendMessage.bind(this)}>send</button>
              </div>
            </div>
        </div>
      );
    } else {
      return (
        <div className="App">
          <header className="App-header">
            <h1>Login/Register</h1> 
          </header>
              <div className="container">
                <h3>Username: <input type="text" name="username" onChange={this.handleChange.bind(this)}/></h3>
              </div>
              <div className="container">
                <h3>Password: <input type="password" name="password" onChange={this.handleChange.bind(this)}/></h3>
              </div>
              <div className="container">
                <button type="submit" name="login" className="button" onClick={this.Login.bind(this)}>Login</button>
              </div>
              <div className="container" >
                <button type="submit" name="register" className="button" onClick={this.Register.bind(this)}>Register</button>
              </div>
            {this.handleErrorMsg.bind(this, this.state.error)}
        </div>
      );
    }
  }
}

export default App;
