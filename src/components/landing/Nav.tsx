import { Link } from "react-router-dom"
import Logo from "../../assets/logo.svg"

const Nav = () => {
  return (
    <div className="flex justify-between items-center py-6">
        <Link to={'/'} className="flex items-center gap-2">
            <div className="h-7">
                <img src={Logo} alt="AInvoker Logo" className="h-full" />
            </div>
            <div className="font-sans text-2xl font-semibold">Ainvoker</div>
        </Link>
        <div className="flex gap-2">
            <Link to={'/login'} className="px-4 py-2 font-semibold text-md grid place-content-center rounded-lg border border-transparent text-center hover:border-white" >Sign in</Link>
            <Link to={'/signup'} className="bg-white font-semibold text-md grid place-content-center text-accent px-4 py-2 rounded-lg text-center hover:brightness-95" >Sign up</Link>
        </div>
    </div>
  )
}

export default Nav