import { Route } from "react-router-dom";
import "./App.css";
import Homepage from "./pages/Homepage.js";
import Chats from "./pages/ChatPage.js";

function App() {
  return (
    <div className="App">
      <Route path="/" component={Homepage} exact />
      <Route path="/chats" component={Chats} />
    </div>
  );
}

export default App;
