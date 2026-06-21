import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "How does sync365's cycle tracking work?",
    answer: "sync365 uses intelligent algorithms to track your menstrual cycle, learning your unique patterns over time. Our AI identifies correlations between your cycle phases, symptoms, and lifestyle factors to provide personalized insights and predictions."
  },
  {
    question: "How accurate are sync365's AI predictions?",
    answer: "After just 3 cycles of data, sync365's predictions become increasingly personalized to your unique patterns. Our smart algorithms continuously learn from your symptoms and lifestyle factors to improve over time. The more you use sync365, the better it understands your rhythm."
  },
  {
    question: "Is my health data really private and secure?",
    answer: "Absolutely. sync365 uses end-to-end encryption, meaning your data is encrypted on your device before it ever leaves. We cannot read your personal health information, and we never sell or share your data with third parties. You can delete all your data at any time."
  },
  {
    question: "What makes sync365 different from other period trackers?",
    answer: "sync365 combines advanced AI with holistic wellness tracking. While other apps simply track dates, sync365 provides energy predictions, mood forecasting, and personalized wellness guidance based on your cycle phase. Our design philosophy treats menstruation as a powerful, natural rhythm rather than a medical condition."
  },
  {
    question: "Can I use sync365 if my cycle is irregular?",
    answer: "Yes! sync365's AI is specifically designed to handle irregular cycles. Instead of assuming a standard 28-day cycle, sync365 learns your unique patterns—even if they vary month to month. Over time, it identifies underlying rhythms and provides increasingly accurate predictions for irregular cycles."
  },
  {
    question: "Is there a free version of sync365?",
    answer: "Yes, sync365's Starter tier is completely free forever. It includes period tracking, basic predictions, cycle calendar, and symptom logging. Advanced features like AI-powered predictions, personalized insights, partner sharing, and analytics are available in our Plus annual plan."
  },
  {
    question: "How does partner sharing work?",
    answer: "Partner sharing is available on the Plus plan. Open the Partner tab in your sync365 app, tap 'Link your partner' to generate a unique pairing code, and share it with your partner. They enter the code in their app to pair. You choose exactly what to share — mood, cycle phase, energy — while keeping notes and symptoms private. Both partners must explicitly consent, and you can revoke access instantly at any time."
  }
];

const Faq = () => {
  return (
    <section id="faq" className="py-20 relative overflow-hidden bg-background">
      {/* Background elements */}
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full bg-secondary/5 blur-[120px]"></div>
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-primary/5 blur-[100px]"></div>
      
      <div className="container max-w-[800px] mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <HelpCircle className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground font-medium">Questions & Answers</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-semibold mb-6 text-foreground">
            Frequently asked <span className="text-gradient-cosmic">questions</span>
          </h2>
          <p className="text-lg text-foreground max-w-2xl mx-auto">
            Everything you want to know about sync365 and your wellness journey.
          </p>
        </div>
        
        <div className="glass rounded-3xl p-6 md:p-10">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`} 
                className="border-b border-border last:border-0"
              >
                <AccordionTrigger className="text-left text-base md:text-lg font-medium text-foreground hover:text-primary py-6 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-foreground pb-6 pt-0 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default Faq;