import { Outlet } from "react-router-dom"
import Footer from "../components/landing/Footer"
import Nav from "../components/landing/Nav"

const LegalLayout = () => (
  <div className="min-h-screen overflow-x-hidden bg-accent text-white">
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 md:px-10 lg:px-20">
      <Nav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  </div>
)

export default LegalLayout
