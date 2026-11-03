# US6_AI Conversational Reservation Assistant

| Field | Value |
| --- | --- |
| **Epic** | Reservation Management / AI Concierge & Automation |
| **US name** | AI Conversational Reservation Assistant |
| **Role** | Customer / Dining Guest / Platform Visitor |
| **Description** | As a restaurant visitor or customer, I want to interact with an AI conversational assistant powered by Google Gemini, so that I can ask about table availability, check open time slots, and reserve a table through natural language conversation directly within a floating chat widget. |

### Pre-conditions:
- Restaurant table management and reservation creation services/endpoints are operational on the backend.
- The Gemini API integration service is configured with API credentials.
- The floating chat widget is accessible across customer-facing application pages.

---

### Acceptance Criteria (AC):

1. **Floating Chat Widget UI & Toggle**:
   - A persistent floating chat button with a welcoming chat icon is positioned in the bottom-right corner of the screen.
   - Clicking the floating button toggles the chat window open and closed with a smooth animation.
   - The chat window header displays the assistant name (e.g., "Green & Tasty Host"), an active online indicator, and an explicit close button.
   - The widget is responsive, rendering cleanly on mobile, tablet, and desktop viewports without obstructing critical layout elements.

2. **Conversational Messaging & Auto-Scroll**:
   - The chat interface includes a scrollable message history container, an input field with placeholder text, and a send button (supporting both click and Enter key submission).
   - Distinct visual styles differentiate user messages (aligned right, primary theme color) and assistant responses (aligned left, neutral card styling).
   - The chat window automatically scrolls smoothly to the latest message whenever a new message is sent or received.
   - An initial welcoming greeting from the Green & Tasty host is displayed when a new chat session is started.

3. **Loading & Typing Indicators**:
   - While the AI assistant is processing a prompt or executing backend tools, an animated typing/loading indicator (pulsing dots) is displayed in the chat stream.
   - The send button and input are safely disabled or indicate processing to prevent duplicate message dispatches.

4. **Table Availability Checking via Function Calling (`check_availability`)**:
   - When the user asks about booking or table availability for a specific date and guest count, the assistant invokes the `check_availability` function call tool with parameters:
     - `date`: string (ISO date or YYYY-MM-DD format)
     - `guests_count`: number (party size)
   - The backend executes internal availability verification using existing table and reservation services.
   - The assistant translates the tool execution output into a polite, concise conversational response listing available tables or time slots.

5. **Reservation Booking via Function Calling (`create_reservation`)**:
   - When the user provides reservation details (name, phone, guest count, desired date & time, optional special requests), the assistant invokes the `create_reservation` tool with parameters:
     - `name`: string
     - `phone`: string
     - `guests_count`: number
     - `datetime`: string (ISO datetime)
     - `special_requests`: string (optional)
   - The backend creates the reservation using the existing reservation service and returns the booking confirmation details.
   - The assistant delivers a polite confirmation message to the user.

6. **Rich Reservation Confirmation Card in Chat**:
   - Upon successful reservation creation, the chat UI renders an inline styled booking confirmation card showing:
     - Booking Reference / Status ("Confirmed")
     - Date & Time
     - Number of Guests
     - Guest Contact Name
   - The confirmation card matches the Green & Tasty design system with green accents and clean typography.

7. **Backend Chat Orchestration (`POST /api/chat` and `POST /chat`)**:
   - The backend exposes a chat endpoint that accepts user messages and conversation history.
   - The backend initializes the Gemini API client with system instructions defining the assistant as a polite, welcoming, concise restaurant host.
   - The backend defines function tools (`check_availability`, `create_reservation`), intercepts any `functionCall` events from Gemini, executes internal services, feeds `functionResponse` back into the conversation, and returns the final synthesized reply.
   - In case of missing credentials or external API unavailability, a graceful fallback response is returned without crashing the server.

8. **Security & Robust Error Handling**:
   - All user inputs are sanitized against malicious payloads before transmission and processing.
   - Proper validation checks ensure invalid dates, past times, or negative guest counts are rejected with user-friendly error explanations.
   - Network timeouts and unexpected backend errors display helpful troubleshooting messages in the chat stream.
