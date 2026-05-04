import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <SignIn
      appearance={{
        variables: {
          colorPrimary: "#ffffff",
          colorBackground: "#111111",
          colorInputBackground: "#0a0a0a",
          colorInputText: "#ededed",
          colorText: "#ededed",
          colorTextSecondary: "#888888",
          colorNeutral: "#888888",
          borderRadius: "0.75rem",
          fontFamily: "var(--font-geist-sans)",
        },
        elements: {
          card: "bg-[#111] border border-[#1e1e1e] shadow-2xl",
          headerTitle: "text-white",
          headerSubtitle: "text-[#888]",
          socialButtonsBlockButton: "bg-[#1a1a1a] border-[#1e1e1e] text-white hover:bg-[#222] transition-colors",
          dividerLine: "bg-[#1e1e1e]",
          dividerText: "text-[#444]",
          formFieldLabel: "text-[#888] text-xs",
          formFieldInput: "bg-[#0a0a0a] border-[#1e1e1e] text-white placeholder-[#333] focus:border-indigo-500",
          formButtonPrimary: "bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 transition-opacity",
          footerActionLink: "text-white/70 hover:text-white",
          identityPreviewText: "text-[#888]",
          identityPreviewEditButton: "text-white/70",
        },
      }}
      redirectUrl="/dashboard"
      afterSignInUrl="/dashboard"
    />
  );
}
