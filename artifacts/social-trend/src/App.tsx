import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import QuestionPage from "@/pages/question";
import PredictPage from "@/pages/predict";
import ResultsPage from "@/pages/results";
import Explore from "@/pages/explore";
import Onboarding from "@/pages/onboarding";
import Profile from "@/pages/profile";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/explore" component={Explore} />
        <Route path="/profile" component={Profile} />
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
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
