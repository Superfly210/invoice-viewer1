
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { InvoiceReviewer } from "@/components/InvoiceReviewer";
import { InvoiceSigner } from "@/components/InvoiceSigner";
import { SummarySection } from "@/components/SummarySection";
import AFE from "@/pages/AFE";
import CostCenters from "@/pages/CostCenters";
import Permissions from "@/pages/Permissions";
import Vendor from "@/pages/Vendor";

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("reviewer"); // "signer", "reviewer", "summary", "vendor"

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed}
        onSectionChange={handleSectionChange}
        activeSection={activeSection}
      />
      <main className="flex flex-col flex-1 overflow-hidden">
        {activeSection === "reviewer" && <InvoiceReviewer />}
        {activeSection === "signer" && <InvoiceSigner />}
        {activeSection === "summary" && <SummarySection />}
        {activeSection === "afe" && <AFE />}
        {activeSection === "cost-centers" && <CostCenters />}
        {activeSection === "permissions" && <Permissions />}
        {activeSection === "vendor" && <Vendor />}
      </main>
    </div>
  );
};

export default Index;
