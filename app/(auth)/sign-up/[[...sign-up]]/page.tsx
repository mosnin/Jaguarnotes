import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <SignUp
      appearance={{
        variables: {
          colorPrimary: "#2563EB",
          colorBackground: "#EDF4FF",
          colorInputBackground: "#F4F8FF",
          colorInputText: "#1B3652",
          colorText: "#1B3652",
          colorTextSecondary: "#4A6D8C",
          colorNeutral: "#7B9AB8",
          borderRadius: "0.75rem",
          fontFamily: "var(--font-geist-sans)",
        },
        elements: {
          card: "shadow-none border border-[#C2D5EB]",
          headerTitle: "text-[#1B3652]",
          headerSubtitle: "text-[#4A6D8C]",
          socialButtonsBlockButton: "border-[#C2D5EB] text-[#1B3652] hover:bg-[#E2EEFF] transition-colors",
          dividerLine: "bg-[#C2D5EB]",
          dividerText: "text-[#7B9AB8]",
          formFieldLabel: "text-[#4A6D8C] text-xs",
          formFieldInput: "bg-[#F4F8FF] border-[#C2D5EB] text-[#1B3652] placeholder-[#A8C2D8] focus:border-[#2563EB]",
          formButtonPrimary: "bg-[#2563EB] hover:bg-[#1D4ED8] transition-colors",
          footerActionLink: "text-[#2563EB] hover:text-[#1D4ED8]",
        },
      }}
      redirectUrl="/onboarding"
      afterSignUpUrl="/onboarding"
    />
  );
}
