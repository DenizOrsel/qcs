import { useRouter } from "next/router";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import Qcontrol from "@/components/component/qcontrol";
import Loader from "@/components/ui/Loader";
import Error from "@/components/component/Error";
import LogoutButton from "@/components/ui/LogoutButton";
import BackButton from "@/components/ui/backButton";
import { AppContext } from "@/context/AppContext";

const SurveyDetails = () => {
  const router = useRouter();
  const { surveyId } = router.query;
  const [surveyData, setSurveyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { dbConfig } = useContext(AppContext);

  useEffect(() => {
    if (surveyId) {
      const fetchSurveyData = async () => {
        try {
          const token = sessionStorage.getItem("token");
          const apiBaseUrl = localStorage.getItem("apiBaseUrl");
          const response = await axios.get("/api/surveydetails", {
            headers: {
              Authorization: token,
              'X-Custom-Url': apiBaseUrl,
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
      <BackButton href={`/dashboard`} />
      <LogoutButton />
      <div className="p-8 md:p-8 m-8">
        <h1 className="text-xl md:text-2xl mb-4">Survey {surveyData.Name}</h1>
        <Qcontrol />
      </div>
    </>
  );
};

export default SurveyDetails;
