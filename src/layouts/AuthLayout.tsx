import type { ReactNode } from "react"
import AuthBrandPanel from "../components/auth/AuthBrandPanel"

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="w-full min-h-screen flex justify-center md:justify-start bg-white">
      <div className="w-96 flex flex-col gap-3 mx-12 my-4">
        {children}
      </div>
      <AuthBrandPanel />
    </div>
  )
}

export default AuthLayout
