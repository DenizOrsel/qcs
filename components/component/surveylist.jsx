import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import axios from "axios";

export default function Surveylist() {
  const [searchTerm, setSearchTerm] = useState("");
  const [surveys, setSurveys] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/surveys", {
          headers: {
            token: token,
          },
        });
        setSurveys(response.data);
        console.log(response.data);
      } catch (err) {
        console.error("Error fetching surveys:", err);
        setError("Error fetching surveys");
      } finally {
        setLoading(false);
      }
    };
    fetchSurveys();
  }, []);

  const filteredSurveys = surveys
    .filter((survey) => !survey.IsBlueprint)
    .filter((survey) =>
      survey.SurveyName.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleRowClick = (surveyId) => {
    router.push(`/dashboard/${surveyId}`);
  };

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">CAPI Surveys</h1>
          <p>Domain: {localStorage.getItem("domainname")}</p>
        </div>
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Search by survey name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Survey Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Not Checked</TableHead>
                <TableHead>Approved</TableHead>
                <TableHead>Unverified</TableHead>
                <TableHead>Rejected</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSurveys.map((survey) => (
                <TableRow
                  key={survey.SurveyId}
                  onClick={() => handleRowClick(survey.SurveyId)}
                  className="cursor-pointer"
                >
                  <TableCell>{survey.SurveyName}</TableCell>
                  <TableCell>
                    {survey.SurveyState === 0 ? "Under Construction" : ""}
                    {survey.SurveyState === 1 ? "Started" : ""}
                    {survey.SurveyState === 3 ? "Stopped" : ""}
                  </TableCell>
                  <TableCell>{survey.InterviewQualityCounts[0]}</TableCell>
                  <TableCell>{survey.InterviewQualityCounts[1]}</TableCell>
                  <TableCell>{survey.InterviewQualityCounts[2]}</TableCell>
                  <TableCell>{survey.InterviewQualityCounts[3]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
