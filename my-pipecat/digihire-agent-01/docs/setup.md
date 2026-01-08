install vu (rust based package manager for python)


uv python list
- need python min 3.12.3
uv init my-pipecat --python 3.12.12
- check python version
uv run python --version
- install library
uv add pipecatcloud

Quick start (two options bootstrap or git clone)

### Option A Bootstrap
- install cli
uv tool install pipecat-ai-cli
- bootstrap the project
pipecat init

configures everything and gives a set of projects

```text


  • Go to your project: cd digihire-agent-01

  Client setup:
  • Go to client: In a separate terminal window or tab cd client
  • Install dependencies: npm install
  • Run dev server: npm run dev

  Server setup:
  • Go to server: cd server
  • Install dependencies: uv sync
  • Create .env file: cp .env.example .env
  • Edit .env and add your API keys
  • Run your bot:
     • Daily: uv run bot.py --transport daily
     • SmallWebRTC: uv run bot.py


```

SmallWebRTC is good for local testing (as it local only). If this needs to be tested over the internet setup STUN server (works in 80% scenarios), For corporate firewalls you might also need TURN server

AI Agent Components
Ear: Deepgram (Use the $200 free credit).  | surya.v.zetta
Brain: Groq (Use Llama 3.3 70B for free, high-speed responses). | surya.v.zetta
Eye: Gemini 2.0 Flash (Use the free tier for vision/multimodal tasks). | surya.v.zetta
Mouth: Cartesia (Trial) or Deepgram Aura (Credit). | surya.v.zetta

Create a test meeeing and assign in the .env file
After configuring the keys, start with daily transport... you such see a basic pipecat bot in themeeting



