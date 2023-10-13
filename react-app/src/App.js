import logo from './logo.svg';
import './App.css';
import {Link, Route, Routes, useLocation} from "react-router-dom";

import React, {useEffect} from "react";

const { ReactTagManager } = require("react-tag-manager/dist/index.js");
window.dataTray = ReactTagManager.init("TM-KOR12") || {};

const HomeComponent = React.lazy(() => import("./component/HomeComponent"));

function App() {
    const location = useLocation();
    useEffect(() => {
            window.dataTray.random = Math.random();
            window.dataTray.userId = "taehee";
            ReactTagManager.attach();
            //TODO;
        return () => {
            ReactTagManager.detach();
            //TODO:
        }
    }, [location]);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
          <Routes>
            <Route path="/" element={
                <p className="App-link">
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
    </div>
  );
}

export default App;
