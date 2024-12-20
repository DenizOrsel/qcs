import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import { Input } from "@/components/ui/input";
import QuotaButton from "@/components/ui/quotaButton";
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

export default function Surveylist({ region, domainname, dbConfig }) {
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
        const dbPasswordString = Buffer.from(dbConfig.dbpassword.data).toString(
          "utf-8"
        );

        if (!region || !domainname) {
          setError("Region and domain name are required to fetch surveys.");
          setLoading(false);
          return;
        }

        const response = await axios.get("/api/surveys", {
          headers: {
            token: token,
            "X-Custom-Url": apiBaseUrl,
            "X-Region": region,
            "X-Domain-Name": domainname,
            "X-DB-Server": dbConfig.dbserver,
            "X-DB-Database": dbConfig.dbdatabase,
            "X-DB-User": dbConfig.dbuser,
            "X-DB-Password": dbPasswordString,
          },
        });

        if (response.data.length === 0) {
          setError(
            "There are no available surveys to check. It may be due to the repository warming up. Please check back in 10 minutes."
          );
        } else {
          setSurveys(response.data);
        }
      } catch (err) {
        console.error("Error fetching surveys:", err);
        setError("Error fetching surveys");
      } finally {
        setLoading(false);
      }
    };

    fetchSurveys();
  }, [region, domainname, dbConfig]);

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
          let aValue, bValue;

          if (sort.key === 4) {
            aValue =
              (1 -
                (a.InterviewQualityCounts[0] + a.InterviewQualityCounts[2]) /
                  (a.InterviewQualityCounts[0] +
                    a.InterviewQualityCounts[1] +
                    a.InterviewQualityCounts[2] +
                    a.InterviewQualityCounts[3])) *
              100;

            bValue =
              (1 -
                (b.InterviewQualityCounts[0] + b.InterviewQualityCounts[2]) /
                  (b.InterviewQualityCounts[0] +
                    b.InterviewQualityCounts[1] +
                    b.InterviewQualityCounts[2] +
                    b.InterviewQualityCounts[3])) *
              100;
          } else if (typeof sort.key === "number") {
            aValue = a.InterviewQualityCounts[sort.key];
            bValue = b.InterviewQualityCounts[sort.key];
          } else {
            aValue = a[sort.key];
            bValue = b[sort.key];
          }

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

  const quotaHandler = (event, surveyId) => {
    event.stopPropagation();
    router.push(`/quota/${surveyId}`);
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">CAPI Surveys on {domainname}</h1>
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
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort(4)}
                >
                  Task Completion
                  {sort.key === 4 && (
                    <span className="ml-1">
                      {sort.order === "asc" ? "\u2191" : "\u2193"}
                    </span>
                  )}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedSurveys.map((survey) => {
                const totalQualityCounts =
                  survey.InterviewQualityCounts[0] +
                  survey.InterviewQualityCounts[1] +
                  survey.InterviewQualityCounts[2] +
                  survey.InterviewQualityCounts[3];

                const isClickable = totalQualityCounts !== 0;

                const taskCompletion = isClickable
                  ? (
                      (1 -
                        (survey.InterviewQualityCounts[0] +
                          survey.InterviewQualityCounts[2]) /
                          totalQualityCounts) *
                      100
                    ).toFixed(1)
                  : 0;

                return (
                  <TableRow
                    key={survey.SurveyId}
                    onClick={
                      isClickable ? () => handleRowClick(survey.SurveyId) : null
                    }
                    className={`cursor-pointer ${
                      !isClickable ? "cursor-not-allowed" : ""
                    }`}
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
                    <TableCell>{taskCompletion}%</TableCell>
                    <TableCell onClick={(event) => quotaHandler(event, survey.SurveyId)} className="z-50">
                      <QuotaButton className="z-50" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
