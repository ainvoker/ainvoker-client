import { useAuth } from "../contexts/AuthContext"
import AuthService from "../services/AuthService"

const Dashboard = () => {
    const { refresh } = useAuth()

    const handleLogout = async () => {
        await AuthService.signout()

        refresh()
    }

    return (
        <div>
            <button className="btn" onClick={handleLogout}>Log out</button>
        </div>
    )
}

export default Dashboard