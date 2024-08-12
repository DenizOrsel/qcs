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
import Loader from "@/components/ui/Loader";

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
        const token = sessionStorage.getItem("token");
        const apiBaseUrl = localStorage.getItem("apiBaseUrl");
        const response = await axios.get("/api/surveys", {
          headers: {
            token: token,
            "X-Custom-Url": apiBaseUrl,
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
          const aValue =
            typeof a[sort.key] === "number"
              ? a[sort.key]
              : a.InterviewQualityCounts?.[sort.key];
          const bValue =
            typeof b[sort.key] === "number"
              ? b[sort.key]
              : b.InterviewQualityCounts?.[sort.key];

          if (sort.order === "asc") {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
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
          <h1 className="text-2xl font-bold">
            CAPI Surveys on {localStorage.getItem("domainname")}
          </h1>
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
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort(0)}
                >
                  Not Reviewed
                  {sort.key === 0 && (
                    <span className="ml-1">
                      {sort.order === "asc" ? "\u2191" : "\u2193"}
                    </span>
                  )}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort(1)}
                >
                  Approved
                  {sort.key === 1 && (
                    <span className="ml-1">
                      {sort.order === "asc" ? "\u2191" : "\u2193"}
                    </span>
                  )}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort(2)}
                >
                  Unverified
                  {sort.key === 2 && (
                    <span className="ml-1">
                      {sort.order === "asc" ? "\u2191" : "\u2193"}
                    </span>
                  )}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort(3)}
                >
                  Rejected
                  {sort.key === 3 && (
                    <span className="ml-1">
                      {sort.order === "asc" ? "\u2191" : "\u2193"}
                    </span>
                  )}
                </TableHead>
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
