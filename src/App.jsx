import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/home"
import History from "./pages/history"
import TabBar from "../src/components/TabBar";
import Exchange from "./pages/exchange";
import Check from "./pages/check";
import Analytics from "./pages/analytics";

const App = () => {
  return (
    <Router>
      <div className="pb">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/exchange" element={<Exchange />} />
          <Route path="/history/check/:id" element={<Check />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </div>

      <TabBar />
    </Router>
  )
}

export default App
