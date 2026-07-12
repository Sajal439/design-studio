# Role-Based Access Control (RBAC): HomeCraft AI
**Identity & Resource Access Policy Specification**

---

## 1. System Roles
The system governs operations across six distinct user roles:

1.  **Customer:** Homeowners who create projects, run design generations, review quotes, and chat with AI assistants. Can access ONLY their own records.
2.  **Sales Executive:** Showroom employees managing consultations, editing client quotes, and moving leads through initial CRM stages.
3.  **Interior Designer:** Partners who upload layout templates, review customer generated styles, add notes, and finalize material selections.
4.  **Project Manager:** Tracks material procurement and timeline logistics for active home sites.
5.  **Installer:** On-site installation staff who update room status once hardware is set.
6.  **Administrator:** Full platform operations, CRM pipeline configuration, employee provisioning, and Price Book editing access.

---

## 2. Access Control Permission Matrix

| Resource | Action | Customer | Sales | Designer | Project Mgr | Installer | Admin |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Project** | Create/Update | Own Only | Yes | Assigned | Assigned | No | Yes |
| | View | Own Only | Yes | Assigned | Assigned | Assigned | Yes |
| | Delete | Own Only | No | No | No | No | Yes |
| **DesignVersion**| Trigger AI | Own Only | Yes | Yes | No | No | Yes |
| | Approve/Favorite| Own Only | Yes | Yes | No | No | Yes |
| **PriceBook** | View | Yes | Yes | Yes | Yes | Yes | Yes |
| | Edit/Modify | No | No | No | No | No | Yes |
| **Quote** | View Draft | No | Yes | Yes | Yes | No | Yes |
| | View Finalized | Own Only | Yes | Yes | Yes | No | Yes |
| | Create/Edit | No | Yes | Yes | No | No | Yes |
| **CRM Pipeline** | Move Stages | No | Yes | No | Yes | No | Yes |
| **User Directory**| Manage Roles | No | No | No | No | No | Yes |

---

## 3. Middleware Assertion Pattern (Next.js & FastAPI)

### A. Next.js Route Guard Example (`middleware.ts`)
```typescript
// Define role-specific path rules
const ROLE_ROUTE_PERMISSIONS: Record<string, string[]> = {
  "/admin/crm": ["admin", "sales"],
  "/admin/price-book": ["admin"],
  "/dashboard": ["customer", "admin", "sales", "designer"],
};

export async function authorizeRoute(pathname: string, userRole: string): Promise<boolean> {
  const matchedRule = Object.keys(ROLE_ROUTE_PERMISSIONS).find(route => pathname.startsWith(route));
  if (!matchedRule) return true; // public route
  return ROLE_ROUTE_PERMISSIONS[matchedRule].includes(userRole);
}
```

### B. FastAPI Endpoint Decorator Pattern (Python)
```python
from fastapi import Depends, HTTPException, status
from auth_utils import get_current_user

class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user = Depends(get_current_user)):
        if user["role"] not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted for current role."
            )
        return user

# Example usage:
# @router.put("/price-book")
# def update_price_book(db = Depends(get_db), current_user = Depends(RoleChecker(["admin"])))
```
