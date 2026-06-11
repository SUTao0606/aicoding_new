import { Sidebar } from './components/layout/Sidebar'
import { ChatArea } from './components/layout/ChatArea'

function App() {
  return (
    <div className="flex h-full w-full overflow-hidden">
      <Sidebar />
      <ChatArea />
    </div>
  )
}

export default App
