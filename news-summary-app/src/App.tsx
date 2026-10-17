import Header from "./components/header";
import Home from "./pages/home";
import Summaries from "./pages/summaries";
import ProtectedRoute from "./components/procted-route";
import CategorySummaries from "./pages/category-summaries";
import FactCheck from "./pages/fact-check";
import About from "./pages/about";
import Footer from "./components/footer";
import { Routes, Route } from "react-router-dom";
import "./styles/app.scss";
import Loading from "./pages/loading";

export default function App() {
  return (
    <>

      <Header/>

      <Routes>
        <Route path = "/" element = {<><Home/><Footer/></>}/>
        <Route path = "/load" element = {<Loading/>} />
        <Route path = "/summaries" element = {<ProtectedRoute component = {Summaries} />} />
        <Route path = "/summaries/:category" element = {<ProtectedRoute component = {CategorySummaries} />} />
        <Route path = "/fact-check" element = {<ProtectedRoute component = {FactCheck} />} />
        <Route path = "/about" element = {<About/>} />
      </Routes>
    </>
  );
}
