import { useState, useRef } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { Mail, Phone } from 'lucide-react';
import { CONTACT, mailto, tel } from '@/lib/contact';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

// Your own key from https://web3forms.com — it decides which inbox messages
// land in, so it must not be hardcoded to someone else's. Public by design
// (the captcha is what stops abuse), which is why NEXT_PUBLIC_ is fine.
const ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? "";

// Published by Web3Forms for free-plan users — not a personal key.
// https://docs.web3forms.com/getting-started/customizations/spam-protection/hcaptcha
const HCAPTCHA_FREE_PLAN_SITEKEY = "50b2fe65-b00b-4b9e-ad62-3ba471098be2";

interface ContactFormProps {
  showName?: boolean;
  showEmail?: boolean;
  captchaSize?: 'compact' | 'normal' | 'invisible';
}

export default function ContactForm({ 
  showName = false, 
  showEmail = false,
  captchaSize = 'normal'
}: ContactFormProps) {
  const [result, setResult] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const captchaRef = useRef<HCaptcha | null>(null);

  const onHCaptchaChange = (token: string) => {
    setCaptchaToken(token);
    console.log("Captcha token received:", token ? "✓" : "✗");
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!ACCESS_KEY) {
      setResult("Contact form isn't configured yet — set NEXT_PUBLIC_WEB3FORMS_KEY.");
      return;
    }

    if (!captchaToken) {
      setResult("Please complete the captcha verification.");
      return;
    }

    setIsSubmitting(true);
    setResult("");

    const formData = new FormData(event.currentTarget);
    
    // Remove any existing h-captcha-response fields to avoid duplicates
    formData.delete("h-captcha-response");
    formData.delete("g-recaptcha-response");
    
    // Add required fields
    formData.set("access_key", ACCESS_KEY);
    formData.set("h-captcha-response", captchaToken);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      console.log("Response data:", data);
      
      if (data.success) {
        setResult("Message sent successfully! 🎉");
        (event.target as HTMLFormElement).reset();
        setCaptchaToken("");
        // Reset captcha widget
        if (captchaRef.current) {
          captchaRef.current.resetCaptcha();
        }
      } else {
        setResult(data.message || "Failed to send message. Please try again.");
      }
    } catch (error) {
      console.log("Error:", error);
      setResult("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Some people would rather email or call than fill in a form. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>Or reach me directly:</span>
        <a href={mailto} className="flex items-center gap-1.5 text-primary hover:underline">
          <Mail className="size-3.5" /> {CONTACT.email}
        </a>
        <a href={tel} className="flex items-center gap-1.5 text-primary hover:underline">
          <Phone className="size-3.5" /> {CONTACT.phone}
        </a>
      </div>

      {showName && (
        <div className="space-y-2">
          <Label htmlFor="name">Name (Optional)</Label>
          <Input 
            id="name"
            name="name" 
            type="text"
            placeholder="Your name"
            className="w-full"
          />
        </div>
      )}

      {showEmail && (
        <div className="space-y-2">
          <Label htmlFor="email">Email (Optional)</Label>
          <Input 
            id="email"
            name="email" 
            type="email"
            placeholder="your.email@example.com"
            className="w-full"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <textarea
          id="message"
          name="message"
          required
          placeholder="Type your anonymous message here..."
          rows={6}
          className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="flex justify-center">
        <div className="hcaptcha-container">
          <HCaptcha
            ref={captchaRef}
            sitekey={
              process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY ??
              // Web3Forms' own hCaptcha sitekey. On the free plan this exact
              // key is required — Web3Forms verifies the token against its own
              // secret, so a different sitekey gets rejected. Only override it
              // if you're on a paid plan with your own hCaptcha account.
              HCAPTCHA_FREE_PLAN_SITEKEY
            }
            onVerify={onHCaptchaChange}
            size={captchaSize}
            theme="dark"
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={!captchaToken || isSubmitting}
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>

      {result && (
        <p className={`text-sm text-center ${result.includes("success") ? "text-green-500" : "text-destructive"}`}>
          {result}
        </p>
      )}
    </form>
  );
}