import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import SignUp from './Components/auth/Signup-form.jsx';
import NotesApp from './Components/NotesManger.jsx'
import Login from './Components/auth/Login-form.jsx'
const App = () => {
  return (
   <>
              <Toaster position="top-center" reverseOrder={false} />
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/notes" element={<NotesApp />} />
    </Routes>
      
    </>
  )
}

export default App