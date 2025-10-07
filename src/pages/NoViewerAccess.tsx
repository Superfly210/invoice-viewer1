import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

export default function NoViewerAccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldAlert className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle>Access Restricted</CardTitle>
          <CardDescription>
            You don't have permission to access the Invoice Viewer Portal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Your account currently only has submission access. To view invoices, please contact
            an administrator to request viewer privileges.
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => navigate("/submission-portal")} className="w-full">
              Go to Submission Portal
            </Button>
            <Button onClick={() => navigate("/")} variant="outline" className="w-full">
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
