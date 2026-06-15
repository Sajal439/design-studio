import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Goel Traders",
  description: "Terms of service and conditions for using Goel Traders website and services.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-3xl prose prose-slate">
        <h1>Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: June 2026</p>

        <h2>1. Agreement to Terms</h2>
        <p>
          By accessing our website at https://www.goeltraders.in, you agree to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
        </p>

        <h2>2. Use License</h2>
        <p>
          Permission is granted to temporarily download one copy of the materials (information or software) on Goel Traders' website for personal, non-commercial transitory viewing only.
        </p>

        <h2>3. Disclaimer</h2>
        <p>
          The materials on Goel Traders' website are provided on an 'as is' basis. Goel Traders makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
        </p>

        <h2>4. Material Estimates</h2>
        <p>
          The material estimates and prices provided by our estimator tool are approximate and subject to change based on actual site measurements, specific material choices, and current market prices. Final quotes will be provided upon detailed discussion and site verification.
        </p>

        <h2>5. Limitations</h2>
        <p>
          In no event shall Goel Traders or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Goel Traders' website.
        </p>

        <h2>6. Revisions and Errata</h2>
        <p>
          The materials appearing on Goel Traders' website could include technical, typographical, or photographic errors. Goel Traders does not warrant that any of the materials on its website are accurate, complete or current.
        </p>

        <h2>7. Governing Law</h2>
        <p>
          These terms and conditions are governed by and construed in accordance with the laws of India, and you irrevocably submit to the exclusive jurisdiction of the courts in Haryana.
        </p>
      </div>
    </div>
  );
}
