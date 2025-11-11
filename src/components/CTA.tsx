import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section id="cta" className="py-24 px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan/20 via-purple/20 to-pink/20 rounded-full blur-3xl animate-glow" />
      </div>

      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="bg-gradient-to-br from-card/80 to-navy-light/80 backdrop-blur-xl rounded-3xl border border-cyan/20 p-12 md:p-16 text-center shadow-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan/20 to-purple/20 border border-cyan/30 mb-6">
            <Sparkles className="w-4 h-4 text-cyan" />
            <span className="text-sm font-medium text-cyan">Start Your Journey Today</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Make Fitness{" "}
            <span className="bg-gradient-to-r from-cyan via-purple to-pink bg-clip-text text-transparent">
              Irresistible?
            </span>
          </h2>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of users who've transformed their fitness routine into an engaging, rewarding experience with CoreSync.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-cyan to-purple hover:shadow-cyan text-white font-semibold px-10 rounded-full transition-all duration-300 hover:scale-105"
              onClick={() => navigate('/auth')}
            >
              Create Free Account
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-purple/30 text-purple hover:bg-purple/10 rounded-full px-10"
              onClick={() => navigate('/auth')}
            >
              View Demo
            </Button>
          </div>

          <div className="mt-12 pt-8 border-t border-navy-lighter">
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div>
                <p className="text-3xl font-bold text-cyan mb-2">10K+</p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-purple mb-2">50K+</p>
                <p className="text-sm text-muted-foreground">Workouts Logged</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-pink mb-2">4.9</p>
                <p className="text-sm text-muted-foreground">User Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
