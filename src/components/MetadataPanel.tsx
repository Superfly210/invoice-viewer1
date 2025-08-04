
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, MessageSquare, Send, Edit3, Trash2, Plus, Clock, ArrowUpDown, Mail, Undo } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuditTrail } from "@/hooks/useAuditTrail";
import { useUndo } from "@/hooks/useUndo";

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
    eventHistory: true,
    comments: true,
  });
  
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [emailHistory, setEmailHistory] = useState<EmailInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const { toast } = useToast();
  const { undoChange, isUndoing } = useUndo();

  const { data: auditTrail = [], isLoading: auditLoading } = useAuditTrail(currentInvoiceId || 0);

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

  const toggleSection = (section: 'eventHistory' | 'comments') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
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

  // Combine and sort event history
  const getCombinedEventHistory = () => {
    const events: Array<{ type: 'email' | 'audit', data: any, timestamp: string }> = [];

    // Add email events
    emailHistory.forEach(email => {
      events.push({
        type: 'email',
        data: email,
        timestamp: email.Date || email.created_at
      });
    });

    // Add audit events
    auditTrail.forEach(audit => {
      events.push({
        type: 'audit',
        data: audit,
        timestamp: audit.changed_at
      });
    });

    // Sort events
    events.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return events;
  };

  const renderEventItem = (event: { type: 'email' | 'audit', data: any, timestamp: string }, index: number) => {
    if (event.type === 'email') {
      return (
        <div key={`email-${event.data.id_}`} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-md">
          <div className="flex-shrink-0 mt-1">
            <Mail className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-slate-700">Email Received</span>
              <span className="text-xs text-slate-500">
                {formatEmailDate(event.data.Date, event.data.created_at)}
              </span>
            </div>
            <div className="text-xs text-slate-600 mb-1">
              <strong>From:</strong> {event.data.From || "Unknown sender"}
            </div>
            <div className="text-xs text-slate-600">
              <strong>Subject:</strong> {event.data.Subject || "No subject"}
            </div>
          </div>
        </div>
      );
    }

    // Audit event
    const changeTypeIcons = {
      INSERT: <Plus className="h-4 w-4 text-green-600" />,
      UPDATE: <Edit3 className="h-4 w-4 text-blue-600" />,
      DELETE: <Trash2 className="h-4 w-4 text-red-600" />
    };

    const sourceLabel = event.data.source_type === 'invoice' ? 'Invoice' : 'Line Item';
    
    return (
      <div key={`audit-${event.data.id}`} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-md">
        <div className="flex-shrink-0 mt-1">
          {changeTypeIcons[event.data.change_type as keyof typeof changeTypeIcons]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-slate-700">
              {sourceLabel} - {event.data.field_name}
            </span>
            <span className="text-xs text-slate-500">
              {new Date(event.data.changed_at).toLocaleString()}
            </span>
          </div>
          {event.data.user_name && (
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-600 mb-1">
                <strong>Changed by:</strong> {event.data.user_name}
              </div>
              {event.data.change_type !== 'DELETE' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => undoChange(event.data)}
                  disabled={isUndoing}
                  className="h-6 px-2 text-xs"
                >
                  <Undo className="h-3 w-3 mr-1" />
                  Undo
                </Button>
              )}
            </div>
          )}
          {event.data.change_type === 'UPDATE' && (
            <div className="text-xs text-slate-600">
              <span className="text-red-600">From: {event.data.old_value || 'null'}</span>
              <span className="mx-2">→</span>
              <span className="text-green-600">To: {event.data.new_value || 'null'}</span>
            </div>
          )}
          {event.data.change_type === 'INSERT' && (
            <div className="text-xs text-green-600">
              Added: {event.data.new_value || 'N/A'}
            </div>
          )}
          {event.data.change_type === 'DELETE' && (
            <div className="text-xs text-red-600">
              Removed: {event.data.old_value || 'N/A'}
            </div>
          )}
        </div>
      </div>
    );
  };

  const combinedEvents = getCombinedEventHistory();

  return (
    <div className="bg-white rounded-lg shadow-sm">
      

      <div className="p-4 space-y-4">
        {/* Event History Section */}
        <div className="border border-slate-200 rounded-md overflow-hidden">
          <button
            onClick={() => toggleSection('eventHistory')}
            className="w-full flex justify-between items-center p-3 bg-slate-50 text-left font-medium text-slate-700 hover:bg-slate-100"
          >
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Event History</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSortOrder();
                }}
                className="h-6 px-2 text-xs"
              >
                <ArrowUpDown className="h-3 w-3 mr-1" />
                {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
              </Button>
              {expandedSections.eventHistory ? (
                <ChevronUp className="h-5 w-5 text-slate-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-500" />
              )}
            </div>
          </button>
          
          {expandedSections.eventHistory && (
            <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
              {isLoading || auditLoading ? (
                <div className="text-center text-slate-500">Loading event history...</div>
              ) : combinedEvents.length > 0 ? (
                combinedEvents.map(renderEventItem)
              ) : (
                <div className="text-center text-slate-500">No events recorded yet</div>
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
