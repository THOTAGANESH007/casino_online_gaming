import { useState } from "react";
import api from "../api/client";

export default function KycForm({ userId }) {
  const [form, setForm] = useState({
    document_type: "aadhar",
    document_number: "",
  });
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post(`/user/kyc-verification?user_id=${userId}`, form);
    setDone(true);
  };

  if (done) {
    return (
      <p>
        KYC submitted successfully. We will verify and send you an email within
        2 days.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>KYC Verification</h2>

      <select
        onChange={(e) => setForm({ ...form, document_type: e.target.value })}
      >
        <option value="aadhar">Aadhaar</option>
        <option value="pan">PAN</option>
      </select>

      <input
        placeholder="Document Number"
        onChange={(e) => setForm({ ...form, document_number: e.target.value })}
        required
      />

      <button type="submit">Submit KYC</button>
    </form>
  );
}
