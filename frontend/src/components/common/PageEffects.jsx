import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getRouteTitle } from "../../utils/constants";

const PageEffects = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  useEffect(() => {
    const title = getRouteTitle(location.pathname);
    document.title = title ? `${title} · DRAG.ai` : "DRAG.ai — AI UGC Ad Video Generator";
  }, [location.pathname]);

  return null;
};

export default PageEffects;
