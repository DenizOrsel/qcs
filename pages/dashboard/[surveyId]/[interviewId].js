import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AnswersTable from "@/components/component/AnswersTable";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Toaster from "@/components/ui/toaster";
import Loader from "@/components/ui/Loader";
import Error from "@/components/component/Error";
import LogoutButton from "@/components/ui/LogoutButton";
import BackButton from "@/components/ui/backButton";
import Audioplayback from "@/components/component/Audioplayback";
import { UpdateIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { Card } from "@/components/ui/Card";

const InterviewDetailsPage = () => {
  const router = useRouter();
  const { surveyId, interviewId } = router.query;
  const [interviewDetails, setInterviewDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingButton, setLoadingButton] = useState(null);
  const [error, setError] = useState(null);
  const [toasterVisible, setToasterVisible] = useState(false);
  const [downloadedFiles, setDownloadedFiles] = useState([]);
  const [answersLoaded, setAnswersLoaded] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [loadingAssets, setLoadingAssets] = useState(false);


  useEffect(() => {
    if (interviewId && surveyId) {
      const fetchInterviewDetails = async () => {
        try {
          const token = sessionStorage.getItem("token");
          const apiBaseUrl = localStorage.getItem("apiBaseUrl");
          const response = await axios.get(`/api/interviewDetails`, {
            params: { interviewId, surveyId },
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
              "X-Custom-Url": apiBaseUrl,
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

  const downloadPackage = async () => {
    setLoadingAssets(true);
    try {
      const token = sessionStorage.getItem("token");
      const apiBaseUrl = localStorage.getItem("apiBaseUrl");

      const response = await axios.post(
        `/api/downloadpackage?surveyId=${surveyId}&interviewId=${interviewId}`,
        {},
        {
          headers: {
            Authorization: token,
            "x-custom-url": apiBaseUrl,
          },
        }
      );

      setDownloadedFiles(response.data.files);

      const audioFile = response.data.files.find(
        (file) =>
          file.filename.includes("silent") && file.filename.endsWith(".mp3")
      );
      setAudioFile(audioFile);

    } catch (error) {
      console.log("Warning there is no stream available for the record:", error);
    } finally {
      setLoadingAssets(false);
    }
  };

  useEffect(() => {
    if (answersLoaded) {
      downloadPackage();
    }
  }, [answersLoaded]);

  const handleAnswersLoaded = () => {
    setAnswersLoaded(true);
  };

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

  const updateInterviewQuality = async (newState, buttonType) => {
    setLoadingButton(buttonType);
    try {
      const token = sessionStorage.getItem("token");
      const apiBaseUrl = localStorage.getItem("apiBaseUrl");
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
            "X-Custom-Url": apiBaseUrl,
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
    } finally {
      setLoadingButton(null);
    }
  };

  

  if (loading) return <Loader />;
  if (error) return <Error error={error} />;

const renderAnswerWithImages = (answer) => {
  const matchingFile = downloadedFiles.find((file) => {
    const fileNamePart = file.filename.split("_")[1];
    return answer.includes(fileNamePart);
  });

  if (matchingFile && matchingFile.filename.endsWith(".jpg")) {
    return (
      <Image
        src={`data:image/jpeg;base64,${matchingFile.content}`}
        alt={matchingFile.filename}
        width="500"
        height="500"
        className="rounded-lg border border-gray-300 shadow-lg"
      />
    );
  } else {
    return answer;
  }
};


  const location = interviewDetails
    ? parseLocationInfo(interviewDetails.LocationInfo)
    : null;

  const clientInformation = JSON.parse(interviewDetails.ClientInformation);

  return (
    <div className="min-h-screen">
      <BackButton href={`/dashboard/${surveyId}`} />
      <LogoutButton />
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
                  className={`mr-2 min-w-[100px] ${
                    interviewDetails.InterviewQuality === 0 ||
                    loadingButton !== null
                      ? "cursor-not-allowed"
                      : ""
                  }`}
                  onClick={() => updateInterviewQuality(0, "reset")}
                  disabled={
                    interviewDetails.InterviewQuality === 0 ||
                    loadingButton !== null
                  }
                >
                  {loadingButton === "reset" ? (
                    <UpdateIcon className="animate-spin" />
                  ) : (
                    "Reset"
                  )}
                </Button>
                <Button
                  className={`mr-2 min-w-[100px] ${
                    interviewDetails.InterviewQuality === 1 ||
                    loadingButton !== null
                      ? "cursor-not-allowed"
                      : ""
                  }`}
                  onClick={() => updateInterviewQuality(1, "approve")}
                  disabled={
                    interviewDetails.InterviewQuality === 1 ||
                    loadingButton !== null
                  }
                >
                  {loadingButton === "approve" ? (
                    <UpdateIcon className="animate-spin" />
                  ) : (
                    "Approve"
                  )}
                </Button>
                <Button
                  className={`mr-2 min-w-[100px] ${
                    interviewDetails.InterviewQuality === 2 ||
                    loadingButton !== null
                      ? "cursor-not-allowed"
                      : ""
                  }`}
                  onClick={() => updateInterviewQuality(2, "unverify")}
                  disabled={
                    interviewDetails.InterviewQuality === 2 ||
                    loadingButton !== null
                  }
                >
                  {loadingButton === "unverify" ? (
                    <UpdateIcon className="animate-spin" />
                  ) : (
                    "Unverify"
                  )}
                </Button>
                <Button
                  className={`min-w-[100px] ${
                    interviewDetails.InterviewQuality === 3 ||
                    loadingButton !== null
                      ? "cursor-not-allowed"
                      : ""
                  }`}
                  onClick={() => updateInterviewQuality(3, "reject")}
                  disabled={
                    interviewDetails.InterviewQuality === 3 ||
                    loadingButton !== null
                  }
                >
                  {loadingButton === "reject" ? (
                    <UpdateIcon className="animate-spin" />
                  ) : (
                    "Reject"
                  )}
                </Button>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 rounded-lg border bg-card p-6 shadow-sm sm:grid-cols-2">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Interviewer Id
                </div>
                <div className="text-base font-medium">
                  {interviewDetails.InterviewerId}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Duration
                </div>
                <div className="text-base font-medium">
                  {formatDuration(interviewDetails.ActiveSeconds)}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  App Version
                </div>
                <div className="text-base font-medium">
                  {clientInformation.version}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Device Name
                </div>
                <div className="text-base font-medium">
                  {clientInformation.deviceName}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Manufacturer
                </div>
                <div className="text-base font-medium">
                  {clientInformation.manufacturer}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Operating System
                </div>
                <div className="text-base font-medium">
                  {clientInformation.operatingSystemVersion}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Location
                </div>
                <div className="text-base font-medium">
                  {location ? (
                    <button
                      onClick={() =>
                        openMap(location.latitude, location.longitude)
                      }
                      className="text-blue-500 underline mt-2"
                    >
                      See map
                    </button>
                  ) : (
                    "Not Available"
                  )}
                </div>
              </div>
            </div>
          </>
        )}
        <AnswersTable
          surveyId={surveyId}
          interviewId={interviewId}
          downloadedFiles={downloadedFiles}
          renderAnswerWithImages={renderAnswerWithImages}
          onLoaded={handleAnswersLoaded}
        />
        {audioFile && <Audioplayback audioSrc={audioFile.content} />}
      </div>
      {toasterVisible && (
        <Toaster
          message="Interview status is updated"
          visible={toasterVisible}
          onClose={() => setToasterVisible(false)}
        />
      )}
      {loadingAssets && (
          <Card className="fixed bottom-4 right-4 flex items-center p-2 gap-2">
            <UpdateIcon className="animate-spin" />
            <p className="font-bold">Loading assets.</p>
          </Card>
      )}
    </div>
  );
};

export default InterviewDetailsPage;
