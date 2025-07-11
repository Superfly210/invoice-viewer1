
import { AFETable } from "@/components/AFETable";

export default function AFE() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-6 pb-0">
        <h1 className="text-2xl font-semibold mb-4">AFE Management</h1>
      </div>
      <div className="flex-1 p-6 pt-0">
        <AFETable />
      </div>
    </div>
  );
}
