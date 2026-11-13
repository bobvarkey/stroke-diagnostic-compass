import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquarePlus, Send, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FEEDBACK_KEY = "stroke_local_feedback";

const FeedbackForm: React.FC = () => {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      const existing = JSON.parse(localStorage.getItem(FEEDBACK_KEY) || "[]") as { message: string; at: string }[];
      existing.push({ message: message.trim(), at: new Date().toISOString() });
      localStorage.setItem(FEEDBACK_KEY, JSON.stringify(existing));

      setSubmitted(true);
      setMessage("");
      toast({
        title: "Feedback saved",
        description: "Stored on this device.",
      });

      // Reset submitted state after 3 seconds
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Could not save feedback",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquarePlus className="h-5 w-5 text-primary" />
          Send Feedback
        </CardTitle>
        <CardDescription>
          Share your thoughts, suggestions, or report issues to help us improve
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feedback-message">Your Message</Label>
            <Textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what you think, report a bug, or suggest a feature..."
              className="min-h-[120px] resize-y"
              disabled={isSubmitting}
            />
          </div>
          <Button 
            type="submit" 
            disabled={!message.trim() || isSubmitting || submitted}
            className="w-full"
          >
            {submitted ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Sent!
              </>
            ) : isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Feedback
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FeedbackForm;
