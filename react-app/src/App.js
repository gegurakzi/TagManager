import logo from './logo.svg';
import './App.css';
import TagManager from "react-tag-manager";
import {BrowserRouter, Link, Route, Routes} from "react-router-dom";

import React, {useEffect} from "react";

let tagmanager = TagManager.initialiize({
  clientId: "TEST-1"
});
window.tagmamager.datas.random = 123;

const HomeComponent = React.lazy(() => import("./component/HomeComponent"));

function App() {
  return (
    <div className="App">
      <BrowserRouter>
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
              <Routes>
                <Route path="/" element={
                    <p>
                        Edit <code>src/App.js</code> and save to reload.
                    </p>
                }>
                </Route>
                <Route path="/explore" element={
                    <React.Suspense fallback={<>...</>}>
                        <HomeComponent />
                    </React.Suspense>}
                >
                </Route>
              </Routes>
            <a
              className="App-link"
              href="https://reactjs.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn React
            </a>
            <Link to="http://localhost:3000/explore">
              explore
            </Link>
          </header>
      </BrowserRouter>
    </div>
  );
}

export default App;
