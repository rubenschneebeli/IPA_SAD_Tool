import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import { AuthProvider, useAuth } from "./AuthContext"
import TemplatesPage from "./pages/TemplateOverviewPage"
import DocumentOverview from "./pages/DocumentOverviewPage"
import TemplateEditorPage from "./pages/TemplateEditorPage"
import DocumentEditorPage from './pages/DocumentEditorPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth()
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  return (
   <BrowserRouter>
     <AuthProvider>
       <Routes>
       <Route path="/" element={<Navigate to="/login" replace />} />
       <Route path="/login" element={<LoginPage />} />
       <Route path="/templates" element={<PrivateRoute><TemplatesPage /></PrivateRoute>} />
       <Route path="/templates/new" element={<PrivateRoute><TemplateEditorPage /></PrivateRoute>} />
       <Route path="/templates/:id/edit" element={<PrivateRoute><TemplateEditorPage /></PrivateRoute>} />
       
       <Route path="/documents" element={<PrivateRoute><DocumentOverview /></PrivateRoute>} />
       <Route path="/documents/new" element={<PrivateRoute><DocumentEditorPage /></PrivateRoute>} />
       <Route path="/documents/:id/edit" element={<PrivateRoute><DocumentEditorPage /></PrivateRoute>} />

       <Route path="*" element={<Navigate to="/templates" replace />} />
       </Routes>
     </AuthProvider>
   </BrowserRouter>
  )
}

export default App
