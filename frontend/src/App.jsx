import { Route, Routes } from "react-router-dom"
import { SparkDashboard } from "./components/Spark/SparkDashboard"
import AuthContainer from "./components/AuthContainer"
import { Container } from "./components/Container"
import { UploadVideo } from "./components/UploadVideo"
import { TestApi } from "./components/TestApi"
function App() {

      return (
            <Routes>

                  <Route path="/" element={<AuthContainer />} />
                  <Route path="/container" element={<Container />} />
                  <Route path="/sparkdashboard" element={<SparkDashboard />} />

            </Routes>
      )
}

export default App
