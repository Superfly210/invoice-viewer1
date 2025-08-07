
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Eye } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  const handleSubmissionPortal = () => {
    navigate("/submission-auth");
  };

  const handleViewerPortal = () => {
    navigate("/viewer-auth");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Nubuck Invoice Management System
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose your portal to access the appropriate invoice management tools
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleSubmissionPortal}>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Invoice Submission Portal</CardTitle>
              <CardDescription>
                Submit invoices and supporting documents for processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg">
                Access Submission Portal
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleViewerPortal}>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                <Eye className="w-8 h-8 text-secondary-foreground" />
              </div>
              <CardTitle className="text-xl">Invoice Viewer Portal</CardTitle>
              <CardDescription>
                Review, approve, and manage submitted invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="secondary" size="lg">
                Access Viewer Portal
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
