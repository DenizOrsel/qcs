import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AnswersTable from "@/components/component/AnswersTable";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const InterviewDetailsPage = () => {
  const router = useRouter();
  const { surveyId, interviewId } = router.query;
  const [interviewDetails, setInterviewDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (interviewId && surveyId) {
      const fetchInterviewDetails = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(`/api/interviewDetails`, {
            params: { interviewId, surveyId },
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
          });
          setInterviewDetails(response.data);
        } catch (error) {
          console.error("Error fetching interview details:", error);
          setError("Error fetching interview details");
        } finally {
          setLoading(false);
        }
      };

      fetchInterviewDetails();
    }
  }, [interviewId, surveyId]);

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

  const formatDuration = (seconds) => {
    if (seconds < 60) {
      return `${seconds} seconds`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes} minute${
        minutes > 1 ? "s" : ""
      } ${remainingSeconds} second${remainingSeconds > 1 ? "s" : ""}`;
    }
  };

  const parseLocationInfo = (locationInfo) => {
    try {
      const location = JSON.parse(locationInfo);
      return {
        latitude: location.latitude,
        longitude: location.longitude,
      };
    } catch (error) {
      return null;
    }
  };

  const openMap = (latitude, longitude) => {
    const url = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`;
    window.open(url, "_blank");
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const location = interviewDetails
    ? parseLocationInfo(interviewDetails.LocationInfo)
    : null;

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen">
      <div className="container mx-auto py-8 px-4">
        <button
          onClick={() => router.push(`/dashboard/${surveyId}`)}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back
        </button>
        {interviewDetails && (
          <>
            <div className="flex items-center mb-4">
              <h1 className="text-2xl font-bold mr-2">
                {interviewDetails.SurveyName} Interview{" "}
                {interviewDetails.InterviewNumber}
              </h1>
              <Badge
                variant={
                  interviewDetails.InterviewQuality === 1
                    ? "outline"
                    : interviewDetails.InterviewQuality === 3
                    ? "secondary"
                    : "default"
                }
              >
                {getStatusText(interviewDetails.InterviewQuality)}
              </Badge>
            </div>
            <p className="mb-2">
              Interviewer ID: {interviewDetails.InterviewerId}
            </p>
            <p className="mb-2">
              Duration: {formatDuration(interviewDetails.ActiveSeconds)}
            </p>
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap break-all">
                  {interviewDetails.ClientInformation}
                </pre>
              </CardContent>
            </Card>
            <p className="mb-4">
              Location :{" "}
              {location ? (
                <button
                  onClick={() => openMap(location.latitude, location.longitude)}
                  className="text-blue-500 underline"
                >
                  Check on map
                </button>
              ) : (
                "Not Available"
              )}
            </p>
          </>
        )}
        <AnswersTable surveyId={surveyId} interviewId={interviewId} />
      </div>
    </div>
  );
};

export default InterviewDetailsPage;
