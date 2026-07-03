import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/beta1.png";
import Button from "../component/ui/Button";
import Input from "../component/ui/Input";

const INTERESTS = [
  "Tech",
  "Business",
  "Finance",
  "Networking",
  "Design",
  "Education",
  "Health",
  "Media",
  "AI",
  "Startups",
  "Product",
  "Leadership",
  "Career Growth",
  "Marketing",
  "Lifestyle",
  "Wellness",
  "Community",
  "Innovation",
  "Creativity",
  "Mentorship",
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"details" | "interests">("details");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((current) =>
      current.includes(interest) ? current.filter((item) => item !== interest) : [...current, interest],
    );
  };

  return (
    <div
      className="min-h-screen w-full text-white"
      style={{
        background:
          "radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)",
      }}
    >
      <div className="mx-auto flex min-h-screen max-w-3xl lg:items-center justify-center px-5 py-8 sm:px-6 lg:px-8">
        <div className="w-full">
          <div className="mb-6 flex items-center justify-start">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-sm">
              <img src={logo} alt="Betamind Logo" className="h-full w-full object-cover" />
            </div>
          </div>

          <div className="mb-8 lg:text-center sm:text-left pt-8">
            <h1 className="mt-2 text-2xl font-bold leading-tight sm:text-4xl">Let&apos;s set up your profile</h1>
            <p className="mt-3 text-sm text-gray-300 sm:text-base">
              Personlize your experience and what you want to see.
            </p>
          </div>

          <div className="space-y-6">
            {step === "details" ? (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-semibold text-white">Contact details</h2>
                  <p className="mt-2 text-sm text-gray-400">Share your phone number and address so we can personalize your experience.</p>
                </div>

                <div className="space-y-4">
                  <Input label="080 9123 4567" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  <Input
                    label="ADDRESS"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Example Street"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-semibold text-white">What interests you?</h2>
                  <p className="mt-2 text-sm text-gray-400">Choose a few topics that match your goals and curiosity.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => {
                    const active = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`rounded-full px-3.5 py-2 text-sm transition-all ${active
                          ? "bg-[#a6ff00] text-black"
                          : "border border-white/10 bg-white/5 text-white hover:border-[#a6ff00] hover:text-[#a6ff00]"
                          }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex gap-3 justify-between">
            <Button variant="white" onClick={step === "details" ? () => navigate("/login") : () => setStep("details")}>
              {step === "details" ? "Back" : "Previous"}
            </Button>
            {step === "details" ? (
              <Button variant="green" onClick={() => setStep("interests")} disabled={!phone || !address}>
                Next
              </Button>
            ) : (
              <Button variant="green" onClick={() => {
                localStorage.setItem("betamindToken", "dummyToken");
                navigate("/dashboard/overview");
              }} disabled={selectedInterests.length === 0}>
                Continue
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
