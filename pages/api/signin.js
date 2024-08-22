import axios from "axios";
import { getDbConfig } from "@/lib/adminDb";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { region, domainname, username, password } = req.body;
    const apiBaseUrl = req.headers["x-custom-url"];

    try {
      // Sign-in request to get the token
      const signInResponse = await axios.post(
        `${apiBaseUrl}SignIn`,
        {
          Domain: domainname,
          Username: username,
          Password: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const token = signInResponse.data.AuthenticationToken;

      if (!token) {
        throw new Error("Invalid credentials");
      }

      // Get roles and permissions from v1/Me/Role endpoint
      const roleResponse = await axios.get(`${apiBaseUrl}/Me/Role`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${token}`,
        },
      });

      const { UserRoles } = roleResponse.data;
      console.log("UserRoles:", UserRoles);
      const isAdminOrManager =
        UserRoles.includes("DomainAdministrator") ||
        UserRoles.includes("RepositoryManager");
      // Get DB configuration
            const dbConfig = await getDbConfig(region, domainname);
            
      if (isAdminOrManager && dbConfig) {
        // Scenario 2: Admin/Manager with dbConfig, redirect to dashboard
        res.status(200).json({
          token,
          roles: UserRoles,
          redirect: "/dashboard",
          dbConfig,
        });
      } else if (isAdminOrManager && !dbConfig) {
        // Scenario 1: Admin/Manager without dbConfig, redirect to setup
        res.status(200).json({
          token,
          roles: UserRoles,
          redirect: "/setup",
        });
      } else if (!isAdminOrManager && !dbConfig) {
        // Scenario 3: Non-admin/manager without dbConfig, remove auth
        res.status(408).json({
          error:
            "Your domain has not been set up. Please login with an administrator account to set it up.",
        });
      } else if (!isAdminOrManager && dbConfig) {
        // Scenario 4: Non-admin/manager with dbConfig, redirect to dashboard
        console.log("Non-admin/manager with dbConfig, redirect to dashboard");
        res.status(200).json({
          token,
          roles: UserRoles,
          redirect: "/dashboard",
          dbConfig,
        });
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
      res.status(401).json({ error: "Invalid credentials" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}