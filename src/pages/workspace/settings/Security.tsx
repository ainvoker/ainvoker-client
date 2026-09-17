import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate, useSearchParams } from "react-router-dom"
import WorkspacePage from "../../../components/workspace/WorkspacePage"
import Button from "../../../components/common/Button"
import InlineLoader from "../../../components/common/InlineLoader"
import OTPInput from "../../../components/common/OTPInput"
import { useAuth } from "../../../contexts/AuthContext"
import AuthService, {
  type AuthSessionRow,
} from "../../../services/AuthService"
import {
  changePasswordSchema,
  passwordWithConfirmSchema,
  type ChangePasswordFormValues,
  type PasswordWithConfirmValues,
} from "../../../types/common/passwordSchema"
import {
  type AuthAccount,
  canUnlinkProvider,
  findAccountByProvider,
  formatAuthLinkError,
  formatSessionDate,
  formatUserAgent,
  hasPasswordFromAccounts,
  isProviderLinked,
} from "../../../utils/accountSecurity"
import { clearStoredOrganizationId } from "../../../utils/workspace"
import { routes } from "../../../utils/navigation"

const inputClassName =
  "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-accent outline-none ring-accent/30 placeholder:text-neutral-400 focus:ring-2 dark:border-neutral-700 dark:bg-neutral-900 dark:placeholder:text-neutral-500"

const cardClassName =
  "max-w-2xl space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900"

const secondaryButtonClass =
  "!bg-transparent !px-3 !py-2 text-sm !text-neutral-600 ring-1 ring-neutral-200 hover:!bg-neutral-50 dark:!text-neutral-300 dark:ring-neutral-700 dark:hover:!bg-neutral-800"

type SetPasswordStep = "idle" | "otp" | "password"
type SocialProvider = "google" | "github"

