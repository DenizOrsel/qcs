import { closeDbConnection } from "@/lib/adminDb";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      await closeDbConnection();
      res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      console.error("Error during logout:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
