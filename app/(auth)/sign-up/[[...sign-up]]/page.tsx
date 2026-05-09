import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <SignUp
        appearance={{
          variables: {
            colorPrimary: "#2563EB",
            colorBackground: "#FFFFFF",
            colorText: "#18181B",
            colorTextSecondary: "#52525B",
            colorInputBackground: "#F4F4F5",
            colorInputText: "#18181B",
            borderRadius: "10px",
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
          },
          elements: {
            card: "shadow-none bg-white border border-line-2 rounded-2xl",
            headerTitle: "font-bold",
            formButtonPrimary: "bg-[#2563EB] hover:opacity-90 transition-opacity shadow-none",
            formFieldInput: "border-line-2 focus:border-[#2563EB] focus:ring-2 focus:ring-[rgba(37,99,235,0.12)] shadow-none",
            footerActionLink: "text-[#2563EB] hover:text-[#1D4ED8]",
            socialButtonsBlockButton: "border-line-2 bg-raised hover:bg-hover shadow-none",
          },
        }}
        redirectUrl="/onboarding"
        afterSignUpUrl="/onboarding"
      />
      <Link href="/" className="text-xs text-ink-4 transition-colors hover:text-ink-2">
        ← Back to home
      </Link>
    </div>
  );
}
