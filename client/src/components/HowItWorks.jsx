import { MapPin, Calendar, Users, Sparkles } from "lucide-react";
import "./HowItWorks.css";

export const HowItWorks = () => {
  const steps = [
    {
      icon: <MapPin className="orangeicon" />,
      title: "Choose Your Destination",
      description: "Tell us where you want to go and we'll help you discover amazing places to visit."
    },
    {
      icon: <Calendar className="orangeicon" />,
      title: "Set Your Dates",
      description: "Select your travel dates and trip duration to get personalized recommendations."
    },
    {
      icon: <Sparkles className="orangeicon" />,
      title: "Get AI Suggestions",
      description: "Our AI generates custom itineraries based on your preferences and interests."
    },
    {
      icon: <Users className="orangeicon" />,
      title: "Plan & Journal",
      description: "Customize your trip, write journal entries for each day of your trip and upload pictures to capture your memories."
    }
  ];

  return (
    <section className="section">
      <div className="container">
        <div className="header">
          <h2 className="title"><i>
            How It Works</i>
          </h2>
          <p className="description">
            Planning your perfect trip has never been easier. Follow these simple steps to create unforgettable memories.
          </p>
        </div>

        <div className="grid">
          {steps.map((step, index) => (
            <div key={index} className="step">
              <div className="iconContainer">
                {step.icon}
              </div>
              <h3 className="stepTitle">
                {step.title}
              </h3>
              <p className="stepDescription">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
