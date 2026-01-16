import { useEffect, useState } from "react";
import api from "../api/client";

export default function LocationSelector({ userId, onNext }) {
  const [regions, setRegions] = useState([]);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    api.get("/user/locations").then((res) => setRegions(res.data));
  }, []);

  const handleSubmit = async () => {
    const res = await api.post("/user/select-location", {
      user_id: userId,
      tenant_id: selected,
    });
    onNext(res.data.next_step);
  };

  return (
    <>
      <h2>Select Your Location</h2>

      <select onChange={(e) => setSelected(e.target.value)}>
        <option value="">Select</option>
        {regions.map((r) => (
          <option key={r.region_id} value={r.tenant_id}>
            {r.country_code || r.time_zone}
          </option>
        ))}
      </select>

      <button disabled={!selected} onClick={handleSubmit}>
        Continue
      </button>
    </>
  );
}
