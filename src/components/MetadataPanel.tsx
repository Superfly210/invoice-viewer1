
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, MessageSquare, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Comment = {
  id: string;
  author: string;
  text: string;
  timestamp: string;
};

type EmailInfo = {
  id_: number;
  created_at: string;
  Date: string | null;
  From: string | null;
  Subject: string | null;
  Email_Mark_Down: string | null;
  cc?: string | null;
  Email_Type: string | null;
}

interface MetadataPanelProps {
  currentInvoiceId?: number | null;
}

export const MetadataPanel = ({ currentInvoiceId }: MetadataPanelProps) => {
  const [expandedSections, setExpandedSections] = useState({
    history: true,
    comments: true,
  });
  
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [emailHistory, setEmailHistory] = useState<EmailInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (currentInvoiceId) {
      fetchEmailHistory();
    }
  }, [currentInvoiceId]);

  const fetchEmailHistory = async () => {
    if (!currentInvoiceId) return;
    
    try {
      setIsLoading(true);
      
      // First get the Email_Info_ID from Attachment_Info
      const { data: attachmentData, error: attachmentError } = await supabase
        .from('Attachment_Info')
        .select('Email_Info_ID')
        .eq('id', currentInvoiceId)
        .single();
        
      if (attachmentError) {
        console.error("Error fetching attachment info:", attachmentError);
        return;
      }
      
      if (attachmentData && attachmentData.Email_Info_ID) {
        // Get the email info
        const { data: emailData, error: emailError } = await supabase
          .from('Email_Info')
          .select('*')
          .eq('id_', attachmentData.Email_Info_ID);
          
        if (emailError) {
          console.error("Error fetching email history:", emailError);
          return;
        }
        
        if (emailData) {
          setEmailHistory(emailData as EmailInfo[]);
        }
      }
    } catch (error) {
      console.error('Error fetching email history:', error);
      toast({
        title: "Error",
        description: "Failed to load email history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (section: 'history' | 'comments') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  
  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;
    
    const newComment: Comment = {
      id: `comment-${comments.length + 1}`,
      author: "Current User",
      text: commentText,
      timestamp: new Date().toLocaleString(),
    };
    
    setComments([newComment, ...comments]);
    setCommentText("");
  };

  const formatEmailDate = (dateString: string | null, createdAt: string) => {
    const date = dateString ? new Date(dateString) : new Date(createdAt);
    return date.toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="border-b border-slate-200 p-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-800">Invoice Metadata</h2>
        <div className="rounded-full px-3 py-1 text-sm bg-amber-100 text-amber-800">
          Pending Review
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Email History Section */}
        <div className="border border-slate-200 rounded-md overflow-hidden">
          <button
            onClick={() => toggleSection('history')}
            className="w-full flex justify-between items-center p-3 bg-slate-50 text-left font-medium text-slate-700 hover:bg-slate-100"
          >
            Email History
            {expandedSections.history ? (
              <ChevronUp className="h-5 w-5 text-slate-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-500" />
            )}
          </button>
          
          {expandedSections.history && (
            <div className="p-3 space-y-3">
              {isLoading ? (
                <div className="text-center text-slate-500">Loading email history...</div>
              ) : emailHistory.length > 0 ? (
                emailHistory.map(email => (
                  <div key={email.id_} className="flex items-center">
                    <div className="w-6 h-6 flex-shrink-0">
                      <div className="w-3 h-3 rounded-full mx-auto bg-blue-500"></div>
                    </div>
                    <div className="flex-1 flex flex-col md:flex-row md:items-center">
                      <div className="font-medium text-slate-700">{email.From || "Unknown sender"}</div>
                      <div className="md:mx-2 text-slate-500">→</div>
                      <div className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Received
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatEmailDate(email.Date, email.created_at)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-500">No email history available</div>
              )}
            </div>
          )}
        </div>
        
        {/* Comments Section */}
        <div className="border border-slate-200 rounded-md overflow-hidden">
          <button
            onClick={() => toggleSection('comments')}
            className="w-full flex justify-between items-center p-3 bg-slate-50 text-left font-medium text-slate-700 hover:bg-slate-100"
          >
            Comments
            {expandedSections.comments ? (
              <ChevronUp className="h-5 w-5 text-slate-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-500" />
            )}
          </button>
          
          {expandedSections.comments && (
            <div className="p-3">
              {/* Comment Input */}
              <div className="mb-4 flex">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="min-h-[80px] flex-1 mr-2"
                />
                <Button 
                  onClick={handleCommentSubmit}
                  className="bg-blue-500 hover:bg-blue-600 self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Comments List */}
              <div className="space-y-3">
                {comments.length === 0 ? (
                  <div className="text-center text-slate-500">No comments yet</div>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className="p-3 bg-slate-50 rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium text-slate-700 flex items-center">
                          <MessageSquare className="h-4 w-4 mr-2 text-slate-400" />
                          {comment.author}
                        </div>
                        <div className="text-xs text-slate-500">{comment.timestamp}</div>
                      </div>
                      <div className="text-slate-700">{comment.text}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
