# API Specifications: HomeCraft AI
**REST & WebSocket Interface Endpoints**

---

## 1. Authentication Endpoints

### 1.1 Customer Registration
- **URL:** `POST /api/auth/register`
- **Request Body:**
  ```json
  {
    "email": "rohan@example.com",
    "password": "Password123!",
    "name": "Rohan Sharma",
    "phone": "9876543210",
    "location": "Karnal"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "user": { "id": "usr_902jf83", "email": "rohan@example.com", "name": "Rohan Sharma" }
  }
  ```

### 1.2 Customer Login
- **URL:** `POST /api/auth/login`
- **Request Body:**
  ```json
  {
    "email": "rohan@example.com",
    "password": "Password123!"
  }
  ```
- **Response (200 OK):**
  - Sets HTTP-Only Cookie: `session=<JWT>`
  ```json
  { "success": true, "role": "customer" }
  ```

---

## 2. Project & Room Workspace Endpoints

### 2.1 Create Project
- **URL:** `POST /api/projects`
- **Headers:** `Cookie: session=<JWT>`
- **Request Body:**
  ```json
  {
    "name": "Sukhdev Nagar Duplex",
    "houseType": "Villa",
    "areaSqft": 2400,
    "budget": 850000
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": "proj_kd938f2",
    "name": "Sukhdev Nagar Duplex",
    "status": "NEW_LEAD"
  }
  ```

### 2.2 Add Room to Project
- **URL:** `POST /api/projects/{projectId}/rooms`
- **Request Body:**
  ```json
  {
    "roomType": "Kitchen",
    "name": "Semi-Modular Ground Kitchen",
    "dimensions": { "length": 12, "width": 10, "height": 9.5 }
  }
  ```
- **Response (201 Created):**
  ```json
  { "id": "room_k38f02j", "roomType": "Kitchen", "projectId": "proj_kd938f2" }
  ```

---

## 3. AI Renovation & Estimation Endpoints

### 3.1 Trigger AI Design Generation
- **URL:** `POST /api/rooms/{roomId}/generate`
- **Request Body (Multipart Form-Data):**
  - `file`: Binaries of the original room image
  - `style`: "Modern"
  - `budgetTier`: "STANDARD"
  - `colors`: "Walnut, Matte White"
- **Response (202 Accepted):**
  ```json
  {
    "success": true,
    "taskId": "task_ai_092jf83j",
    "message": "AI generation job queued."
  }
  ```

### 3.2 Fetch Estimation Calculations
- **URL:** `POST /api/designs/{designVersionId}/estimate`
- **Request Body:**
  ```json
  {
    "dimensions": { "runningFeetLower": 12.5, "runningFeetUpper": 10.0 }
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "designVersionId": "dv_892jf83",
    "estimatedCost": 285400.0,
    "breakdown": {
      "materials": [
        { "name": "Action Tesa BWR Plywood 18mm", "qty": 8, "unit": "sheets", "cost": 32000.0 },
        { "name": "Advance Walnut Laminate 1mm", "qty": 4, "unit": "sheets", "cost": 8800.0 }
      ],
      "hardware": [
        { "name": "Hettich Soft-Close Hinges", "qty": 24, "unit": "pieces", "cost": 12000.0 }
      ],
      "labor": 64000.0,
      "gst": 43500.0
    }
  }
  ```

---

## 4. Admin CRM Endpoints

### 4.1 Update CRM Pipeline Status
- **URL:** `PUT /api/admin/projects/{projectId}/status`
- **Request Body:**
  ```json
  {
    "status": "QUOTATION_SENT"
  }
  ```
- **Response (200 OK):**
  ```json
  { "projectId": "proj_kd938f2", "previousStatus": "NEW_LEAD", "newStatus": "QUOTATION_SENT" }
  ```

### 4.2 Assign Team Member
- **URL:** `PUT /api/admin/projects/{projectId}/assign`
- **Request Body:**
  ```json
  {
    "assignedToId": "admin_staff_9281jf"
  }
  ```
- **Response (200 OK):**
  ```json
  { "success": true, "assignedTo": "Priya (Designer)" }
  ```
