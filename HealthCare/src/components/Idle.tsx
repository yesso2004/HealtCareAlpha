import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const IdleTimeout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const idleLimit = 5 * 60 * 1000;
  let idleTimer: number | undefined;

  const resetTimer = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      sessionStorage.removeItem("AUTH_TOKEN");
      alert("Logged out due to inactivity");
      navigate("/");
    }, idleLimit);
  };

  useEffect(() => {
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("scroll", resetTimer);
    window.addEventListener("click", resetTimer);

    resetTimer();

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("scroll", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, []);

  return <>{children}</>;
};

export default IdleTimeout;
