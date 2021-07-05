import React from 'react'
import logo from './logo.svg'
import './App.scss'
import { Forms } from './forms/Forms'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>kea-forms demo</h1>
      </header>
      <div className="App-body">
        <Forms />
      </div>
    </div>
  )
}

export default App
