import { useState } from "react";
import SignupForm from "./components/SignupForm";
import LocationSelector from "./components/LocationSelector";
import KycForm from "./components/KycForm";
import Login from "./components/Login";

export default function App() {
  const [step, setStep] = useState("SIGNUP");
  const [userId, setUserId] = useState(null);

  const handleNext = (id, nextStep) => {
    setUserId(id);
    setStep(nextStep);
  };

  if (step === "SIGNUP") return <SignupForm onNext={handleNext} />;

  if (step === "SELECT_LOCATION")
    return <LocationSelector userId={userId} onNext={setStep} />;

  if (step === "KYC_VERIFICATION") return <KycForm userId={userId} />;

  return <Login />;
}
