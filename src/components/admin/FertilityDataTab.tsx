import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, HelpCircle, MessageSquare } from 'lucide-react';
import IvfCostManager from './IvfCostManager';
import DoctorQuestionsManager from './DoctorQuestionsManager';
import UserFeedbackManager from './UserFeedbackManager';

export default function FertilityDataTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl text-foreground">Fertility Data Management</h2>
        <p className="text-muted-foreground mt-1">Manage IVF cost estimates, doctor questions, and user feedback from the mobile app.</p>
      </div>

      <Tabs defaultValue="costs" className="space-y-4">
        <TabsList className="bg-card/50 border border-border/50">
          <TabsTrigger value="costs" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <DollarSign className="w-4 h-4 mr-1" />IVF Costs
          </TabsTrigger>
          <TabsTrigger value="questions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <HelpCircle className="w-4 h-4 mr-1" />Doctor Questions
          </TabsTrigger>
          <TabsTrigger value="feedback" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <MessageSquare className="w-4 h-4 mr-1" />User Feedback
          </TabsTrigger>
        </TabsList>

        <TabsContent value="costs"><IvfCostManager /></TabsContent>
        <TabsContent value="questions"><DoctorQuestionsManager /></TabsContent>
        <TabsContent value="feedback"><UserFeedbackManager /></TabsContent>
      </Tabs>
    </div>
  );
}
