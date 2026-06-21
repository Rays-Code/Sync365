import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageVisit } from "@/services/supabaseFunctions";

function getSessionId(): string {
  let sid = sessionStorage.getItem("visit_session_id");
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem("visit_session_id", sid);
  }
  return sid;
}

export function useVisitTracker() {
  const location = useLocation();

  useEffect(() => {
    const sessionId = getSessionId();
    trackPageVisit(location.pathname, document.referrer, sessionId).catch(console.error);
  }, [location.pathname]);
}
