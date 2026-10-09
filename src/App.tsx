import { lazy } from "react"
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom"

import { RouteErrorBoundary } from "./components/common/ErrorBoundary"
import { AuthProvider } from "./contexts/AuthContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import { WorkspaceProvider } from "./contexts/WorkspaceContext"
import GuestRoutes from "./layouts/GuestRoutes"
import ProtectedRoutes from "./layouts/ProtectedRoutes"
import WorkspaceRoutes from "./layouts/WorkspaceRoutes"
import ProjectLayout from "./layouts/ProjectLayout"
import SettingsLayout from "./layouts/SettingsLayout"
import DocsLayout from "./layouts/DocsLayout"
import LegalLayout from "./layouts/LegalLayout"
import Dashboard from "./pages/workspace/Dashboard"
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
import Team from "./pages/workspace/Team"
import AcceptInvite from "./pages/invites/AcceptInvite"
import SettingsIndexRedirect from "./pages/workspace/settings/SettingsIndexRedirect"
import BillingCheckoutRedirect from "./pages/workspace/settings/BillingCheckoutRedirect"
import SettingsGeneral from "./pages/workspace/settings/General"
import SettingsProfile from "./pages/workspace/settings/Profile"
import SettingsAppearance from "./pages/workspace/settings/Appearance"
import SettingsSecurity from "./pages/workspace/settings/Security"
import Overview from "./pages/workspace/projects/Overview"
import ApiKeys from "./pages/workspace/projects/ApiKeys"
import Models from "./pages/workspace/projects/Models"
import Analytics from "./pages/workspace/projects/Analytics"
import Logs from "./pages/workspace/projects/Logs"
import ProjectSettings from "./pages/workspace/projects/Settings"

const BillingCheckout = lazy(() => import("./pages/workspace/BillingCheckout"))
const GettingStarted = lazy(() => import("./pages/docs/GettingStarted"))
const Authentication = lazy(() => import("./pages/docs/Authentication"))
const ApiKeysDocs = lazy(() => import("./pages/docs/ApiKeys"))
const TextChat = lazy(() => import("./pages/docs/TextChat"))
const TextStream = lazy(() => import("./pages/docs/TextStream"))
const ModelsDocs = lazy(() => import("./pages/docs/Models"))
const Limits = lazy(() => import("./pages/docs/Limits"))
const Errors = lazy(() => import("./pages/docs/Errors"))
const SdkOverview = lazy(() => import("./pages/docs/SdkOverview"))
const SdkNodejs = lazy(() => import("./pages/docs/SdkNodejs"))
const SdkBrowser = lazy(() => import("./pages/docs/SdkBrowser"))

function App() {
  return (
    <div className="selection:bg-[#dddddd] selection:text-accent">
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            {/*
              Root boundary sits under the router so it can reset on pathname,
              and under Auth/Theme so a page crash does not remount those providers.
              Outlet boundaries in the layouts catch page throws first and keep chrome.
            */}
            <RouteErrorBoundary fullScreen>
              <WorkspaceProvider>
                <Routes>
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
                    <Route path="text-stream" element={<TextStream />} />
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
                    <Route path="invites/accept" element={<AcceptInvite />} />
                  </Route>

                  <Route path="/" element={<WorkspaceRoutes />}>
                    <Route index element={<Dashboard />} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="projects/:projectId" element={<ProjectLayout />}>
                      <Route index element={<Overview />} />
                      <Route path="api-keys" element={<ApiKeys />} />
                      <Route path="models" element={<Models />} />
                      <Route path="actions" element={<Navigate to="../analytics" replace />} />
                      <Route path="analytics" element={<Analytics />} />
                      <Route path="logs" element={<Logs />} />
                      <Route path="settings" element={<ProjectSettings />} />
                    </Route>

                    <Route path="billing" element={<Navigate to="/settings/billing" replace />} />
                    <Route path="billing/checkout" element={<BillingCheckoutRedirect />} />
                    <Route path="team" element={<Navigate to="/settings/team" replace />} />

                    <Route path="settings">
                      <Route element={<SettingsLayout />}>
                        <Route index element={<SettingsIndexRedirect />} />
                        <Route path="general" element={<SettingsGeneral />} />
                        <Route path="team" element={<Team />} />
                        <Route path="billing" element={<Billing />} />
                        <Route path="profile" element={<SettingsProfile />} />
                        <Route path="appearance" element={<SettingsAppearance />} />
                        <Route path="security" element={<SettingsSecurity />} />
                      </Route>
                      <Route path="billing/checkout" element={<BillingCheckout />} />
                    </Route>
                  </Route>

                  <Route path="*" element={<>404</>} />
                </Routes>
              </WorkspaceProvider>
            </RouteErrorBoundary>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </div>
  )
}

export default App
