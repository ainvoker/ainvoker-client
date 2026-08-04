import { useQuery } from "@tanstack/react-query"
import WorkspacePage from "../../components/workspace/WorkspacePage"

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

const Dashboard = () => {

//   const { data } = useQuery({
//     queryKey: ['chat'],
//     queryFn: async () => {
//       const res = await fetch(`${API_URL}/v1/text/chat`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": "Bearer ain_eWQROhSBOggupLy89wRjV3CUdyzS2OarLEGODymeR0E"
//         },
//         body: JSON.stringify({
//           model: "gemini/gemini-3.6-flash",
//           messages: [
//             {
//               role: "user",
//               content: "hello"
//             }
//           ]
//         })
//       })

//       const data = await res.json()

//       return data
//     }
//   })

//   console.log(data)

  return (
    <main className="flex-1 overflow-auto p-4 md:p-5 lg:p-6">
      <WorkspacePage
        title="Dashboard"
        description="Monitor inference traffic, model health, and infrastructure spend across your workspace."
      />
    </main>
  )
}

export default Dashboard
