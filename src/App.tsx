import Header from "./components/ui/custom/header"
import Controller from "./Controller"

function App() {

  return <div className="h-screen font-poppins">
    <div className="flex justify-center items-start flex-col px-10 py-4 gap-5">
      <Header />
      <Controller />
    </div>
  </div>
}

export default App
