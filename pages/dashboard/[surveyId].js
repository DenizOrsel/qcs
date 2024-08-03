// pages/dashboard/[surveyId].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

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
    <div>
      <h1>Survey Details for {surveyId}</h1>
      <pre>{JSON.stringify(surveyData, null, 2)}</pre>
      {/* Render your survey data here */}
    </div>
  );
};


export default SurveyDetails;
