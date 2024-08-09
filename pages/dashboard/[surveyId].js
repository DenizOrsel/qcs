// pages/dashboard/[surveyId].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import Qcontrol from "@/components/component/qcontrol";
import Loader from "@/components/ui/loader";
import Error from "@/components/component/Error";

const SurveyDetails = () => {
  const router = useRouter();
  const { surveyId } = router.query;
  const [surveyData, setSurveyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (surveyId) {
      const fetchSurveyData = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get("/api/surveydetails", {
            headers: {
              Authorization: token,
            },
            params: {
              surveyId,
            },
          });
          setSurveyData(response.data);
        } catch (err) {
          setError("Error fetching survey data");
        } finally {
          setLoading(false);
        }
      };

      fetchSurveyData();
    }
  }, [surveyId]);

  if (loading) return <Loader />;
  if (error) return <Error error={error} />;

  return (
    <>
      <Button onClick={() => router.push("/dashboard")} className="ml-2">
        <span>&#8592;</span>
      </Button>
      <Button
        onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("domainname");
          localStorage.removeItem("username");
          localStorage.removeItem("password");
          router.push("/");
        }}
        className="mt-4 p-2 mr-2"
        style={{ float: "right" }}
      >
        Logout
      </Button>
      <div className="p-8 md:p-8 m-8">
        <h1 className="text-xl md:text-2xl mb-4">Survey {surveyData.Name}</h1>
        <Qcontrol />
      </div>
    </>
  );
};


export default SurveyDetails;
