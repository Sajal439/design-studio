# AI Architecture: HomeCraft AI
**Generative Models, Visual Forensics, and Recommendation Engines**

---

## 1. Visual Generation Pipeline

The generation pipeline ensures that while the style and materials of a room are completely transformed, its structural reality (walls, window placements, pillar locations) remains identical to the uploaded photo.

```
┌──────────────┐      ┌─────────────────────────┐      ┌────────────────┐
│ Uploaded Room│ ──▶  │ ControlNet Preprocessor │ ──▶  │  Depth / Canny │
│    Photo     │      │   (Depth-Anything-V2)   │      │      Maps      │
└──────┬───────┘      └─────────────────────────┘      └───────┬────────┘
       │                                                       │
       ▼                                                       ▼
┌──────────────┐      ┌─────────────────────────┐      ┌────────────────┐
│  Florence-2  │ ──▶  │ Prompt Construction Llama│ ──▶  │ FLUX / SDXL    │ ──▶ RENDER
│ Tagging / OCR│      │  (Style, Color, Budget) │      │  Image Model   │
└──────────────┘      └─────────────────────────┘      └────────────────┘
```

### 1.1 Model Breakdown
1.  **Structural Extraction (ControlNet):**
    *   **Model:** `Depth-Anything-V2-Small` or Canny edge detection.
    *   **Purpose:** Extract grayscale depth maps of the original room, guaranteeing that generated furniture occupies the same 3D spatial boundaries as the physical walls.
2.  **Room Understanding (Florence-2 / VLM):**
    *   **Model:** `Florence-2-base` or `GPT-4o-mini` (API-based).
    *   **Purpose:** Segment the image into room areas (e.g. floor, ceiling, countertop, cabinet) and tag existing architectural components.
3.  **Image Synthesis:**
    *   **Model:** `FLUX.1-dev` (via Replicate API or local 24GB VRAM GPU) or `SDXL-Refiner`.
    *   **Purpose:** Combines the generated prompt, depth map constraint, and category layout to output a photorealistic, styled renovation render.

---

## 2. Material Recommendation Engine (Visual RAG)

HomeCraft AI translates generated visual renders into real, purchasable physical inventory products:

```
┌────────────────┐      ┌─────────────────────────┐      ┌─────────────────┐
│ Generated AI   │ ──▶  │ Visual Feature Extractor│ ──▶  │ Vector Database │
│ Render Image   │      │  (CLIP / SigLIP Embed)  │      │    (Qdrant)     │
└────────────────┘      └─────────────────────────┘      └────────┬────────┘
                                                                  │
                                                                  ▼
┌────────────────┐      ┌─────────────────────────┐      ┌─────────────────┐
│ Goel Traders   │ ◀──  │ Product Mapping Logic   │ ◀──  │ Closest Product │
│ Shopping List  │      │  (Matches Brand & Tier) │      │   Matches       │
└────────────────┘      └─────────────────────────┘      └─────────────────┘
```

- **Step 1: Feature Tagging:** Florence-2 identifies textured materials in the generated render (e.g., "dark wood texture kitchen cabinet", "gold handle").
- **Step 2: Vector Embedding:** The text tags are converted into vector embeddings using `bge-large-en-v1.5`.
- **Step 3: Vector Search:** We execute a similarity search in Qdrant containing Goel Traders' material catalog (e.g. laminates, handles).
- **Step 4: Hard Filter:** The search result is filtered by the user's selected budget tier (`BUDGET` maps to Advance Laminates, `PREMIUM` maps to Hettich hardware).

---

## 3. Conversational AI Memory Architecture
To support project context (e.g. "Create my bedroom TV unit matching the walnut laminate used in the kitchen"), we build a state graph using **LangGraph**:

- **System Prompt Context Injection:**
  ```python
  system_prompt = f"""
  You are the Goel Traders Sales Assistant. 
  You have access to the client's current project ID: {project_id}.
  Existing rooms in this project: {project_rooms_data} (colors, materials, styles selected).
  Always ensure that material recommendations remain consistent with the rooms the client has already approved.
  """
  ```
- **State Schema:**
  - `messages`: List of chat messages.
  - `project_context`: Dict containing active material preferences (e.g. wood_type: "walnut").
  - `agent_actions`: Pending workflow requests (e.g., "Flag quote request for designer review").
