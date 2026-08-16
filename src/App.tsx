import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom"

import { AuthProvider } from "./contexts/AuthContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import { WorkspaceProvider } from "./contexts/WorkspaceContext"
import GuestRoutes from "./layouts/GuestRoutes"
import ProtectedRoutes from "./layouts/ProtectedRoutes"
import WorkspaceLayout from "./layouts/WorkspaceLayout"
import ProjectLayout from "./layouts/ProjectLayout"
import DocsLayout from "./layouts/DocsLayout"
import LegalLayout from "./layouts/LegalLayout"
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
import Projects from "./pages/workspace/Projects"
import Billing from "./pages/workspace/Billing"
import BillingCheckout from "./pages/workspace/BillingCheckout"
import Team from "./pages/workspace/Team"
import Settings from "./pages/workspace/Settings"
import Overview from "./pages/workspace/projects/Overview"
import ApiKeys from "./pages/workspace/projects/ApiKeys"
import Models from "./pages/workspace/projects/Models"
import Actions from "./pages/workspace/projects/Actions"
import Analytics from "./pages/workspace/projects/Analytics"
import Logs from "./pages/workspace/projects/Logs"
import ProjectSettings from "./pages/workspace/projects/Settings"
import GettingStarted from "./pages/docs/GettingStarted"
import Authentication from "./pages/docs/Authentication"
import ApiKeysDocs from "./pages/docs/ApiKeys"
import TextChat from "./pages/docs/TextChat"
import ModelsDocs from "./pages/docs/Models"
import Limits from "./pages/docs/Limits"
import Errors from "./pages/docs/Errors"
import SdkOverview from "./pages/docs/SdkOverview"
import SdkNodejs from "./pages/docs/SdkNodejs"
import SdkBrowser from "./pages/docs/SdkBrowser"

function App() {
  return (
    <div className="selection:bg-[#dddddd] selection:text-accent">
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <WorkspaceProvider>
              <Routes>
                <Route index element={<Home />} />
                <Route element={<LegalLayout />}>
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                </Route>
                <Route path="/forgot-password" element={<ForgotPassword />} />

                <Route path="docs" element={<DocsLayout />}>
                  <Route index element={<Navigate to="getting-started" replace />} />
                  <Route path="getting-started" element={<GettingStarted />} />
                  <Route path="authentication" element={<Authentication />} />
                  <Route path="api-keys" element={<ApiKeysDocs />} />
                  <Route path="text-chat" element={<TextChat />} />
                  <Route path="models" element={<ModelsDocs />} />
                  <Route path="limits" element={<Limits />} />
                  <Route path="errors" element={<Errors />} />
                  <Route path="sdk" element={<SdkOverview />} />
                  <Route path="sdk/nodejs" element={<SdkNodejs />} />
                  <Route path="sdk/browser" element={<SdkBrowser />} />
                </Route>
                <Route path="v1/docs/*" element={<Navigate to="/docs" replace />} />

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
                  <Route element={<WorkspaceLayout />}>
                    <Route path="projects" element={<Projects />} />
                    <Route path="projects/:projectId" element={<ProjectLayout />}>
                      <Route index element={<Overview />} />
                      <Route path="api-keys" element={<ApiKeys />} />
                      <Route path="models" element={<Models />} />
                      <Route path="actions" element={<Actions />} />
                      <Route path="analytics" element={<Analytics />} />
                      <Route path="logs" element={<Logs />} />
                      <Route path="settings" element={<ProjectSettings />} />
                    </Route>
                    <Route path="billing" element={<Billing />} />
                    <Route path="billing/checkout" element={<BillingCheckout />} />
                    <Route path="team" element={<Team />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                </Route>

                <Route path="*" element={<>404</>} />
              </Routes>
            </WorkspaceProvider>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </div>
  )
}

export default App
