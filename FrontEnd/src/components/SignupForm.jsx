import { useState } from "react";
import api from "../api/client";

export default function SignupForm({ onNext }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    role: "player",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await api.post("/user/signup", form);
    onNext(res.data.user_id, res.data.next_step);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Signup</h2>

      <input
        name="first_name"
        placeholder="First Name"
        onChange={handleChange}
        required
      />
      <input name="last_name" placeholder="Last Name" onChange={handleChange} />
      <input
        name="email"
        type="email"
        placeholder="Email"
        onChange={handleChange}
        required
      />
      <input name="phone" placeholder="Phone" onChange={handleChange} />
      <input
        name="password"
        type="password"
        placeholder="Password"
        onChange={handleChange}
        required
      />

      <button type="submit">Continue</button>
    </form>
  );
}
