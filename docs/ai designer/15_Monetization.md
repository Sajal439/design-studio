# Monetization & Business Modeling: HomeCraft AI
**Goel Traders Sales Funnel, SaaS Subscription Plans, and AI Credit Systems**

---

## 1. Primary Business Model: Lead Conversion Funnel

The core objective of HomeCraft AI is to maximize the sale of physical inventory products from Goel Traders' Karnal showroom. The platform operates as a value-added service to secure sales margins:

```
Free Visual Studio Tryout ──▶ Instant Material Estimation ──▶ WhatsApp Quote Request
                                                                     │
                                                                     ▼
                                                             Goel Traders Invoice
                                                             (Plywood, Hardware, etc.)
```

- **Retention Offset:** By offering free photorealistic room visualizations and instant transparent quotes, Goel Traders captures customers who would otherwise hire independent designers or buy materials from unorganized markets.

---

## 2. Future SaaS White-Label Expansion Tiers

To scale the platform outside Haryana, the software is designed to be white-labeled for regional interior studios and material showrooms across India:

### 2.1 Pricing Tier Matrix

| Tier | Target Audience | Price (INR / Mo) | Included Renders / Mo | Core Features |
| :--- | :--- | :---: | :---: | :--- |
| **Starter** | Boutique Designers | ₹2,999 | 100 | 1 User, Shared Domain, Basic Styles, S3 upload |
| **Professional**| Medium Design Studios| ₹9,999 | 500 | 5 Users, Custom Subdomain, Advanced styles, Basic CRM |
| **Enterprise** | Large Showrooms / Brands| Custom Quote | Unlimited (BYO API) | Dedicated server, CRM integration, Custom inventories, SSO |

---

## 3. AI Usage & Credit System (GPU Cost Management)

To protect operational margins against GPU rendering costs, a credit billing model is implemented:

- **Credit Calculation:**
  - 1 Standard SDXL Render = **1 credit**.
  - 1 High-Definition FLUX Render = **5 credits**.
  - 1 Florence-2 Material Scan = **0.5 credits**.
- **User Limits:**
  - Free users receive **10 credits** upon registration (for trial tryouts).
  - Additional credits can be purchased in bundles (e.g., ₹500 for 100 credits) integrated via payment gateways (Razorpay / Stripe).
- **Hard Limits:** When a user's credit balance reaches **0**, further generations are disabled with a modal prompt directing them to the checkout page.
