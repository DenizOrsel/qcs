import { useRouter } from "next/router";
import AnswersTable from "@/components/component/AnswersTable";

const InterviewDetailsPage = () => {
  const router = useRouter();
  const { surveyId, interviewId } = router.query;

return (
    <div className="bg-gray-900 text-gray-100 min-h-screen">
        <div className="container mx-auto py-8 px-4">
        <button onClick={() => router.push(`/dashboard/${surveyId}`)}>Back</button>
            <h1 className="text-2xl font-bold mb-4">Interview Details</h1>
            <AnswersTable surveyId={surveyId} interviewId={interviewId} />
        </div>
    </div>
);
};

export default InterviewDetailsPage;
