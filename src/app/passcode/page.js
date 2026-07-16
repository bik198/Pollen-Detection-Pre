import { Suspense } from "react";
import PasscodeForm from "@/components/PasscodeForm";

export default function PasscodePage() {
  return (
    <Suspense>
      <PasscodeForm />
    </Suspense>
  );
}
