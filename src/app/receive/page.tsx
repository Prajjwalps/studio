
import { PendingRequestsList } from "@/components/receive/PendingRequestsList";
// Future: Add QR scan / manual entry for direct receive without formal request
// import { DirectReceiveForm } from "@/components/receive/DirectReceiveForm";

export default function ReceivePage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <PendingRequestsList />
      {/* 
      <Separator />
      <DirectReceiveForm /> 
      */}
    </div>
  );
}
