import { Route, Routes } from "react-router-dom"
import { SparkDashboard } from "./components/Spark/SparkDashboard"
import AuthContainer from "./components/AuthContainer"
import { Container } from "./components/Container"
import { TestApi } from "./components/TestApi"
import { Comment } from "./components/Comment"

// 1. Import your new Context Provider and Widget 
// (Make sure to adjust these paths based on where you saved the files!)
import { UploadProvider } from "./context/UploadContext"
import { GlobalUploadManager } from "./components/GlobalUploadManager"
import { UserProvider } from "./context/UserContext"

function App() {
      return (
            // 2. Wrap the entire app with the UploadProvider
            <UserProvider>            <UploadProvider>
                  {/* Added a relative wrapper to ensure the fixed widget positions correctly */}
                  <div className="relative min-h-screen">

                        <Routes>
                              <Route path="/login" element={<AuthContainer />} />
                              <Route path="/container" element={<Container />} />
                              <Route path="/sparkdashboard" element={<SparkDashboard />} />
                        </Routes>

                        {/* 3. Render the widget OUTSIDE the Routes */}
                        <GlobalUploadManager />

                  </div>
            </UploadProvider>

            </UserProvider>
      )
}

export default App