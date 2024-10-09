import logo from './logo.svg';
import './App.css';
import Mancala from './Mancala.js';

function App() {
  return (
    <div className="App">
              <img src={logo} className="App-logo" alt="logo" />
        <a
          className="App-link"
          href="https://en.wikipedia.org/wiki/Mancala"
          target="_blank"
          rel="noopener noreferrer"
        >
        What is Mancala?
        </a>

      <header className="App-header">
        <Mancala />
      </header>
    </div>
  );
}

export default App;
