import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type VendorInfo = {
  id: number;
  invoicing_company_name: string | null;
  invoicing_company_street: string | null;
  invoicing_company_city: string | null;
  invoicing_company_province_state: string | null;
  invoicing_company_post_zip_code: string | null;
  gst_number: string | null;
  wcb_number: string | null;
  Prompt_Line_Items: string | null;
  match_criteria_1: string | null;
  match_criteria_2: string | null;
};

interface VendorComboboxProps {
  value: string | null;
  onVendorSelect: (vendor: VendorInfo) => void;
  className?: string;
}

export const VendorCombobox = ({ value, onVendorSelect, className }: VendorComboboxProps) => {
  const [open, setOpen] = useState(false);

  const { data: vendors = [] } = useQuery({
    queryKey: ['vendor-info'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_info')
        .select('*')
        .order('invoicing_company_name', { ascending: true });
      
      if (error) throw error;
      return data as VendorInfo[];
    },
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          role="combobox"
          aria-expanded={open}
          className={cn("opacity-0 group-hover:opacity-100 transition-opacity", className)}
        >
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Search vendors..." />
          <CommandList>
            <CommandEmpty>No vendor found.</CommandEmpty>
            <CommandGroup>
              {vendors.map((vendor) => (
                <CommandItem
                  key={vendor.id}
                  value={vendor.invoicing_company_name || ""}
                  onSelect={() => {
                    onVendorSelect(vendor);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === vendor.invoicing_company_name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {vendor.invoicing_company_name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
