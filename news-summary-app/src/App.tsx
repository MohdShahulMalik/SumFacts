import Header from "./components/header";
import Home from "./components/home";
import Summaries from "./components/summaries";
import ProtectedRoute from "./components/procted-route";
import CategorySummaries from "./components/category-summaries";
import FactCheck from "./components/fact-check";
import About from "./components/about";
import Footer from "./components/footer";
import { Routes, Route } from "react-router-dom";
import "./styles/app.scss";

export default function App() {
  return (
    <>

      <Header/>

      <Routes>
        <Route path = "/" element = {<><Home/><Footer/></>}/>
        <Route path = "/summaries" element = {<ProtectedRoute component = {Summaries} />} />
        <Route path = "/summaries/:category" element = {<ProtectedRoute component = {CategorySummaries} />} />
        <Route path = "/fact-check" element = {<ProtectedRoute component = {FactCheck} />} />
        <Route path = "/about" element = {<About/>} />
      </Routes>
    </>
  );
}