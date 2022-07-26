import React, { useEffect, useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import ScrollToBottom from 'react-scroll-to-bottom';
import axios from 'axios';

function ChatRoom({ socket, user, room, setModalIsOpen }) {
  const [currentMessage, setCurrentMessage] = useState('');
  const [messageList, setMessageList] = useState([]);

  const time = new Date(Date.now()).toLocaleString();

  const fetchMessages = async () => {
    const data = await axios.get('api/messages');
    console.log(data);
  };

  const Logout = () => {
    // e.preventDefault();
    socket.disconnect();
    setModalIsOpen(false);
    // alert(user.name + ` is disconnected`);
    // alert(JSON.stringify(messageList));
  };

  const sendMessage = async () => {
    if (currentMessage !== '') {
      const messageData = {
        room: room,
        name: user.name,
        message: currentMessage,
        time: time,
      };
      await socket.emit('send_message', messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage('');
    }
  };

  const saveToCache = async () => {
    const messageLog = JSON.parse(JSON.stringify(messageList));
    for (let i = 0; i < messageLog.length; i++) {
      console.log(Object.entries(messageLog[i]));
    }
    // const messageLog = JSON.stringify(messageList);
    await axios
      .post('/api/messages', {
        messageLog,
      })
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessageList((list) => [...list, data]);
    });
  }, [socket]);

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className='chat-window'>
      {/* Chatting header */}
      <div className='chat-header'>
        <p>Live Chat</p>
        <AiOutlineClose
          className='quit-window'
          onClick={() => {
            Logout();
            saveToCache();
          }}
        />
      </div>

      {/* Chatting body */}
      <div className='chat-body'>
        <ScrollToBottom className='message-container'>
          {messageList.map((messageContent) => {
            return (
              <div
                className='message'
                id={user.name === messageContent.name ? 'you' : 'other'}
              >
                <div>
                  <div className='message-content'>
                    <p>{messageContent.message}</p>
                  </div>
                  <div className='message-meta'>
                    <p id='time'>{messageContent.time}</p>
                    <p id='name'>{messageContent.name}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollToBottom>
      </div>

      {/* Input message */}
      <div className='chat-footer'>
        <input
          type='text'
          value={currentMessage}
          placeholder='Write message here'
          required
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyPress={(event) => {
            event.key === 'Enter' && sendMessage();
          }}
        />
        <button className='send-message' onClick={sendMessage}>
          &#8629;
        </button>
      </div>
    </div>
  );
}

export default ChatRoom;
