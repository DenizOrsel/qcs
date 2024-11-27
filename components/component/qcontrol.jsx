import { useState, useMemo, useEffect, useContext } from "react";
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
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import Error from "@/components/component/Error";
import Loader from "@/components/ui/Loader";
import FormatDuration from "../FormatDuration";
import { AppContext } from "@/context/AppContext";

export default function Qcontrol() {
  const router = useRouter();
  const { surveyId } = router.query;
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: "Id", order: "asc" });
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 const { dbConfig } = useContext(AppContext);

  const handleSearch = (e) => setSearch(e.target.value);

  const handleSort = (key) => {
    if (sort.key === key) {
      setSort({ key, order: sort.order === "asc" ? "desc" : "asc" });
    } else {
      setSort({ key, order: "asc" });
    }
  };

  const removeLeadingZeros = (str) => {
    return str.replace(/^0+/, "") || "0";
  };

  const averageActiveSeconds = useMemo(() => {
    if (interviews.length === 0) return 0;
    const totalActiveSeconds = interviews.reduce(
      (sum, interview) => sum + interview.ActiveSeconds,
      0
    );
    return Math.round(totalActiveSeconds / interviews.length);
  }, [interviews]);

  const handleRowClick = (interviewId, averageActiveSeconds) => {
    const formattedInterviewId = removeLeadingZeros(interviewId);
    router.push(
      `/dashboard/${surveyId}/${formattedInterviewId}?xlmns=${averageActiveSeconds}`
    );
  };

  useEffect(() => {
    if (surveyId) {
      const fetchInterviews = async () => {
        try {
          const token = sessionStorage.getItem("token");
          const apiBaseUrl = localStorage.getItem("apiBaseUrl");
          const dbPasswordString = Buffer.from(
            dbConfig.dbpassword.data
          ).toString("utf-8");
          const response = await axios.get("/api/interviewQuality", {
            headers: {
              Authorization: `Basic ${token}`,
              "X-Custom-Url": apiBaseUrl,
              "X-DB-Server": dbConfig.dbserver,
              "X-DB-Database": dbConfig.dbdatabase,
              "X-DB-User": dbConfig.dbuser,
              "X-DB-Password": dbPasswordString,
            },
            params: {
              surveyId,
            },
          });
          setInterviews(response.data);
        } catch (error) {
          console.error("Error fetching interview quality data:", error);
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchInterviews();
    }
  }, [surveyId]);

  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return "Not Reviewed";
      case 1:
        return "Approved";
      case 2:
        return "Unverified";
      case 3:
        return "Rejected";
      default:
        return "";
    }
  };

  const filteredAndSortedInterviews = useMemo(
    () =>
      interviews
        .filter((interview) => {
          const searchValue = search.toLowerCase();
          return (
            (interview.Id ?? "").toLowerCase().includes(searchValue) ||
            getStatusText(interview.InterviewQuality)
              .toLowerCase()
              .includes(searchValue) ||
            (interview.OfficeId ?? "").toLowerCase().includes(searchValue) ||
            (interview.InterviewerId ?? "")
              .toLowerCase()
              .includes(searchValue) ||
            (interview.ActiveSeconds ?? "").toString().includes(searchValue) ||
            (new Date(interview.StartTime).toLocaleString() ?? "")
              .toLowerCase()
              .includes(searchValue) ||
            (new Date(interview.EndTime).toLocaleString() ?? "")
              .toLowerCase()
              .includes(searchValue)
          );
        })
        .sort((a, b) => {
          if (sort.order === "asc") {
            return a[sort.key] > b[sort.key] ? 1 : -1;
          } else {
            return a[sort.key] < b[sort.key] ? 1 : -1;
          }
        }),
    [search, sort, interviews]
  );

  if (loading) return <Loader />;
  if (error) return <Error error={error} />;

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Search interviews..."
        value={search}
        onChange={handleSearch}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="w-[100px] cursor-pointer"
              onClick={() => handleSort("Id")}
            >
              Interview ID
              {sort.key === "Id" && (
                <span className="ml-1">
                  {sort.order === "asc" ? "\u2191" : "\u2193"}
                </span>
              )}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("InterviewQuality")}
            >
              Validation State
              {sort.key === "InterviewQuality" && (
                <span className="ml-1">
                  {sort.order === "asc" ? "\u2191" : "\u2193"}
                </span>
              )}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("InterviewerId")}
            >
              Interviewer Id
              {sort.key === "InterviewerId" && (
                <span className="ml-1">
                  {sort.order === "asc" ? "\u2191" : "\u2193"}
                </span>
              )}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("OfficeId")}
            >
              Office Id
              {sort.key === "OfficeId" && (
                <span className="ml-1">
                  {sort.order === "asc" ? "\u2191" : "\u2193"}
                </span>
              )}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("ActiveSeconds")}
            >
              Duration
              {sort.key === "ActiveSeconds" && (
                <span className="ml-1">
                  {sort.order === "asc" ? "\u2191" : "\u2193"}
                </span>
              )}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("StartTime")}
            >
              Start Time
              {sort.key === "StartTime" && (
                <span className="ml-1">
                  {sort.order === "asc" ? "\u2191" : "\u2193"}
                </span>
              )}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("EndTime")}
            >
              End Time
              {sort.key === "EndTime" && (
                <span className="ml-1">
                  {sort.order === "asc" ? "\u2191" : "\u2193"}
                </span>
              )}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("UpdatedBy")}
            >
              Updated By
              {sort.key === "UpdatedBy" && (
                <span className="ml-1">
                  {sort.order === "asc" ? "\u2191" : "\u2193"}
                </span>
              )}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedInterviews.map((interview) => (
            <TableRow
              key={interview.Id}
              onClick={() => handleRowClick(interview.Id, averageActiveSeconds)}
              className="cursor-pointer"
            >
              <TableCell className="font-medium">
                {removeLeadingZeros(interview.Id)}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    interview.InterviewQuality === 1
                      ? "outline"
                      : interview.InterviewQuality === 3
                      ? "secondary"
                      : "default"
                  }
                >
                  {interview.InterviewQuality === 0
                    ? "Not Reviewed"
                    : interview.InterviewQuality === 1
                    ? "Approved"
                    : interview.InterviewQuality === 2
                    ? "Unverified"
                    : interview.InterviewQuality === 3
                    ? "Rejected"
                    : ""}
                </Badge>
              </TableCell>
              <TableCell>{interview.InterviewerId}</TableCell>
              <TableCell>{interview.OfficeId}</TableCell>
              <TableCell>
                <FormatDuration seconds={interview.ActiveSeconds} />
              </TableCell>
              <TableCell>
                {new Date(interview.StartTime).toLocaleString()}
              </TableCell>
              <TableCell>
                {new Date(interview.EndTime).toLocaleString()}
              </TableCell>
              <TableCell>Username</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
