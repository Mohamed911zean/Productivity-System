import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase.ts";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged in successfully!");
      navigate("/notes"); 
    } catch (error) {
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-3xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-3 rounded-xl bg-zinc-800 text-white outline-none placeholder-gray-400"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 px-4 py-3 rounded-xl bg-zinc-800 text-white outline-none placeholder-gray-400"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 bg-yellow-500 rounded-xl text-black font-semibold hover:bg-yellow-400 transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Link to SignUp */}
        <p className="text-center mt-4 text-gray-400 text-sm">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-yellow-500 hover:text-yellow-400 font-semibold"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
