import Header from "./components/header";
import Home from "./components/home";
import { Routes, Route } from "react-router-dom";
import Summaries from "./components/summaries";
import ProtectedRoute from "./components/procted-route";

export default function App() {
  return (
    <>
      <Header/>
      <Routes>
        <Route path = "/" element = {<Home/>}/>
        <Route path = "/summaries" element = {<ProtectedRoute component = {Summaries} />} />
      </Routes>
    </>
  );
}