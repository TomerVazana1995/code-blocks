import CodeBlock from "./components/CodeBlock"
import Lobby from "./pages/Lobby"
import { Route, Routes } from "react-router-dom"

function App() {

  return (
      <Routes>
        <Route path="/" element={<Lobby/>}/>
        <Route path="code-block/:id" element={<CodeBlock/>}/>
      </Routes>
  )
}

export default App
