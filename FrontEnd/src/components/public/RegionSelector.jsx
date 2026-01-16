import { useEffect, useState } from "react";
import api from "../../api/client";

export default function RegionSelector({ onSelect }) {
  const [regions, setRegions] = useState([]);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    api.get("/regions/public").then((res) => {
      setRegions(res.data);
    });
  }, []);

  const handleContinue = () => {
    const region = regions.find((r) => r.region_id === Number(selected));
    onSelect(region);
  };

  return (
    <div>
      <h3>Select Your Region</h3>

      <select onChange={(e) => setSelected(e.target.value)}>
        <option value="">Select region</option>
        {regions.map((r) => (
          <option key={r.region_id} value={r.region_id}>
            Tenant {r.tenant_id} – {r.tenant_name} – {r.time_zone}
          </option>
        ))}
      </select>

      <br />
      <br />
      <button disabled={!selected} onClick={handleContinue}>
        Continue
      </button>
    </div>
  );
}
