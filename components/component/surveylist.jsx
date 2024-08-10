import { useState, useMemo, useEffect } from "react";
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
import Loader from "@/components/ui/loader";

export default function Surveylist() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState({ key: "SurveyName", order: "asc" });
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

  const handleSort = (key) => {
    if (sort.key === key) {
      setSort({ key, order: sort.order === "asc" ? "desc" : "asc" });
    } else {
      setSort({ key, order: "asc" });
    }
  };

  const filteredAndSortedSurveys = useMemo(
    () =>
      surveys
        .filter((survey) => !survey.IsBlueprint)
        .filter((survey) =>
          survey.SurveyName.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
          if (sort.order === "asc") {
            return a[sort.key] > b[sort.key] ? 1 : -1;
          } else {
            return a[sort.key] < b[sort.key] ? 1 : -1;
          }
        }),
    [searchTerm, sort, surveys]
  );

  const handleRowClick = (surveyId) => {
    router.push(`/dashboard/${surveyId}`);
  };

  return (
    <div className="min-h-screen">
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
          <Loader />
        ) : error ? (
          <p>{error}. Please refresh this page.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("SurveyName")}
                >
                  Survey Name
                  {sort.key === "SurveyName" && (
                    <span className="ml-1">
                      {sort.order === "asc" ? "\u2191" : "\u2193"}
                    </span>
                  )}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("SurveyState")}
                >
                  Status
                  {sort.key === "SurveyState" && (
                    <span className="ml-1">
                      {sort.order === "asc" ? "\u2191" : "\u2193"}
                    </span>
                  )}
                </TableHead>
                <TableHead>Not Reviewed</TableHead>
                <TableHead>Approved</TableHead>
                <TableHead>Unverified</TableHead>
                <TableHead>Rejected</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedSurveys.map((survey) => (
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
