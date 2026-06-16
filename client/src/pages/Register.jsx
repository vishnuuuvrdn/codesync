import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
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
      await api.post(
        "/auth/register",
        form,
      );
      navigate("/login");
    } catch (error) {
      console.log(error.response.data);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Register</h1>

      <input name="username" placeholder="username" onChange={handleChange} />

      <input name="email" placeholder="email" onChange={handleChange} />

      <input
        name="password"
        placeholder="password"
        type="password"
        onChange={handleChange}
      />

      <button>Create Account</button>
    </form>
  );
}

export default Register;
