# System Scalability & Optimization: HomeCraft AI
**Asynchronous Processing, Database Scaling, and Caching Specifications**

---

## 1. Multi-Node Generation Scaling (Celery Workers)

Since AI rendering utilizes heavy GPU cycles, running generations synchronously in Next.js would block event loops and exhaust memory. We offload processing to independent Python workers orchestrated by **Celery** with **Redis** as the message broker.

```
Next.js Client ──▶ Redis Queue (generate_queue) ──▶ Celery Workers (Auto-scale)
                                                          │
                                                          ▼
                                                  Serverless GPU VM
                                                  (Replicate / RunPod)
```

- **Queue Isolation:**
  - `generate_queue`: Reserved for high-latency AI image synthesis tasks.
  - `recommend_queue`: Reserved for lower-latency Florence-2 tag calculations.
- **Auto-Scaling Policy:** Celery workers running on cloud hosts (such as AWS ECS) scale horizontally based on the size of the `generate_queue` backlog.

---

## 2. Distributed Caching Layer (Redis)

To handle 100,000 active users without database choke points, static and semi-static database queries are cached in memory using Redis:

```
                    Query request
                          │
                          ▼
                  ┌──────────────┐
                  │ Redis Cache  │ ──(Hit)──▶ Return Cached Data
                  └──────┬───────┘
                         │
                      (Miss)
                         ▼
                  ┌──────────────┐
                  │  PostgreSQL  │ ──▶ Set Cache & Return
                  └──────────────┘
```

- **Cached Objects & Policies:**
  - **PriceBookEntries:** Cached indefinitely (TTL: 0, since price book changes are rare). Invalidated on admin modification (`DELETE /api/admin/price-book` triggers write-through cache eviction).
  - **Category Catalog:** Cached for 24 hours.
  - **User Session Context:** Cached for 1 hour.

---

## 3. Database Connection Pooling & Read Replicas
- **Serverless Connection Pooling:** Since Vercel Serverless Functions spin up and down dynamically, they can quickly exhaust PostgreSQL's maximum connection limit. We route all client database connections through connection poolers (Neon connection pooler / Supabase PgBouncer) operating in transaction mode.
- **Read-Write Separation:**
  - **Write Queries:** (Insert/Update/Delete projects, messages, or users) are executed directly against the Primary PostgreSQL instance.
  - **Read Queries:** (Fetching dashboard lists, project histories, or inspiration galleries) are routed to PostgreSQL Read Replicas, distributing I/O loads.
