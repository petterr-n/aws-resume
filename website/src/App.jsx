import { useState } from 'react'
import Resume from './Resume'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Resume />
    </>
  )
}

export default App
