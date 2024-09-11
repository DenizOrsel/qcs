import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import BackButton from "@/components/ui/backButton";
import QuotaEditor from "@/components/component/QuotaManager";
import Loader from "@/components/ui/Loader";

const QuotaPage = () => {
  const router = useRouter();
  const { surveyId } = router.query;
  const [quotaFrame, setQuotaFrame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (surveyId) {
      setLoading(true);
      const fetchQuota = async () => {
        try {
          const token = sessionStorage.getItem("token");
          const apiBaseUrl = localStorage.getItem("apiBaseUrl");
          const response = await axios.get("/api/quota", {
            headers: {
              Authorization: token,
              "X-Custom-Url": apiBaseUrl,
            },
            params: {
              surveyId,
            },
          });
          setQuotaFrame(response.data);
        } catch (error) {
          console.error("Error fetching quota frame:", error);
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchQuota();
    }
  }, [surveyId]);

  return (
    <div>
      <BackButton href={`/dashboard`} />
      {loading && <Loader />}
      {error && <p>{error}</p>}
      {quotaFrame && <QuotaEditor quotaFrame={quotaFrame} />}
    </div>
  );
};

export default QuotaPage;
