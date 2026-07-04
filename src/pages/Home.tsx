import { useAuth } from "../contexts/AuthContext"
import Dashboard from "./Dashboard"
import Landing from "./Landing"

const Home = () => {
  const { user } = useAuth()
  
  return user ? <Dashboard /> : <Landing />
}

export default Home