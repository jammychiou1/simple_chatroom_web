import logo from './logo.svg';
import './App.css';
import React, { Component } from 'react';
// import { response } from 'express';

class App extends Component{
  constructor(props){
    super(props);
    this.state = {
      login: false,
      inChat: false,
      username: "",
      password: "",
      friend: "",
      error: 0,
      chatRoomID: -1,
      messageTail: 0,
      friendBuf: "",
      chatroomBuf: "",
      friendList: [],
      chatroomList: [],
      textBuf: "",
      message: [],
      timerIsSet: false
    };
  }
  componentDidUpdate() {
    if(this.state.inChat === true && this.state.timerIsSet === false){
      this.timerId = setInterval(this.updateMessage, 1000)
      console.log('set timer')
      this.setState({
          timerIsSet: true
      })
    }
  }
  componentWillUnmount() {
    clearInterval(this.timerId)
    this.setState({
      timerIsSet: false
    })
  }
  updateMessage = () => {
    fetch(`/chatrooms/${this.state.chatRoomID}/messages?begin=${this.state.messageTail}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${window.btoa(this.state.username+':'+this.state.password)}` 
      }
    }).then(res => res.json())
    .then(data => {
        if (data["result"] !== []) {
          let currentMsg = this.state.message
          currentMsg = currentMsg.concat(data["result"]) 
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
      fetch(`/chatrooms/${this.state.chatRoomID}/message`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${window.btoa(this.state.username+':'+this.state.password)}` 
        },
        body: JSON.stringify({"message":this.state.textBuf})
      }).then(res => res.json())
      .then(data => {
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
    fetch(`/check`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${window.btoa(this.state.username+':'+this.state.password)}` 
      }
    }).then(response => response.json())
    .then(data => {
      if(data["result"] ===  "yes"){
        this.setState({
          login: true,
          error: 0
        })
        this.fetchChatroom()
        this.fetchFriend()
      } else {
        this.setState({
          error: 1
        })
      }
    })
  }
  Register = () => {
    console.log("register")
    fetch(`/register`, {
      method: 'POST',
      body: JSON.stringify({"username":this.state.username, "password":this.state.password})
    }).then(response => response.json())
    .then(data => {
      if(data["result"] ===  "yes"){
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
    fetch(`/chatrooms`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${window.btoa(this.state.username+':'+this.state.password)}` 
      }
    }).then(res => res.json())
    .then(data => {
        this.setState({
          chatroomList: data["result"],
        })
      }
    )
  }
  addChatroom = () => {
    if(this.state.chatroomBuf !== ""){
      fetch(`/chatrooms`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${window.btoa(this.state.username+':'+this.state.password)}` 
        },
        body: JSON.stringify({"friend":this.state.chatroomBuf})
      }).then(res => res.json())
      .then(data => {
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
            this.setState({
              chatroomBuf: ""
            })
          }
        })
    }
  }
  fetchFriend = () => {
    fetch(`/friends`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${window.btoa(this.state.username+':'+this.state.password)}` 
      }
    }).then(res => res.json())
    .then(data => {
        this.setState({
          friendList: data["result"],
        })
      }
    )
  }
  addFriend = () => {
    if(this.state.friendBuf !== ""){
      fetch(`/friends`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${window.btoa(this.state.username+':'+this.state.password)}` 
        },
        body: JSON.stringify({"friend":this.state.friendBuf})
      }).then(res => res.json())
      .then(data => {
          if (data["result"] === "ok"){
            let currentFriendList = this.state.friendList
            currentFriendList.push(this.state.friendBuf)
            this.setState({
              friendList: currentFriendList,
              friendBuf: ""
            })
          } else {
            alert("add friend failed")
            this.setState({
              friendBuf: ""
            })
          }
        })
    }
  }
  deleteFriend = () => {
    if(this.state.friendBuf !== "") {
      fetch(`/friends`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${window.btoa(this.state.username+':'+this.state.password)}` 
        },
        body: JSON.stringify({"friend":this.state.friendBuf})
      }).then(res => res.json())
      .then(data => {
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
            this.setState({
              friendBuf: ""
            })
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
              <input type="text" className="friendWidth" onChange={this.handleFriendInput.bind(this)} value={this.state.friendBuf}/>
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
              <input type="text" className="friendWidth" onChange={this.handleChatroomInput.bind(this)} value={this.state.chatroomBuf}/>
              <button className="friendButton" onClick={this.addChatroom.bind(this)}>Add</button>
            </div>
            <div className="rightCol1">
              {this.state.message.map(x => {
                if(x["from"] === this.state.username){
                  if(x["type"] === "text"){
                    return <div className="userMessageBox">{x["data"]}</div>
                  } else if(x["type"] === "image") {
                    return <div className="userMessageBox"><img src={`/images/${x["token"]}`} alt={x["data"]}></img></div>
                  } else if(x["type"] === "file") {
                    return <div className="userMessageBox"><a href={`/files/${x["token"]}`}>[{x["data"]}]</a></div>
                  }
                }
                else if(x["from"] === this.state.friend){
                  if(x["type"] === "text"){
                    return <div className="friendMessageBox">{x["data"]}</div>
                  } else if(x["type"] === "image") {
                    return <div className="friendMessageBox"><img src={`/images/${x["token"]}`} alt={x["data"]}></img></div>
                  } else if(x["type"] === "file") {
                    return <div className="friendMessageBox"><a href={`/files/${x["token"]}`}>[{x["data"]}]</a></div>
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
