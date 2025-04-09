
import { useState } from "react";
import { ChevronDown, ChevronUp, MessageSquare, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Comment = {
  id: string;
  author: string;
  text: string;
  timestamp: string;
};

type HistoryEvent = {
  id: string;
  user: string;
  action: "approved" | "denied" | "forwarded";
  timestamp: string;
};

export const MetadataPanel = () => {
  const [expandedSections, setExpandedSections] = useState({
    history: true,
    comments: true,
  });
  
  const [commentText, setCommentText] = useState("");
  
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "comment-1",
      author: "Sarah Liu",
      text: "Need clarification on GST split.",
      timestamp: "2024-11-17 09:22 AM",
    },
  ]);
  
  const [history, setHistory] = useState<HistoryEvent[]>([
    {
      id: "history-1",
      user: "John Smith",
      action: "approved",
      timestamp: "2024-11-18 12:34 PM",
    },
    {
      id: "history-2",
      user: "Sarah Liu",
      action: "forwarded",
      timestamp: "2024-11-17 09:22 AM",
    },
  ]);

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

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="border-b border-slate-200 p-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-800">Invoice Metadata</h2>
        <div className="rounded-full px-3 py-1 text-sm bg-amber-100 text-amber-800">
          Pending Review
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Approval History Section */}
        <div className="border border-slate-200 rounded-md overflow-hidden">
          <button
            onClick={() => toggleSection('history')}
            className="w-full flex justify-between items-center p-3 bg-slate-50 text-left font-medium text-slate-700 hover:bg-slate-100"
          >
            Approval History
            {expandedSections.history ? (
              <ChevronUp className="h-5 w-5 text-slate-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-500" />
            )}
          </button>
          
          {expandedSections.history && (
            <div className="p-3 space-y-3">
              {history.map(event => (
                <div key={event.id} className="flex items-center">
                  <div className="w-6 h-6 flex-shrink-0">
                    <div 
                      className={cn(
                        "w-3 h-3 rounded-full mx-auto",
                        event.action === "approved" && "bg-green-500",
                        event.action === "denied" && "bg-red-500",
                        event.action === "forwarded" && "bg-blue-500"
                      )}
                    ></div>
                  </div>
                  <div className="flex-1 flex flex-col md:flex-row md:items-center">
                    <div className="font-medium text-slate-700">{event.user}</div>
                    <div className="md:mx-2 text-slate-500">→</div>
                    <div className={cn(
                      "px-2 py-0.5 rounded text-xs font-medium",
                      event.action === "approved" && "bg-green-100 text-green-800",
                      event.action === "denied" && "bg-red-100 text-red-800",
                      event.action === "forwarded" && "bg-blue-100 text-blue-800"
                    )}>
                      {event.action.charAt(0).toUpperCase() + event.action.slice(1)}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">{event.timestamp}</div>
                </div>
              ))}
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
                {comments.map(comment => (
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
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
