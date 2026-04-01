# Athlete Card

  A web app for Wahoo booth at big events, used to aut generates personalized cyclist hero cards. 
  Attendees take a photo of themselves using the commputer camera, 
  take the athlete profile quiz in their own Wahoo account (if they already have one) or use demo mode, 
  and get a card featuring their 4DP power profile with the snail chart.

  In the future we can extend this to include running 3DP as well.

  ## What it does

  1. **Enter name** — rider name displayed on the card
  2. **Capture photo** — webcam capture, converted to a cartoon portrait via OpenAI API
  3. **Fetch 4DP profile** — pulls FTP, MAP, AC, and NM from the Wahoo API
  4. **Generate card** — composites portrait, snail chart, and stats into a downloadable trading card

  ## Stack

  - Next.js 14 + TypeScript
  - Tailwind CSS
  - html-to-image (card export)
  - OpenAI API (cartoon generation)
  - Wahoo Cloud API (4DP fitness profile)

  ## Setup

  bash
  npm install
  cp .env.local.example .env.local  # fill in API keys
  npm run dev

  Environment variables

  OPENAI_API_KEY=
  WAHOO_DEMO_EMAIL=
  WAHOO_DEMO_PASSWORD=

  Modes

  - Demo mode — uses a shared Wahoo account (outsidesales@wahoofitness.com) for booth use
  - Personal mode — attendee enters their own Wahoo credentials
