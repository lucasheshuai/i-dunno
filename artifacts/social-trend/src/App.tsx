import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { useGetProfile } from "@workspace/api-client-react";
import { getSessionId, syncAnsweredFromServer } from "@/lib/store";

import Home from "@/pages/home";
import QuestionPage from "@/pages/question";
import PredictPage from "@/pages/predict";
import ResultsPage from "@/pages/results";
import Explore from "@/pages/explore";
import Onboarding from "@/pages/onboarding";
import Profile from "@/pages/profile";
import Leaderboard from "@/pages/leaderboard";

const queryClient = new QueryClient();

function SessionSync() {
  const sessionId = getSessionId();
  const { data: profile } = useGetProfile({ sessionId });

  useEffect(() => {
    if (profile?.answeredQuestionIds !== undefined) {
      syncAnsweredFromServer(profile.answeredQuestionIds);
    }
  }, [profile?.answeredQuestionIds]);

  return null;
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/explore" component={Explore} />
        <Route path="/profile" component={Profile} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/question/:id" component={QuestionPage} />
        <Route path="/predict/:id" component={PredictPage} />
        <Route path="/results/:id" component={ResultsPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <SessionSync />
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
