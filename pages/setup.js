import { useState, useContext, useEffect } from "react";
import { AppContext } from "@/context/AppContext";
import axios from "axios";
import { useRouter } from "next/router";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UpdateIcon } from "@radix-ui/react-icons";

export default function Setup() {
  const { region, domainname, dbConfig, setDbConfig, roles } =
    useContext(AppContext);

  const [dbserver, setDbserver] = useState(dbConfig?.dbserver || "");
  const [dbdatabase, setDbdatabase] = useState(dbConfig?.dbdatabase || "");
  const [dbuser, setDbuser] = useState(dbConfig?.dbuser || "");
  const [dbpassword, setDbpassword] = useState(dbConfig?.dbpassword || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (
      !roles.includes("DomainAdministrator") &&
      !roles.includes("RepositoryManager")
    ) {
      axios.post("/api/logout");
      sessionStorage.clear();
      router.push("/login");
    }
  }, [roles, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const newDbConfig = { dbserver, dbdatabase, dbuser, dbpassword };

    try {
      await axios.post("/api/setup", {
        region,
        domainname,
        dbConfig: newDbConfig,
      });

      setDbConfig(newDbConfig);

      sessionStorage.clear();
        await axios.post("/api/logout");
        router.push("/login");
      
    } catch (err) {
      setError(
        "Failed to connect to the target database. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background dark:bg-background-dark">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            Setup Repository Database Link
          </CardTitle>
          <CardDescription>
            Please provide the database connection details for the repository in
            order to proceed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="w-full max-w-md p-8 rounded">
            <div className="mb-4">
              <Label htmlFor="dbserver">Database Server</Label>
              <Input
                id="dbserver"
                type="text"
                onChange={(e) => setDbserver(e.target.value)}
                placeholder="Enter database server"
                required
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="dbdatabase">Database Name</Label>
              <Input
                id="dbdatabase"
                type="text"
                onChange={(e) => setDbdatabase(e.target.value)}
                placeholder="Enter database name"
                required
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="dbuser">Database User</Label>
              <Input
                id="dbuser"
                type="text"
                onChange={(e) => setDbuser(e.target.value)}
                placeholder="Enter database user"
                required
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="dbpassword">Database Password</Label>
              <Input
                id="dbpassword"
                type="password"
                onChange={(e) => setDbpassword(e.target.value)}
                placeholder="Enter database password"
                required
              />
            </div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <UpdateIcon className="animate-spin" />
              ) : (
                "Save and Logout"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
