import Header from "./components/header";
import Home from "./components/home";
import { Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <>
      <Header/>
      <Routes>
        <Route path = "/" element = {<Home/>}/>
      </Routes>
    </>
  );
}