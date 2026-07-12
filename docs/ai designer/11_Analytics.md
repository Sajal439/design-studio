# Business Analytics & KPI Framework: HomeCraft AI
**Data Strategy, Metrics Definition, and Event Triggers**

---

## 1. Core Business Metrics (KPIs)

### 1.1 Inbound Lead Conversion Rate
- **Definition:** The percentage of landing page visitors who sign up and create a renovation project.
- **Formula:**
  $$\text{Lead Conversion} = \left( \frac{\text{Unique Users with } \ge 1 \text{ Project}}{\text{Total Unique Visitors}} \right) \times 100$$
- **Target:** $>5.0\%$ monthly average.

### 1.2 Design Acceptance & Interaction Rate
- **Definition:** User engagement with generated AI design versions.
- **Formula:**
  $$\text{Design Acceptance} = \left( \frac{\text{DesignVersions marked as FAVORITE}}{\text{Total DesignVersions generated}} \right) \times 100$$
- **Target:** $>15\%$ favorite rate.

### 1.3 Sales Pipeline Close Rate
- **Definition:** The percentage of quote requests that transition to a confirmed paid order.
- **Formula:**
  $$\text{Close Rate} = \left( \frac{\text{Quotes with status CONFIRMED}}{\text{Total Quotes sent}} \right) \times 100$$
- **Target:** $>22\%$ conversion of sent quotes.

---

## 2. Event Tracking Schema

To capture granular analytical data without impacting performance, database transaction triggers or lightweight event emission libraries (e.g. Mixpanel or self-hosted tracking APIs) will capture actions:

```json
{
  "event_name": "ai_design_generated",
  "properties": {
    "userId": "usr_902jf83",
    "projectId": "proj_kd938f2",
    "roomId": "room_k38f02j",
    "roomType": "Kitchen",
    "selectedStyle": "Minimalist",
    "selectedBudget": "STANDARD",
    "generationTimeSeconds": 12.4,
    "source": "dashboard_v1"
  },
  "timestamp": "2026-07-11T23:55:01Z"
}
```

---

## 3. Business Intelligence (BI) Dashboard Layout

The Admin Analytics view (`/admin/analytics`) maps out three functional charts:
1.  **Revenue Funnel Chart:** Displays total pipeline value mapped per CRM stage (e.g. value of quotes in negotiation vs confirmed).
2.  **Style & Materials Trend Heatmap:** Bar charts displaying style selection counts (Modern vs Scandinavian) and most frequently recommended inventory materials (e.g., Action Tesa BWR vs HDHMR boards).
3.  **Operation Latency Line Graph:** Tracks AI pipeline response queues (processing delays) over time to alert on VM capacity issues.
