import Header from "./components/header";
import Home from "./components/home";
import Summaries from "./components/summaries";
import ProtectedRoute from "./components/procted-route";
import CategorySummaries from "./components/category-summaries";
import { Routes, Route } from "react-router-dom";
import "./styles/app.scss";

export default function App() {
  return (
    <>
      <Header/>
      <Routes>
        <Route path = "/" element = {<Home/>}/>
        <Route path = "/summaries" element = {<ProtectedRoute component = {Summaries} />} />
        <Route path = "/summaries/:category" element = {<ProtectedRoute component = {CategorySummaries} />} />
      </Routes>
    </>
  );
}