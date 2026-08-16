import { Link } from "react-router-dom"
import Logo from "../../assets/logo.svg"
import PublicAuthActions from "../common/PublicAuthActions"

const Nav = () => {
  return (
    <div className="flex items-center justify-between py-6">
      <Link to="/" className="flex items-center gap-2">
        <div className="h-7">
          <img src={Logo} alt="AInvoker Logo" className="h-full" />
        </div>
        <div className="font-sans text-2xl font-semibold">AInvoker</div>
      </Link>
      <div className="flex items-center gap-2">
        <Link
          to="/docs"
          className="grid place-content-center rounded-lg border border-transparent px-3 py-2 text-center text-md font-semibold text-[#ccc] hover:border-white hover:text-white"
        >
          Docs
        </Link>
        <PublicAuthActions />
      </div>
    </div>
  )
}

export default Nav
