import { useEffect, useState } from "react";
import api from "../../api/client";

export default function TenantList({ onSelect }) {
  const [tenants, setTenants] = useState([]);

  useEffect(() => {
    api.get("/tenants").then((res) => setTenants(res.data));
  }, []);

  return (
    <div>
      <h3>Tenants</h3>

      <ul>
        {tenants.map((t) => (
          <li key={t.tenant_id}>
            {t.tenant_name}
            <button onClick={() => onSelect(t.tenant_id)}>
              Manage Regions
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
