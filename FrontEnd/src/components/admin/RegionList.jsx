import { useEffect, useState } from "react";
import api from "../../api/client";
import RegionCreate from "./RegionCreate";

export default function RegionList({ tenantId }) {
  const [regions, setRegions] = useState([]);

  const load = () => {
    api.get(`/regions/tenant/${tenantId}`).then((res) => {
      setRegions(res.data);
    });
  };

  useEffect(load, [tenantId]);

  return (
    <div>
      <h3>Regions</h3>

      <RegionCreate tenantId={tenantId} onCreated={load} />

      <ul>
        {regions.map((r) => (
          <li key={r.region_id}>
            {r.time_zone} — Tax: {r.tax_rate}%
          </li>
        ))}
      </ul>
    </div>
  );
}
