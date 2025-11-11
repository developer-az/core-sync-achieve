import { Button } from "@/components/ui/button";
import { ArrowRight, Activity, Target, Trophy } from "lucide-react";
import heroDashboard from "@/assets/hero-dashboard.jpg";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-cyan/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink/10 rounded-full blur-3xl animate-glow" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8 animate-slide-up">
            <div className="inline-block">
              <span className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan/20 to-purple/20 border border-cyan/30 text-cyan text-sm font-medium">
                Your Personal Fitness Command Center
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Make Fitness{" "}
              <span className="bg-gradient-to-r from-cyan via-purple to-pink bg-clip-text text-transparent">
                Addictive
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
              CoreSync transforms your fitness journey into an engaging game. Track workouts, crush goals, and unlock achievements that keep you motivated every single day.
            </p>

            {/* Feature highlights */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-xl bg-cyan/10 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-cyan" />
                </div>
                <p className="text-sm font-medium">Smart Logging</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-xl bg-purple/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple" />
                </div>
                <p className="text-sm font-medium">Goal Tracking</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-xl bg-pink/10 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-pink" />
                </div>
                <p className="text-sm font-medium">Achievements</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-cyan to-purple hover:shadow-cyan text-white font-semibold px-8 rounded-full transition-all duration-300 hover:scale-105"
                onClick={() => navigate('/auth')}
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-cyan/30 text-cyan hover:bg-cyan/10 rounded-full px-8"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Right content - Dashboard preview */}
          <div className="relative animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="relative rounded-3xl overflow-hidden border border-cyan/20 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan/20 via-transparent to-purple/20" />
              <img 
                src={heroDashboard} 
                alt="CoreSync Dashboard" 
                className="w-full h-auto"
              />
            </div>
            
            {/* Floating stat cards */}
            <div className="absolute -top-6 -left-6 bg-card/80 backdrop-blur-xl rounded-2xl p-4 border border-cyan/20 shadow-lg animate-float z-20">
              <p className="text-sm text-muted-foreground">Weekly Goal</p>
              <p className="text-2xl font-bold text-cyan">87%</p>
            </div>
            
            <div className="absolute -bottom-6 -right-6 bg-card/80 backdrop-blur-xl rounded-2xl p-4 border border-purple/20 shadow-lg animate-float z-20" style={{ animationDelay: "1s" }}>
              <p className="text-sm text-muted-foreground">Streak</p>
              <p className="text-2xl font-bold text-purple">12 days</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