const Security = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, appBootstrap, refresh } = useAuth()

  const email =
    appBootstrap?.user?.email ?? user?.email ?? null

  const [accounts, setAccounts] = useState<AuthAccount[]>([])
  const [sessions, setSessions] = useState<AuthSessionRow[]>([])
  const [currentSessionToken, setCurrentSessionToken] = useState<string | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [sessionsAvailable, setSessionsAvailable] = useState(true)
  const [revokeOthersAvailable, setRevokeOthersAvailable] = useState(true)
  const [showDeleteSection, setShowDeleteSection] = useState(true)

  const [pageError, setPageError] = useState<string | null>(null)
  const [pageSuccess, setPageSuccess] = useState<string | null>(null)

  const [linkingProvider, setLinkingProvider] = useState<SocialProvider | null>(
    null,
  )
  const [unlinkingProvider, setUnlinkingProvider] =
    useState<SocialProvider | null>(null)

  const [setPasswordStep, setSetPasswordStep] =
    useState<SetPasswordStep>("idle")
  const [setPasswordOtp, setSetPasswordOtp] = useState("")
  const [setPasswordOtpError, setSetPasswordOtpError] = useState<string | null>(
    null,
  )
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [verifiedOtp, setVerifiedOtp] = useState<string | null>(null)
  const [resendCountdown, setResendCountdown] = useState(0)

  const [changeSuccess, setChangeSuccess] = useState<string | null>(null)
  const [changeError, setChangeError] = useState<string | null>(null)
  const [revokeOtherDevices, setRevokeOtherDevices] = useState(true)

  const [setPasswordSuccess, setSetPasswordSuccess] = useState<string | null>(
    null,
  )
  const [setPasswordError, setSetPasswordError] = useState<string | null>(null)

  const [isRevokingOthers, setIsRevokingOthers] = useState(false)
  const [revokingToken, setRevokingToken] = useState<string | null>(null)
  const [sessionsMessage, setSessionsMessage] = useState<string | null>(null)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("")
  const [deletePassword, setDeletePassword] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const hasPassword = hasPasswordFromAccounts(accounts)
  const googleLinked = isProviderLinked(accounts, "google")
  const githubLinked = isProviderLinked(accounts, "github")
  const canUnlinkGoogle = canUnlinkProvider(accounts, "google")
  const canUnlinkGithub = canUnlinkProvider(accounts, "github")

  const securityCallbackURL = useMemo(() => {
    if (typeof window === "undefined") return routes.settingsSecurity
    return `${window.location.origin}${routes.settingsSecurity}`
  }, [])

  const loadSecurityData = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)

    const [accountsData, accountsErr] = await AuthService.listAccounts()
    if (accountsErr || !accountsData) {
      setLoadError(accountsErr ?? "Failed to load sign-in methods")
      setAccounts([])
    } else {
      setAccounts(accountsData)
    }

    const [sessionData] = await AuthService.getAuthUser()
    const token = sessionData?.session?.token ?? null
    setCurrentSessionToken(token)

    const [sessionsData, sessionsErr] = await AuthService.listSessions()
    if (sessionsErr || !sessionsData) {
      setSessionsAvailable(false)
      setSessions([])
    } else {
      setSessionsAvailable(true)
      setSessions(sessionsData)
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    void loadSecurityData()
  }, [loadSecurityData])

  useEffect(() => {
    const errorParam =
      searchParams.get("error") ??
      searchParams.get("error_description") ??
      searchParams.get("message")
    const formatted = formatAuthLinkError(errorParam)
    if (formatted) {
      setPageError(formatted)
    }

    if (
      searchParams.has("error") ||
      searchParams.has("error_description") ||
      searchParams.has("message")
    ) {
      const next = new URLSearchParams(searchParams)
      next.delete("error")
      next.delete("error_description")
      next.delete("message")
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams])

  useEffect(() => {
    if (resendCountdown <= 0) return
    const interval = setInterval(() => {
      setResendCountdown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [resendCountdown])

  const changeForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onTouched",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const setPasswordForm = useForm<PasswordWithConfirmValues>({
    resolver: zodResolver(passwordWithConfirmSchema),
    mode: "onTouched",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const startSetPassword = async () => {
    if (!email) {
      setSetPasswordError("No email on this account")
      return
    }

    setSetPasswordError(null)
    setSetPasswordSuccess(null)
    setIsSendingOtp(true)
    const [, err] = await AuthService.requestResetPassword({ email })
    setIsSendingOtp(false)

    if (err) {
      setSetPasswordError(err)
      return
    }

    setSetPasswordStep("otp")
    setSetPasswordOtp("")
    setSetPasswordOtpError(null)
    setVerifiedOtp(null)
    setResendCountdown(60)
  }

  const handleVerifySetPasswordOtp = async (event: FormEvent) => {
    event.preventDefault()
    if (!email || setPasswordOtp.length !== 6) return

    setIsVerifyingOtp(true)
    setSetPasswordOtpError(null)
    const [, err] = await AuthService.verifyResetPassword({
      email,
      otp: setPasswordOtp,
    })
    setIsVerifyingOtp(false)

    if (err) {
      setSetPasswordOtpError(err)
      return
    }

    setVerifiedOtp(setPasswordOtp)
    setSetPasswordStep("password")
  }

  const handleResendSetPasswordOtp = async () => {
    if (!email || resendCountdown > 0) return
    setSetPasswordOtp("")
    setSetPasswordOtpError(null)
    await AuthService.requestResetPassword({ email })
    setResendCountdown(60)
  }

  const onSubmitSetPassword: SubmitHandler<PasswordWithConfirmValues> = async ({
    password,
  }) => {
    if (!email || !verifiedOtp) return

    setSetPasswordError(null)
    const [, err] = await AuthService.resetPassword({
      email,
      otp: verifiedOtp,
      password,
    })

    if (err) {
      setSetPasswordError(err)
      return
    }

    setPasswordForm.reset()
    setVerifiedOtp(null)
    setSetPasswordOtp("")
    setSetPasswordStep("idle")
    setSetPasswordSuccess("Password set. You can sign in with email and password.")
    await loadSecurityData()
  }

  const onSubmitChangePassword: SubmitHandler<
    ChangePasswordFormValues
  > = async ({ currentPassword, newPassword }) => {
    setChangeError(null)
    setChangeSuccess(null)

    const [, err] = await AuthService.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: revokeOtherDevices,
    })

    if (err) {
      setChangeError(err)
      return
    }

    changeForm.reset()
    setChangeSuccess(
      revokeOtherDevices
        ? "Password updated. Other devices were signed out."
        : "Password updated.",
    )
    await loadSecurityData()
  }

  const handleLink = async (provider: SocialProvider) => {
    setPageError(null)
    setPageSuccess(null)
    setLinkingProvider(provider)
    const [, err] = await AuthService.linkSocial({
      provider,
      callbackURL: securityCallbackURL,
      errorCallbackURL: securityCallbackURL,
    })
    setLinkingProvider(null)

    if (err) {
      setPageError(formatAuthLinkError(err) ?? err)
    }
  }

  const handleUnlink = async (provider: SocialProvider) => {
    if (!canUnlinkProvider(accounts, provider)) {
      setPageError("Keep at least one sign-in method on your account.")
      return
    }

    setPageError(null)
    setPageSuccess(null)
    setUnlinkingProvider(provider)

    const account = findAccountByProvider(accounts, provider)
    const [, err] = await AuthService.unlinkAccount({
      providerId: provider,
      ...(account?.accountId ? { accountId: account.accountId } : {}),
    })
    setUnlinkingProvider(null)

    if (err) {
      setPageError(err)
      return
    }

    setPageSuccess(
      provider === "google" ? "Google disconnected." : "GitHub disconnected.",
    )
    await loadSecurityData()
  }

  const handleRevokeSession = async (token: string) => {
    setSessionsMessage(null)
    setRevokingToken(token)
    const [, err] = await AuthService.revokeSession({ token })
    setRevokingToken(null)

    if (err) {
      setSessionsMessage(err)
      return
    }

    setSessionsMessage("Session signed out.")
    await loadSecurityData()
  }

  const handleRevokeOtherSessions = async () => {
    setSessionsMessage(null)
    setIsRevokingOthers(true)
    const [, err] = await AuthService.revokeOtherSessions()
    setIsRevokingOthers(false)

    if (err) {
      setRevokeOthersAvailable(false)
      setSessionsMessage(
        "Could not sign out other devices from here. Use “Sign out other devices” when changing your password.",
      )
      return
    }

    setSessionsMessage("Signed out of other devices.")
    await loadSecurityData()
  }

  const deleteEmailMatches =
    !!email &&
    deleteConfirmEmail.trim().toLowerCase() === email.trim().toLowerCase()

  const handleDeleteAccount = async (event: FormEvent) => {
    event.preventDefault()
    if (!deleteEmailMatches) return

    setDeleteError(null)
    setIsDeleting(true)

    const [, err] = await AuthService.deleteUser({
      ...(hasPassword && deletePassword ? { password: deletePassword } : {}),
      callbackURL: window.location.origin,
    })

    if (err) {
      setIsDeleting(false)
      const lower = err.toLowerCase()
      if (
        lower.includes("not enabled") ||
        lower.includes("disabled") ||
        lower.includes("forbidden") ||
        lower.includes("not allowed")
      ) {
        setShowDeleteSection(false)
        setPageError("Account deletion is not available for this auth project.")
        return
      }
      setDeleteError(err)
      return
    }

    clearStoredOrganizationId()
    await AuthService.signout()
    await refresh()
    navigate("/", { replace: true })
  }

  if (isLoading) {
    return (
      <WorkspacePage
        title="Security"
        description="Password, connected accounts, and signed-in devices."
      >
        <div className={cardClassName}>
          <InlineLoader label="Loading security settings…" />
        </div>
      </WorkspacePage>
    )
  }

  return (
    <WorkspacePage
      title="Security"
      description="Password, connected accounts, and signed-in devices."
    >
      <div className="flex max-w-2xl flex-col gap-6">
        {loadError ? (
          <p className="text-sm text-red-600 dark:text-red-400">{loadError}</p>
        ) : null}
        {pageError ? (
          <p className="text-sm text-red-600 dark:text-red-400">{pageError}</p>
        ) : null}
        {pageSuccess ? (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            {pageSuccess}
          </p>
        ) : null}

        {/* Sign-in methods */}
        <section className={cardClassName}>
          <div>
            <p className="text-sm font-medium text-accent">Sign-in methods</p>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              How you can access this account. When connecting Google or GitHub,
              use the same verified email as this account.
            </p>
          </div>

          <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
            <li className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="text-sm font-medium text-accent">
                  Email + password
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {email ?? "No email"}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                  hasPassword
                    ? "bg-neutral-100 text-accent dark:bg-neutral-800"
                    : "bg-neutral-50 text-neutral-500 dark:bg-neutral-950 dark:text-neutral-400"
                }`}
              >
                {hasPassword ? "Enabled" : "Not set"}
              </span>
            </li>

            {(
              [
                {
                  id: "google" as const,
                  label: "Google",
                  linked: googleLinked,
                  canUnlink: canUnlinkGoogle,
                },
                {
                  id: "github" as const,
                  label: "GitHub",
                  linked: githubLinked,
                  canUnlink: canUnlinkGithub,
                },
              ] as const
            ).map(({ id, label, linked, canUnlink }) => (
              <li
                key={id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-accent">{label}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {linked ? "Connected" : "Not linked"}
                  </p>
                </div>
                {linked ? (
                  <Button
                    type="button"
                    className={secondaryButtonClass}
                    loading={unlinkingProvider === id}
                    disabled={!canUnlink || linkingProvider !== null}
                    onClick={() => void handleUnlink(id)}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="!px-3 !py-2 text-sm"
                    loading={linkingProvider === id}
                    disabled={
                      linkingProvider !== null || unlinkingProvider !== null
                    }
                    onClick={() => void handleLink(id)}
                  >
                    Connect
                  </Button>
                )}
              </li>
            ))}
          </ul>

          {(googleLinked && !canUnlinkGoogle) ||
          (githubLinked && !canUnlinkGithub) ? (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              You need at least one sign-in method. Add another before
              disconnecting this one.
            </p>
          ) : null}
        </section>

        {/* Password */}
        <section className={cardClassName}>
          <div>
            <p className="text-sm font-medium text-accent">
              {hasPassword ? "Change password" : "Set a password"}
            </p>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {hasPassword
                ? "Update the password for email sign-in."
                : "Add email and password sign-in. We’ll send a one-time code to verify it’s you."}
            </p>
          </div>

          {hasPassword ? (
            <form
              className="space-y-4"
              onSubmit={changeForm.handleSubmit(onSubmitChangePassword)}
              autoComplete="off"
            >
              <label className="block text-sm">
                <span className="mb-1.5 block text-xs tracking-wide text-neutral-400 uppercase">
                  Current password
                </span>
                <input
                  type="password"
                  className={inputClassName}
                  autoComplete="current-password"
                  disabled={changeForm.formState.isSubmitting}
                  {...changeForm.register("currentPassword")}
                />
                {changeForm.formState.errors.currentPassword ? (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {changeForm.formState.errors.currentPassword.message}
                  </p>
                ) : null}
              </label>

              <label className="block text-sm">
                <span className="mb-1.5 block text-xs tracking-wide text-neutral-400 uppercase">
                  New password
                </span>
                <input
                  type="password"
                  className={inputClassName}
                  autoComplete="new-password"
                  disabled={changeForm.formState.isSubmitting}
                  {...changeForm.register("newPassword")}
                />
                {changeForm.formState.errors.newPassword ? (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {changeForm.formState.errors.newPassword.message}
                  </p>
                ) : null}
              </label>

              <label className="block text-sm">
                <span className="mb-1.5 block text-xs tracking-wide text-neutral-400 uppercase">
                  Confirm new password
                </span>
                <input
                  type="password"
                  className={inputClassName}
                  autoComplete="new-password"
                  disabled={changeForm.formState.isSubmitting}
                  {...changeForm.register("confirmPassword")}
                />
                {changeForm.formState.errors.confirmPassword ? (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {changeForm.formState.errors.confirmPassword.message}
                  </p>
                ) : null}
              </label>

              <label className="flex cursor-pointer items-start gap-2.5 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 rounded border-neutral-300 text-accent focus:ring-accent"
                  checked={revokeOtherDevices}
                  onChange={(event) =>
                    setRevokeOtherDevices(event.target.checked)
                  }
                  disabled={changeForm.formState.isSubmitting}
                />
                <span className="text-neutral-600 dark:text-neutral-300">
                  Sign out other devices
                </span>
              </label>

              {changeError ? (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {changeError}
                </p>
              ) : null}
              {changeSuccess ? (
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  {changeSuccess}
                </p>
              ) : null}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="!px-4 !py-2.5 text-sm"
                  loading={changeForm.formState.isSubmitting}
                  disabled={
                    !changeForm.formState.isDirty ||
                    !changeForm.formState.isValid
                  }
                >
                  Update password
                </Button>
              </div>
            </form>
          ) : setPasswordStep === "idle" ? (
            <div className="space-y-3">
              {setPasswordSuccess ? (
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  {setPasswordSuccess}
                </p>
              ) : null}
              {setPasswordError ? (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {setPasswordError}
                </p>
              ) : null}
              <Button
                type="button"
                className="!px-4 !py-2.5 text-sm"
                loading={isSendingOtp}
                disabled={!email}
                onClick={() => void startSetPassword()}
              >
                Set a password
              </Button>
            </div>
          ) : setPasswordStep === "otp" ? (
            <form
              className="space-y-3"
              onSubmit={(event) => void handleVerifySetPasswordOtp(event)}
            >
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Enter the six-digit code we sent to{" "}
                <span className="font-medium text-accent">{email}</span>.
              </p>
              <div className="overflow-x-auto">
                <OTPInput
                  value={setPasswordOtp}
                  onChange={setSetPasswordOtp}
                  error={setPasswordOtpError}
                  setError={setSetPasswordOtpError}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="submit"
                  className="!px-4 !py-2.5 text-sm"
                  loading={isVerifyingOtp}
                  disabled={setPasswordOtp.length !== 6 || !!setPasswordOtpError}
                >
                  Verify code
                </Button>
                <Button
                  type="button"
                  className={secondaryButtonClass}
                  disabled={resendCountdown > 0 || isVerifyingOtp}
                  onClick={() => void handleResendSetPasswordOtp()}
                >
                  {resendCountdown > 0
                    ? `Resend in ${resendCountdown}s`
                    : "Resend code"}
                </Button>
                <Button
                  type="button"
                  className={secondaryButtonClass}
                  disabled={isVerifyingOtp}
                  onClick={() => {
                    setSetPasswordStep("idle")
                    setSetPasswordOtp("")
                    setSetPasswordOtpError(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <form
              className="space-y-4"
              onSubmit={setPasswordForm.handleSubmit(onSubmitSetPassword)}
              autoComplete="off"
            >
              <label className="block text-sm">
                <span className="mb-1.5 block text-xs tracking-wide text-neutral-400 uppercase">
                  New password
                </span>
                <input
                  type="password"
                  className={inputClassName}
                  autoComplete="new-password"
                  disabled={setPasswordForm.formState.isSubmitting}
                  {...setPasswordForm.register("password")}
                />
                {setPasswordForm.formState.errors.password ? (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {setPasswordForm.formState.errors.password.message}
                  </p>
                ) : null}
              </label>

              <label className="block text-sm">
                <span className="mb-1.5 block text-xs tracking-wide text-neutral-400 uppercase">
                  Confirm password
                </span>
                <input
                  type="password"
                  className={inputClassName}
                  autoComplete="new-password"
                  disabled={setPasswordForm.formState.isSubmitting}
                  {...setPasswordForm.register("confirmPassword")}
                />
                {setPasswordForm.formState.errors.confirmPassword ? (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {setPasswordForm.formState.errors.confirmPassword.message}
                  </p>
                ) : null}
              </label>

              {setPasswordError ? (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {setPasswordError}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Button
                  type="submit"
                  className="!px-4 !py-2.5 text-sm"
                  loading={setPasswordForm.formState.isSubmitting}
                  disabled={
                    !setPasswordForm.formState.isDirty ||
                    !setPasswordForm.formState.isValid
                  }
                >
                  Save password
                </Button>
                <Button
                  type="button"
                  className={secondaryButtonClass}
                  disabled={setPasswordForm.formState.isSubmitting}
                  onClick={() => {
                    setSetPasswordStep("idle")
                    setVerifiedOtp(null)
                    setPasswordForm.reset()
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </section>

        {/* Sessions */}
        <section className={cardClassName}>
          <div>
            <p className="text-sm font-medium text-accent">Signed-in devices</p>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {sessionsAvailable
                ? "Active sessions for this account."
                : "Device list isn’t available from Neon Auth right now. You can still sign out other devices when changing your password."}
            </p>
          </div>

          {sessionsAvailable && sessions.length > 0 ? (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {sessions.map((session) => {
                const isCurrent =
                  !!currentSessionToken &&
                  session.token === currentSessionToken
                return (
                  <li
                    key={session.id}
                    className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium text-accent">
                          {formatUserAgent(session.userAgent)}
                        </p>
                        {isCurrent ? (
                          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-accent dark:bg-neutral-800">
                            Current
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                        Last active {formatSessionDate(session.updatedAt)}
                        {session.ipAddress
                          ? ` · ${session.ipAddress}`
                          : ""}
                      </p>
                    </div>
                    {!isCurrent ? (
                      <Button
                        type="button"
                        className={secondaryButtonClass}
                        loading={revokingToken === session.token}
                        disabled={
                          revokingToken !== null || isRevokingOthers
                        }
                        onClick={() => void handleRevokeSession(session.token)}
                      >
                        Revoke
                      </Button>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          ) : null}

          {sessionsMessage ? (
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              {sessionsMessage}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {revokeOthersAvailable ? (
              <Button
                type="button"
                className={secondaryButtonClass}
                loading={isRevokingOthers}
                disabled={
                  isRevokingOthers ||
                  (sessionsAvailable &&
                    sessions.filter(
                      (s) => s.token !== currentSessionToken,
                    ).length === 0)
                }
                onClick={() => void handleRevokeOtherSessions()}
              >
                Sign out of other devices
              </Button>
            ) : (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Changing your password with “Sign out other devices” checked
                will end other sessions.
              </p>
            )}
          </div>
        </section>

        {/* Danger */}
        {showDeleteSection ? (
          <section className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-red-600 dark:text-red-400">
                Danger zone
              </h2>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Permanently delete your auth account. App workspace data may
                remain until cleaned up separately.
              </p>
            </div>

            <div className="rounded-2xl border border-red-200/80 bg-white p-5 dark:border-red-900/50 dark:bg-neutral-900">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-accent">
                    Delete account
                  </p>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    This signs you out and removes your Neon Auth user. It
                    cannot be undone from the app.
                  </p>
                </div>
                {!showDeleteConfirm ? (
                  <Button
                    type="button"
                    className="!bg-red-600 !px-3 !py-2 text-sm shrink-0 hover:!brightness-95 dark:!bg-red-500 dark:!text-white"
                    onClick={() => {
                      setShowDeleteConfirm(true)
                      setDeleteError(null)
                      setDeleteConfirmEmail("")
                      setDeletePassword("")
                    }}
                  >
                    Delete account
                  </Button>
                ) : null}
              </div>

              {showDeleteConfirm ? (
                <form
                  onSubmit={(event) => void handleDeleteAccount(event)}
                  className="mt-4 space-y-3 border-t border-red-100 pt-4 dark:border-red-900/40"
                  autoComplete="off"
                >
                  <label className="block text-sm">
                    <span className="mb-1.5 block text-xs tracking-wide text-neutral-400 uppercase">
                      Type “{email}” to confirm
                    </span>
                    <input
                      type="email"
                      value={deleteConfirmEmail}
                      onChange={(event) =>
                        setDeleteConfirmEmail(event.target.value)
                      }
                      className={inputClassName}
                      disabled={isDeleting || !email}
                      autoComplete="off"
                      placeholder={email ?? "email"}
                    />
                  </label>

                  {hasPassword ? (
                    <label className="block text-sm">
                      <span className="mb-1.5 block text-xs tracking-wide text-neutral-400 uppercase">
                        Password
                      </span>
                      <input
                        type="password"
                        value={deletePassword}
                        onChange={(event) =>
                          setDeletePassword(event.target.value)
                        }
                        className={inputClassName}
                        disabled={isDeleting}
                        autoComplete="current-password"
                      />
                    </label>
                  ) : (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      OAuth-only accounts may require an email confirmation from
                      Neon Auth to finish deletion.
                    </p>
                  )}

                  {deleteError ? (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {deleteError}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="submit"
                      className="!bg-red-600 !px-3 !py-2 text-sm hover:!brightness-95 dark:!bg-red-500 dark:!text-white"
                      loading={isDeleting}
                      disabled={
                        !deleteEmailMatches ||
                        (hasPassword && !deletePassword) ||
                        isDeleting
                      }
                    >
                      Confirm delete
                    </Button>
                    <Button
                      type="button"
                      className={secondaryButtonClass}
                      disabled={isDeleting}
                      onClick={() => {
                        setShowDeleteConfirm(false)
                        setDeleteConfirmEmail("")
                        setDeletePassword("")
                        setDeleteError(null)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : null}
            </div>
          </section>
        ) : null}
      </div>
    </WorkspacePage>
  )
}

export default Security
