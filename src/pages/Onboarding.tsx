import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowRight,
  FiArrowLeft,
  FiUser,
  FiUsers,
  FiCpu,
  FiMonitor,
  FiCode,
  FiPenTool,
  FiPieChart,
  FiHeart,
  FiShield,
  FiGlobe,
  FiCloud,
  FiDatabase,
  FiSmartphone,
  FiTrendingUp,
  FiBriefcase,
  FiActivity,
  FiBookOpen,
  FiPlay,
  FiWifi,
} from "react-icons/fi";
import Input from "../component/ui/Input";
import PhoneInput from "../component/ui/PhoneInput";
import TextArea from "../component/ui/TextArea";
import PillSelect, { type PillOption } from "../component/ui/PillSelect";
import SmartSelect from "../component/ui/SmartSelect";
import Button from "../component/ui/Button";
import { useNavigate } from "react-router-dom";
import { useGlobalContext } from "../providers/GlobalContext";

const DOMAIN_OPTIONS: PillOption[] = [
  { id: "ai-ml", label: "AI / ML", icon: FiCpu },
  { id: "software", label: "Software", icon: FiCode },
  { id: "design", label: "Design", icon: FiPenTool },
  { id: "product-design", label: "Product Design", icon: FiMonitor },
  { id: "fintech", label: "Fintech", icon: FiPieChart },
  { id: "bio-tech", label: "Bio-tech", icon: FiHeart },
  { id: "cybersecurity", label: "Cybersecurity", icon: FiShield },
  { id: "web3", label: "Web3", icon: FiGlobe },
  { id: "cloud", label: "Cloud", icon: FiCloud },
  { id: "data-science", label: "Data Science", icon: FiDatabase },
  { id: "mobile", label: "Mobile", icon: FiSmartphone },
  { id: "marketing", label: "Marketing", icon: FiTrendingUp },
  { id: "business", label: "Business", icon: FiBriefcase },
  { id: "health-tech", label: "Health Tech", icon: FiActivity },
  { id: "edtech", label: "EdTech", icon: FiBookOpen },
  { id: "gaming", label: "Gaming", icon: FiPlay },
  { id: "iot", label: "IoT", icon: FiWifi },
];

const ROLE_OPTIONS = [
  "Software Engineer", "Data Scientist", "Product Manager", "UX/UI Designer",
  "Student", "Entrepreneur", "Researcher", "Marketing Professional",
  "Financial Analyst", "Project Manager", "Educator", "Business Analyst",
  "Cybersecurity Specialist", "Cloud Architect", "DevOps Engineer",
  "Machine Learning Engineer", "Frontend Developer", "Backend Developer",
  "Mobile Developer", "QA Engineer",
];

const COMMUNITY_TYPE_OPTIONS: PillOption[] = [
  { id: "Free", label: "Free" },
  { id: "Paid", label: "Paid" },
];

const COMMUNITY_ACCESS_OPTIONS: PillOption[] = [
  { id: "Public", label: "Public" },
  { id: "Private", label: "Private" },
];

