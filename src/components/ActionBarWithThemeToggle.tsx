
import { 
  CheckCircle, 
  XCircle, 
  CornerUpRight, 
  ChevronLeft,
  ChevronRight,
  PauseCircle,
  ChevronDown,
  Filter,
  FileX,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type ActionBarProps = {
  onApprove: () => void;
  onDeny: () => void;
  onQuarantine: () => void;
  onNotAnInvoice: () => void;
  onApproveAndForward: (userId: string, userName: string) => void;
  onForward: (userId: string, userName: string) => void;
  currentInvoice: number;
  totalInvoices: number;
  onPrevious: () => void;
  onNext: () => void;
  userFilter: "all" | "mine";
  onUserFilterChange: (filter: "all" | "mine") => void;
  statusFilter: "all" | "pending" | "approved" | "hold";
  onStatusFilterChange: (filter: "all" | "pending" | "approved" | "hold") => void;
};

export const ActionBarWithThemeToggle = ({
  onApprove,
  onDeny,
  onQuarantine,
  onNotAnInvoice,
  onApproveAndForward,
  onForward,
  currentInvoice,
  totalInvoices,
  onPrevious,
  onNext,
  userFilter,
  onUserFilterChange,
  statusFilter,
  onStatusFilterChange,
}: ActionBarProps) => {
  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username')
        .order('full_name');
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Button 
            onClick={onPrevious}
            variant="outline"
            disabled={currentInvoice <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium">
            Invoice {currentInvoice} of {totalInvoices}
          </div>
          <Button 
            onClick={onNext}
            variant="outline"
            disabled={currentInvoice >= totalInvoices}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={userFilter} onValueChange={(value: "all" | "mine") => onUserFilterChange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Invoices</SelectItem>
              <SelectItem value="mine">My Invoices</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(value: "all" | "pending" | "approved" | "hold") => onStatusFilterChange(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending Approval</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button 
          onClick={onApprove}
          className="bg-green-500 hover:bg-green-600 text-white min-w-[100px]"
        >
          <CheckCircle className="h-4 w-4 mr-2" /> Approve
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-green-500 hover:bg-green-600 text-white min-w-[120px]">
              <Send className="h-4 w-4 mr-2" /> 
              Approve & Forward
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {profiles.map((profile) => (
              <DropdownMenuItem
                key={profile.id}
                onClick={() => onApproveAndForward(profile.id, profile.full_name || profile.username || 'Unknown User')}
              >
                {profile.full_name || profile.username || 'Unknown User'}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button 
          onClick={onDeny}
          className="bg-red-500 hover:bg-red-600 text-white min-w-[100px]"
        >
          <XCircle className="h-4 w-4 mr-2" /> Deny
        </Button>
        <Button 
          onClick={onNotAnInvoice}
          className="bg-red-500 hover:bg-red-600 text-white min-w-[120px]"
        >
          <FileX className="h-4 w-4 mr-2" /> Not an Invoice
        </Button>
        <Button 
          onClick={onQuarantine}
          className="bg-[#FEF7CD] hover:bg-[#F6E68E] text-amber-800 min-w-[100px] dark:bg-amber-700 dark:hover:bg-amber-800 dark:text-white"
        >
          <PauseCircle className="h-4 w-4 mr-2" /> Hold
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="min-w-[100px]">
              <CornerUpRight className="h-4 w-4 mr-2" /> 
              Forward
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {profiles.map((profile) => (
              <DropdownMenuItem
                key={profile.id}
                onClick={() => onForward(profile.id, profile.full_name || profile.username || 'Unknown User')}
              >
                {profile.full_name || profile.username || 'Unknown User'}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
