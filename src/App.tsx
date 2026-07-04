import { BrowserRouter, Routes, Route } from "react-router-dom"

import { AuthProvider } from "./contexts/AuthContext"
import GuestRoutes from "./layouts/GuestRoutes"
import ProtectedRoutes from "./layouts/ProtectedRoutes"
import Home from "./pages/Home"
import Signup from "./pages/Signup"
import VerifyEmail from "./pages/VerifyEmail"
import AuthRoutes from "./layouts/AuthRoutes"
import Login from "./pages/Login"
import Terms from "./pages/Terms"
import Privacy from "./pages/Privacy"
import ForgotPassword from "./pages/ForgotPassword"
import VerifyResetPassword from "./pages/VerifyResetPassword"
import ResetPassword from "./pages/ResetPassword"

function App() {

  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>

            <Route index element={<Home />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route path="/" element={<GuestRoutes />}>
              <Route path="signup" element={<Signup />} />
              <Route path="login" element={<Login />} />
            </Route>

            <Route path="/" element={<AuthRoutes />}>
              <Route path="verify-email" element={<VerifyEmail />} />
              <Route path="verify-reset-password" element={<VerifyResetPassword />} />
              <Route path="reset-password" element={<ResetPassword />} />
            </Route>

            <Route path="/" element={<ProtectedRoutes />}>
              <Route index element={<h1>Hello Wolrd</h1>} />
            </Route>

            <Route path="*" element={<>404</>} />

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  )
}

export default App
