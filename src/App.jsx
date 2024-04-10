import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css'
import './App.css'
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react'
import { useState, useEffect } from 'react'
import chatbot1 from './assets/chatbot1.png'
import chatbot2 from './assets/chatbot2.png'
import chatbot3 from './assets/chatbot3.png'


const API_KEY = import.meta.env.VITE_APP_API_KEY;
// const API_KEY = process.env.VITE_APP_API_KEY;


function App() {

  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState([
    {
      message: "Hello, I am ChatGPT!",
      sender: "ChatGPT"
    }
  ])
  const [responseStyle, setResponseStyle] = useState(""); // State for response style

  useEffect(() => {
    if (!localStorage.getItem('prompted')) {
      // Prompt the user to select their preferred response style
      const style = prompt('How would you like Chat-GPT to respond? \n "Explain as if you are talking to a ..." ')
      setResponseStyle(style); // Update the response style state
      localStorage.setItem('prompted', 'true')
    }


  }, [])


  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing"
    }

    const newMessages = [...messages, newMessage]

    setMessages(newMessages)
    setIsTyping(true)

    await processMessageToChatGPT(newMessages, responseStyle) // Pass the style to the function
  }

  async function processMessageToChatGPT(chatMessages, style) {
    let apiMessages = chatMessages.map((messageObject) => {
      let role = ""
      if (messageObject.sender === "ChatGPT") {
        role = "assistant"
      } else {
        role = "user"
      }
      return {
        role: role,
        content: messageObject.message
      }
    })

    // Dynamically set the systemMessage content based on the response style
    const systemMessage = {
      role: "system",
      content: `Explain as if you were talking to a ${style}`
    }

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,
        ...apiMessages
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
      console.log(`Explain as if you were talking to a ${style}`)
      console.log(data.choices[0].message.content)
      console.log(data)
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
      <div className="header">
        <img src={chatbot3} alt="" />
        <h1>GPT-Chatbot</h1>
        <p>&nbsp;</p>
      </div>
      <div style={{ position: "relative", height: "800px", width: "700px" }}>
        <MainContainer className='main-box'>
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
