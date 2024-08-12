import React, { useState, useEffect } from "react"; 
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "@/components/ui/select"

export default function Selection() {
  const [region, setRegion] = useState("");
    useEffect(() => {
      const storedRegion = localStorage.getItem("apiBaseUrl");
      if (storedRegion) {
        setRegion(storedRegion);
      }
    }, []);

    const handleRegionChange = (e) => {
      const selectedRegion = e.target.value;
      setRegion(selectedRegion);

      const apiUrls = {
        Americas: "https://apiam.nfieldmr.com/v1/",
        Europe: "https://api.nfieldmr.com/v1/",
        AsiaPacific: "https://apiap.nfieldmr.com/v1/",
        China: "https://apicn.nfieldmr.com/v1/",
      };

      const apiUrl = apiUrls[selectedRegion];
      localStorage.setItem("apiBaseUrl", apiUrl);
    };

  return (
    (<Select value={region} onValueChange={handleRegionChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select your region" disabled />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="Europe">Europe</SelectItem>
          <SelectItem value="AsiaPacific">APAC</SelectItem>
          <SelectItem value="Americas">AMER</SelectItem>
          <SelectItem value="China">China</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>)
  );
}
