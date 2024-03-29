import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css'
import './App.css'
import {MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator} from '@chatscope/chat-ui-kit-react'
import { useState } from 'react'

const API_KEY = "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"

function App() {
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState([
    {
      message: "Hello, I am ChatGPT!",
      sender: "ChatGPT"
    }
  ])


  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing"
    }

    const newMessages = [...messages, newMessage] //all the old messages + the new message

    // update our messages state
    setMessages(newMessages)

    // set a typing indicator (chatGPT is typing)
    setIsTyping(true)

    // process message to chatGPT (send it over and see the response)
    await processMessageToChatGPT(newMessages)
  }

  async function processMessageToChatGPT(chatMessages) {

    let apiMessages = chatMessages.map((messageObject) => {
      let role = ""
      if(messageObject.sender === "ChatGPT") {
        role = "assistant"
      } else {
        role = "user"
      }
      return {
        role: role,
        content: messageObject.message
      }
    })

    // Roles:
    //   "user" is a message from the user
    //   "assistant" is a response from ChatGPT
    //   "system" is  generally 1 initial message defining HOW we want ChatGPT to talk

    const systemMessage = {
      role: "system",
      content: "Explain things like you're talking to a software graduate with an interest in frontend devlopment."
    }

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,
        ...apiMessages //[message1, message2, message3 ]
      ]
    }

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json()
    }).then((data) => {
      console.log(data) 
      console.log(data.choices[0].message.content)
      setMessages(
        [...chatMessages, {
          message: data.choices[0].message.content,
          sender: "ChatGPT"
        }]
      )
      setIsTyping(false)
    })
  }

 


  return (
    <div className="App">
      <div style={{position: "relative", height: "800px", width: "700px"}}>
         <MainContainer>
          <ChatContainer>
            <MessageList
            scrollBehavior='smooth'
            typingIndicator={isTyping ? <TypingIndicator content="ChatGPT is typing..." /> : null}
            >
              {messages.map((message, i) => {
                return <Message key={i} model={message} />
              })}
            </MessageList>
            <MessageInput placeholder='Type message here' onSend={handleSend} />
          </ChatContainer>
         </MainContainer>
      </div>

    </div>
  )
}

export default App
