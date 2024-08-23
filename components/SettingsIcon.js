import { useContext, useState, useEffect } from "react";
import { AppContext } from "@/context/AppContext";
import axios from "axios";
import { useRouter } from "next/router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UpdateIcon, Cross1Icon, GearIcon } from "@radix-ui/react-icons";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";

const SettingsIcon = () => {
  const {
    region,
    setRegion,
    setDomainname,
    setRoles,
    domainname,
    setDbConfig,
    roles,
    dbConfig,
  } = useContext(AppContext);
  const [open, setOpen] = useState(false);
  const [dbserver, setDbserver] = useState("");
  const [dbdatabase, setDbdatabase] = useState("");
  const [dbuser, setDbuser] = useState("");
  const [dbpassword, setDbpassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setDbdatabase(dbConfig?.dbdatabase || "");
    setDbserver(dbConfig?.dbserver || "");
    setDbuser(dbConfig?.dbuser || "");
  }, [dbConfig]);

  const isAdminOrManager =
    roles.includes("DomainAdministrator") ||
    roles.includes("RepositoryManager");

  if (!isAdminOrManager) return null;

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
      setOpen(false);
      sessionStorage.clear();
      setRegion("");
      setDomainname("");
      setDbConfig(null);
      setRoles([]);
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

  const handleBackdropClick = (e) => {
    // Close the dialog if the click is outside the dialog content
    if (e.target === e.currentTarget) {
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setOpen(true)}
        style={{ float: "right", marginRight: "1rem" }}
        size="icon"
      >
        <GearIcon className="h-5 w-5" />
        <span className="sr-only">Settings</span>
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          onClick={handleBackdropClick} // Add onClick to the backdrop
        >
          <Card className="relative w-full max-w-md">
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              className="absolute top-2 right-2 p-2"
              size="icon"
            >
              <Cross1Icon className="h-5 w-5" />
            </Button>
            <CardHeader className="mt-6 space-y-3">
              <CardTitle className="text-xl font-bold">
                Update Repository Database Link
              </CardTitle>
              <CardDescription>
                Please provide the database connection details for the
                repository in order to proceed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form
                onSubmit={handleSubmit}
                className="w-full max-w-md p-8 rounded"
              >
                <div className="mb-4">
                  <Label htmlFor="dbserver">Database Server</Label>
                  <Input
                    id="dbserver"
                    value={dbserver}
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
                    value={dbdatabase}
                    onChange={(e) => setDbdatabase(e.target.value)}
                    placeholder="Enter database name"
                    required
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="dbuser">Database User</Label>
                  <Input
                    id="dbuser"
                    value={dbuser}
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
      )}
    </div>
  );
};

export default SettingsIcon;
