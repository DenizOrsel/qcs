import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UpdateIcon } from "@radix-ui/react-icons";

export function LoginUI() {
  const [region, setRegion] = useState("");
  const [domainname, setDomainname] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiBaseUrl = localStorage.getItem("apiBaseUrl");
      const response = await axios.post(
        "/api/signin",
        {
          domainname,
          username,
          password,
        },
        {
          headers: {
            "X-Custom-Url": apiBaseUrl,
          },
        }
      );
      const token = response.data.token;
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("domainname", domainname);
      sessionStorage.setItem("username", username);
      sessionStorage.setItem("password", password);
      router.push("/dashboard");
    } catch (err) {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

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
    <div className="flex h-screen w-full items-center justify-center bg-background dark:bg-background-dark">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>
            Select Region and enter your domain, username, and password to
            access your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit}>
            <div className="space-y-1 mt-3">
              <Label htmlFor="region">Region</Label>
              <select
                id="region"
                value={region}
                onChange={handleRegionChange}
                required
                className="w-full p-2 border rounded cursor-pointer dark:bg-background"
              >
                <option value="" disabled>
                  Select your region
                </option>
                <option value="Europe">Europe</option>
                <option value="AsiaPacific">APAC</option>
                <option value="Americas">AMER</option>
                <option value="China">China</option>
              </select>
            </div>
            <div className="space-y-1 mt-3">
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                type="text"
                value={domainname}
                onChange={(e) => setDomainname(e.target.value)}
                placeholder="Nfield domain name"
                required
              />
            </div>
            <div className="space-y-1 mt-3">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
                required
              />
            </div>
            <div className="space-y-1 mt-3">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <UpdateIcon className="animate-spin" /> : "Login"}
            </Button>
          </form>
          {error && <p>{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginUI;
