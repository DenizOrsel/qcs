// pages/dashboard/[surveyId].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import Qcontrol from "@/components/component/qcontrol";

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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-4 md:p-8">
      <button onClick={() => router.push("/dashboard")}>Back</button>
      <h1 className="text-xl md:text-2xl mb-4">
        Survey {surveyData.Name}
      </h1>
      <Qcontrol />
    </div>
  );
};


export default SurveyDetails;
