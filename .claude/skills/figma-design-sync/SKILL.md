---
name: figma-design-sync
description: 'How to inspect Figma frames via the Figma MCP server, audit existing frontend components against the design spec, download or export design assets, update Angular/HTML/SCSS and backend seed data to match Figma pixel-for-pixel, and verify the live result.'
---
# Syncing Code to Match Figma Design (`figma-design-sync`)

Use this skill whenever you need to align existing UI components, layouts, typography, colors, spacing, or visual assets with a Figma design specification.

## 1. Inspect the Figma Design via MCP

1. **Read MCP Tool Schemas First**:
   - Inspect `get_figma_data.json` and `download_figma_images.json` under the MCP server schema directory (`mcp/mcp-server-figma/`).
2. **Extract File Key and Node IDs**:
   - From a Figma URL like `https://www.figma.com/design/<fileKey>/<fileName>?node-id=<nodeId>`:
     - `fileKey` is the alphanumeric segment after `/design/` or `/file/`.
     - Convert URL node IDs from hyphenated format (`123-456`) to colon format (`123:456`) when passing `nodeId` to `get_figma_data` or `download_figma_images`.
3. **Fetch Structured Design Metadata**:
   - Call `call_mcp_tool` with `ServerName: "mcp-server-figma"` and `ToolName: "get_figma_data"`, passing `fileKey` and `nodeId` (use `depth: 2` or `3` first for large pages, then drill into specific frames/components).
   - Extract exact tokens from the node tree:
     - **Layout & Grid**: `layoutMode` (`HORIZONTAL` / `VERTICAL` / `GRID`), `itemSpacing` (gap), `paddingTop/Right/Bottom/Left`, `primaryAxisAlignItems`, `counterAxisAlignItems`, column counts, and fixed/fill sizing (`layoutSizingHorizontal`, `layoutSizingVertical`).
     - **Typography**: `fontFamily`, `fontWeight`, `fontSize`, `lineHeight`, `letterSpacing`.
     - **Colors & Borders**: `fills` (solid hex/rgba, gradients), `strokes`, `strokeWeight`, `cornerRadius`.
     - **Effects**: `DROP_SHADOW` / `INNER_SHADOW` offsets, blur radius, and spread.

## 2. Export & Verify Visual Assets

1. **Download Reference Renders & Assets**:
   - Call `download_figma_images` with the target `fileKey`, `nodes` array (`nodeId`, `fileName`), and `localPath` pointing to the frontend assets folder (e.g., `frontend/restaurant-frontend-app/public/assets/images/`).
2. **Inspect Downloaded Images**:
   - Always view downloaded images using `view_file` to verify content and quality (e.g., ensuring restaurant location photos show interior/architectural scenes rather than food close-ups, and checking aspect ratios and cropping).
3. **Optimize Asset Delivery**:
   - Store static images in `public/assets/...` so both S3 and GitHub Pages serve them with deterministic relative/root paths.
   - Ensure every card or item in a collection (e.g., Popular Dishes, Locations) has a distinct, high-resolution asset matching the Figma frame.

## 3. Audit & Update the Codebase

1. **Map Figma Nodes to Code Components**:
   - Locate the corresponding Angular component templates (`.component.html`), styles (`.component.scss`), TypeScript logic (`.component.ts`), and data models.
2. **Align Layout & Alignment**:
   - **Grid & Card Counts**: Match the exact number of items per row and total items shown in the Figma frame (e.g., 4-column desktop grid `grid-template-columns: repeat(4, minmax(0, 1fr))` with responsive breakpoints for tablet/mobile).
   - **Flex/Inline Controls**: For interactive controls like quantity steppers (`- 1 +`), use `display: inline-flex; align-items: center; justify-content: center; line-height: 1` on both buttons and value labels so numbers sit optically and geometrically centered between action buttons.
3. **Update Backend / Seed Data When Required**:
   - If the Figma design specifies items, titles, addresses, capacities, ratings, or images that come from the API (such as popular dishes or restaurant locations), update both:
     - The seed/migration scripts (e.g., `scripts/seed-dynamodb.sh`) and live DynamoDB items so the API returns the exact records expected by the design.
     - Any frontend fallback/static asset maps so images resolve reliably.

## 4. Build, Lint & Visual Verification

1. **Static Checks**:
   - Run `npm run lint` and `npx tsc -p tsconfig.app.json --noEmit` inside `frontend/restaurant-frontend-app` to ensure zero lint or type errors.
2. **Production Build & Deployment**:
   - Build with `npm run build` and verify that the bundle compiles cleanly without missing asset warnings.
3. **Live Verification**:
   - Verify the rendered DOM, computed CSS styles (`getComputedStyle`), and loaded image dimensions (`naturalWidth > 0`) against the Figma frame.
