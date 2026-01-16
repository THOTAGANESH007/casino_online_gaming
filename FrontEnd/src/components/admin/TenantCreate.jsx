import { useState } from "react";
import api from "../../api/client";

export default function TenantCreate({ onCreated }) {
  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState("");

  const handleCreate = async () => {
    const res = await api.post("/tenants", {
      tenant_name: name,
      default_timezone: timezone,
    });
    onCreated(res.data);
    setName("");
    setTimezone("");
  };

  return (
    <div>
      <h3>Create Tenant</h3>

      <input
        placeholder="Tenant Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="Default Timezone"
        value={timezone}
        onChange={(e) => setTimezone(e.target.value)}
      />

      <button onClick={handleCreate}>Create</button>
    </div>
  );
}
