
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { InvoiceReviewer } from "@/components/InvoiceReviewer";
import { InvoiceSigner } from "@/components/InvoiceSigner";
import { SummarySection } from "@/components/SummarySection";
import AFE from "@/pages/AFE";
import CostCenters from "@/pages/CostCenters";
import CostCodes from "@/pages/CostCodes";
import Permissions from "@/pages/Permissions";
import Vendor from "@/pages/Vendor";

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("reviewer");

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  const renderPlaceholder = (title: string) => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-2">
          {title}
        </h2>
        <p className="text-gray-500 dark:text-gray-500">
          This section is coming soon.
        </p>
      </div>
    </div>
  );

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
        {activeSection === "cost-codes" && <CostCodes />}
        {activeSection === "permissions" && <Permissions />}
        {activeSection === "vendor" && <Vendor />}
        {activeSection === "inventory" && renderPlaceholder("Inventory Tracker")}
        {activeSection === "ops-daily" && renderPlaceholder("Ops Daily")}
      </main>
    </div>
  );
};

export default Index;
