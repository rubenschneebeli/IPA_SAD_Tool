import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import { AuthProvider } from "./AuthContext"


function App() {
  return (
   <BrowserRouter>
     <AuthProvider>
       <Routes>
       <Route path="/" element={<Navigate to="/login" replace />} />
       <Route path="/login" element={<LoginPage />} />

       </Routes>
     </AuthProvider>
   </BrowserRouter>
  )
}

export default App
