import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AnswersTable from "@/components/component/AnswersTable";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Toaster from "@/components/ui/toaster";

const InterviewDetailsPage = () => {
  const router = useRouter();
  const { surveyId, interviewId } = router.query;
  const [interviewDetails, setInterviewDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toasterVisible, setToasterVisible] = useState(false);

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

  const updateInterviewQuality = async (newState) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/updateInterviewQuality`,
        {
          surveyId,
          interviewId,
          newState,
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );
      setInterviewDetails((prevDetails) => ({
        ...prevDetails,
        InterviewQuality: newState,
      }));
      setToasterVisible(true);
    } catch (error) {
      console.error("Error updating interview quality:", error);
      alert("Failed to update interview quality.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const location = interviewDetails
    ? parseLocationInfo(interviewDetails.LocationInfo)
    : null;

  return (
    <div className="min-h-screen">
      <Button onClick={() => router.push(`/dashboard/${surveyId}`)}>
        Back
      </Button>
      <div className="container mx-auto py-8 px-4">
        {interviewDetails && (
          <>
            <div className="flex items-center mb-4 justify-between">
              <div className="flex items-center">
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
              <div className="flex items-center">
                <Button
                  className="mr-2"
                  onClick={() => updateInterviewQuality(0)}
                >
                  Reset
                </Button>
                <Button
                  className="mr-2"
                  onClick={() => updateInterviewQuality(1)}
                >
                  Approve
                </Button>
                <Button
                  className="mr-2"
                  onClick={() => updateInterviewQuality(2)}
                >
                  Unverify
                </Button>
                <Button onClick={() => updateInterviewQuality(3)}>
                  Reject
                </Button>
              </div>
            </div>
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2">
                  Interviewer ID: {interviewDetails.InterviewerId}
                </p>
                <p className="mb-2">
                  Duration: {formatDuration(interviewDetails.ActiveSeconds)}
                </p>
                <pre className="whitespace-pre-wrap break-all">
                  {interviewDetails.ClientInformation}
                </pre>
                <p className="mb-4">
                  Location :{" "}
                  {location ? (
                    <button
                      onClick={() =>
                        openMap(location.latitude, location.longitude)
                      }
                      className="text-blue-500 underline"
                    >
                      Check on map
                    </button>
                  ) : (
                    "Not Available"
                  )}
                </p>
              </CardContent>
            </Card>
          </>
        )}
        <AnswersTable surveyId={surveyId} interviewId={interviewId} />
      </div>
      <Toaster
        message="Interview status is updated"
        visible={toasterVisible}
        onClose={() => setToasterVisible(false)}
      />
    </div>
  );
};

export default InterviewDetailsPage;
