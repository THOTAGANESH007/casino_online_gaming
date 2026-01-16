import { useState } from "react";
import api from "../../api/client";

export default function RegionCreate({ tenantId, onCreated }) {
  const [timezone, setTimezone] = useState("");
  const [tax, setTax] = useState("");

  const handleCreate = async () => {
    const res = await api.post("/regions", {
      tenant_id: tenantId,
      time_zone: timezone,
      tax_rate: Number(tax),
    });
    onCreated(res.data);
    setTimezone("");
    setTax("");
  };

  return (
    <div>
      <h4>Add Region</h4>

      <input
        placeholder="Timezone"
        value={timezone}
        onChange={(e) => setTimezone(e.target.value)}
      />

      <input
        placeholder="Tax Rate"
        value={tax}
        onChange={(e) => setTax(e.target.value)}
      />

      <button onClick={handleCreate}>Add</button>
    </div>
  );
}
