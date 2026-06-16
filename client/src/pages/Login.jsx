import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";


function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/login", form);
      navigate("/dashboard");
    } catch (error) {
      console.log(error.response.data);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Login</h1>

      <input name="email" placeholder="email" onChange={handleChange} />

      <input
        name="password"
        type="password"
        placeholder="password"
        onChange={handleChange}
      />

      <button>Login</button>
    </form>
  );
}

export default Login;