export const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const navigate = useNavigate();
  const { setUser } = useGlobalContext();

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    location: "",
    phone: "",
    path: "", // 'user' or 'mentor'
    position: "", // User: 'Current Role', Mentor: 'Current Position & Company'
    domains: [] as string[],
    bio: "",
    communityName: "",
    communityDescription: "",
    communityType: "Free",
    communityAccess: "Public",
    communityCreated: false,
  });

  const nextStep = () => {
    setDirection(1);
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setDirection(-1);
    setStep((prev) => prev - 1);
  };

  const completeOnboarding = () => {
    const mockUser = {
      name: `${formData.firstName} ${formData.lastName}`,
      role: formData.path,
      onboarded: true,
      ...formData,
    };
    setUser(mockUser);
    localStorage.setItem("user", JSON.stringify(mockUser));

    if (formData.path === "mentor") {
      navigate("/mentor-dashboard");
    } else {
      navigate("/dashboard/overview");
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-6 overflow-hidden relative">
      <AnimatePresence mode="popLayout" custom={direction}>
        {/* STEP 1: PROFILE */}
        {step === 1 && (
          <motion.div
            key="step1"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", ease: "easeInOut", duration: 0.35 }}
            className="w-full max-w-2xl"
          >
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold text-white mb-3">
                Let's build your{" "}
                <span className="text-[var(--color-primary)]">profile</span>
              </h1>
              <p className="text-[var(--color-text-secondary)]">
                This information helps us curate the Betamind experience
                <br />
                specifically for your career trajectory and intellectual goals.
              </p>
              <div className="w-16 h-0.5 bg-[var(--color-primary)] mx-auto mt-6"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              <Input
                label="FIRST NAME"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                placeholder="Alex"
              />
              <Input
                label="LAST NAME"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                placeholder="Alex" // Matching design placeholder
              />
              <Input
                label="LOCATION"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="San Francisco, CA"
              />
              <PhoneInput
                label="PHONE NUMBER"
                value={formData.phone}
                onChange={(val) => setFormData({ ...formData, phone: val })}
              />
            </div>

            <div className="flex justify-center">
              <Button
                variant="primary"
                className="w-full max-w-md text-base"
                onClick={nextStep}
                disabled={!formData.firstName || !formData.lastName}
              >
                Next <FiArrowRight className="ml-1" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: PATH */}
        {step === 2 && (
          <motion.div
            key="step2"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", ease: "easeInOut", duration: 0.35 }}
            className="w-full max-w-3xl"
          >
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold text-white mb-3">
                Choose Your{" "}
                <span className="text-[var(--color-primary)]">Path</span>
              </h1>
              <p className="text-[var(--color-text-secondary)]">
                Select the role that aligns with your ambitions and start your
                <br />
                journey within the intelligent atmosphere
              </p>
              <div className="w-16 h-0.5 bg-[var(--color-primary)] mx-auto mt-6"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {/* User Card */}
              <div
                onClick={() => setFormData({ ...formData, path: "user" })}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                  formData.path === "user"
                    ? "border-[var(--color-primary)] bg-[rgba(219,255,0,0.02)]"
                    : "border-[rgba(255,255,255,0.05)] bg-[var(--color-surface)] hover:border-[rgba(255,255,255,0.15)]"
                }`}
              >
                <div className="w-10 h-10 rounded-md bg-[#051F10] flex items-center justify-center mb-5">
                  <FiUser className="text-[var(--color-primary)]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">User</h3>
                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                  Access elite intelligence, learn from the best, and scale your
                  horizon through structured mentorship and cutting-edge
                  resources.
                </p>
              </div>

              {/* Mentor Card */}
              <div
                onClick={() => setFormData({ ...formData, path: "mentor" })}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                  formData.path === "mentor"
                    ? "border-[var(--color-primary)] bg-[rgba(219,255,0,0.02)]"
                    : "border-[rgba(255,255,255,0.05)] bg-[var(--color-surface)] hover:border-[rgba(255,255,255,0.15)]"
                }`}
              >
                <div className="w-10 h-10 rounded-md bg-[#051F10] flex items-center justify-center mb-5">
                  <FiUsers className="text-[var(--color-primary)]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Mentor</h3>
                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                  Share your expertise, guide the next generation, and monetize
                  your knowledge in a high-trust, data-driven environment.
                </p>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                className="w-[50px] px-0 flex-shrink-0 flex items-center justify-center"
                onClick={prevStep}
              >
                <FiArrowLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="primary"
                className="w-2/3 max-w-md text-base"
                onClick={nextStep}
                disabled={!formData.path}
              >
                Continue <FiArrowRight className="ml-1" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: USER PROFILE SETUP */}
        {step === 3 && formData.path === "user" && (
          <motion.div
            key="step3-user"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", ease: "easeInOut", duration: 0.35 }}
            className="w-full max-w-3xl"
          >
            <div className="mb-10">
              <h1 className="text-4xl font-bold text-white mb-2">
                Hey{" "}
                <span className="text-[var(--color-primary)]">
                  {formData.firstName}
                </span>
                ,
              </h1>
              <p className="text-white text-lg">
                Complete your profile setup as a user
              </p>
              <div className="w-16 h-0.5 bg-[var(--color-primary)] mt-5"></div>
            </div>

            <div className="space-y-8 mb-10">
              <SmartSelect
                label="CURRENT ROLE"
                options={ROLE_OPTIONS}
                value={formData.position}
                onChange={(val) => setFormData({ ...formData, position: val })}
                placeholder="Search your role..."
              />

              <div>
                <p className="text-[10px] text-[var(--color-text-secondary)] uppercase font-bold tracking-wider mb-3">
                  INTERESTS
                </p>
                <PillSelect
                  options={DOMAIN_OPTIONS}
                  selectedIds={formData.domains}
                  onChange={(ids) => setFormData({ ...formData, domains: ids })}
                  multi={true}
                />
              </div>

              <div>
                <p className="text-[10px] text-[var(--color-text-secondary)] uppercase font-bold tracking-wider mb-3">
                  GOALS & BIO
                </p>
                <TextArea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  placeholder="Briefly describe what you want to learn..."
                />
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                className="w-[50px] px-0 flex-shrink-0 flex items-center justify-center"
                onClick={prevStep}
              >
                <FiArrowLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="primary"
                className="w-2/3 max-w-md text-base"
                onClick={completeOnboarding}
                disabled={!formData.position || formData.domains.length === 0}
              >
                Go to Dashboard <FiArrowRight className="ml-1" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: MENTOR SETUP */}
        {step === 3 && formData.path === "mentor" && (
          <motion.div
            key="step3-mentor"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", ease: "easeInOut", duration: 0.35 }}
            className="w-full max-w-3xl"
          >
            <div className="mb-10">
              <h1 className="text-4xl font-bold text-white mb-2">
                Hey{" "}
                <span className="text-[var(--color-primary)]">
                  {formData.firstName}
                </span>
                ,
              </h1>
              <p className="text-white text-lg">
                Set up your mentor community
              </p>
              <p className="text-[var(--color-text-secondary)] text-sm mt-1">
                Create a space where your learners can engage, learn, and grow
                together.
              </p>
              <div className="w-16 h-0.5 bg-[var(--color-primary)] mt-5"></div>
            </div>

            <div className="space-y-6 mb-10">
              <Input
                label="COMMUNITY NAME"
                value={formData.communityName}
                onChange={(e) =>
                  setFormData({ ...formData, communityName: e.target.value })
                }
                placeholder="e.g. The Fintech Lab"
              />

              <div>
                <p className="text-[10px] text-[var(--color-text-secondary)] uppercase font-bold tracking-wider mb-3">
                  DESCRIPTION
                </p>
                <TextArea
                  value={formData.communityDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, communityDescription: e.target.value })
                  }
                  placeholder="Describe what your community is about..."
                />
              </div>

              <div>
                <p className="text-[10px] text-[var(--color-text-secondary)] uppercase font-bold tracking-wider mb-3">
                  COMMUNITY TYPE
                </p>
                <PillSelect
                  options={COMMUNITY_TYPE_OPTIONS}
                  selectedIds={[formData.communityType]}
                  onChange={(ids) =>
                    setFormData({ ...formData, communityType: ids[ids.length - 1] })
                  }
                  multi={false}
                />
              </div>

              <div>
                <p className="text-[10px] text-[var(--color-text-secondary)] uppercase font-bold tracking-wider mb-3">
                  ACCESS
                </p>
                <PillSelect
                  options={COMMUNITY_ACCESS_OPTIONS}
                  selectedIds={[formData.communityAccess]}
                  onChange={(ids) =>
                    setFormData({ ...formData, communityAccess: ids[ids.length - 1] })
                  }
                  multi={false}
                />
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                className="w-[50px] px-0 flex-shrink-0 flex items-center justify-center"
                onClick={prevStep}
              >
                <FiArrowLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="primary"
                className="w-2/3 max-w-md text-base"
                onClick={() => {
                  setFormData({ ...formData, communityCreated: true });
                  completeOnboarding();
                }}
                disabled={!formData.communityName}
              >
                Create Community <FiArrowRight className="ml-1" />
              </Button>
            </div>

            <div className="flex justify-center mt-4">
              <button
                type="button"
                onClick={completeOnboarding}
                className="text-[var(--color-text-secondary)] text-sm hover:text-white transition-colors"
              >
                Skip for now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Onboarding;
