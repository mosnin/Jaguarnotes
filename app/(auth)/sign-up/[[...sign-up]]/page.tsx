import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center">
      <Link
        href="/"
        className="mb-4 flex items-center gap-1 text-sm text-ink-3 hover:text-ink-1 transition-colors"
      >
        ← Back to home
      </Link>
      <div className="neu-card rounded-2xl p-6">
        <SignUp
          appearance={{
            variables: {
              colorPrimary: '#2563EB',
              colorBackground: '#EDF4FF',
              colorText: '#1B3652',
              colorTextSecondary: '#4A6D8C',
              colorInputBackground: '#F4F8FF',
              colorInputText: '#1B3652',
              borderRadius: '12px',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            },
            elements: {
              card: 'shadow-none bg-transparent',
              headerTitle: 'text-[#1B3652] font-bold',
              headerSubtitle: 'text-[#7B9AB8]',
              formButtonPrimary: 'bg-[#2563EB] hover:opacity-90 transition-opacity',
              formFieldInput: 'border-[#C2D5EB] bg-[#F4F8FF] focus:border-[#2563EB] focus:ring-2 focus:ring-[rgba(37,99,235,0.12)]',
              footerActionLink: 'text-[#2563EB] hover:text-[#1D4ED8]',
              dividerText: 'text-[#7B9AB8]',
              dividerLine: 'bg-[#D5E4F5]',
              socialButtonsBlockButton: 'border-[#C2D5EB] bg-[#F4F8FF] hover:bg-[#E2EEFF] text-[#1B3652]',
            },
          }}
          redirectUrl="/onboarding"
          afterSignUpUrl="/onboarding"
        />
      </div>
    </div>
  );
}
