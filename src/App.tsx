import { Sidebar } from './components/layout/Sidebar'
import { ChatArea } from './components/layout/ChatArea'
import { Toaster } from './components/ui/Toaster'

function App() {
  return (
    <div className="flex h-full w-full overflow-hidden">
      <Sidebar />
      <ChatArea />
      <Toaster />
    </div>
  )
}

export default App
