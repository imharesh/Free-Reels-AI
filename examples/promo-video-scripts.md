# Free Reels AI: Video Scripts

Two Shorts (about 45-60 seconds each) made with Free Reels AI itself.

- **Video 1:** How to set up the app (tutorial)
- **Video 2:** Product ad

Each script has a **Topic** line and a **Creative direction** block. Paste the topic into
"Start with a topic", open **Advanced**, and paste the direction into "Creative direction".
CLI: save the direction as a `.md` file and run `pnpm start "<topic>" --direction <file>`.

> Free Reels AI generates its own visuals and cannot take uploaded screenshots.
> The **[SCREENSHOT]** tags below mark where your real screen shots go. Overlay them in
> your video editor on top of the rendered MP4, matched to the scene timings.

---

## Video 1: Set up Free Reels AI in 5 steps

**Topic:** `How to set up Free Reels AI on your computer in 5 steps`

**Settings:** platform YouTube, pacing Fast, archetype `bold_illustration`, voice Kokoro (free), music Bundled.

### Creative direction (paste this)

```
# Creative Brief: Free Reels AI setup tutorial

## Visual Style
Clean, modern tech tutorial. Dark UI feel with violet and fuchsia accents.
Prefer text_card scenes for commands and step numbers. Use stock footage only for
the hook and the closing beat (laptop, typing, code on screen).

## Tone
Friendly, fast, beginner-safe. Confident, no jargon.

## Script Notes
- Hook states the payoff: "Turn any idea into a finished Short in one command."
- One short sentence per scene, 8-12 words.
- Number each step on screen: Step 1, Step 2 and so on.
- End with a clear action, not a question.

## Music
Light, upbeat, minimal electronic. Low volume under the voiceover.
```

### Scene-by-scene script

| # | Time | Narration (voiceover) | On-screen text | Visual | Your screenshot |
|---|------|-----------------------|----------------|--------|-----------------|
| 1 | 0-5s | "Turn any idea into a finished Short. Here's how to set it up in five steps." | **Free Reels AI** / Setup in 5 steps | Stock: laptop, typing | [SCREENSHOT 1] Home page, the "What story should we tell?" screen |
| 2 | 5-12s | "Step one. Install Docker Desktop, or Node 22 with pnpm." | Step 1: Install Docker | text_card | [SCREENSHOT 2] Docker Desktop running |
| 3 | 12-20s | "Step two. Clone the repo from GitHub." | `git clone https://github.com/imharesh/FreeReelAI.git` | text_card, code style | [SCREENSHOT 3] Terminal after the clone |
| 4 | 20-28s | "Step three. Copy the example env file and add your API keys." | `cp .env.example .env` | text_card | [SCREENSHOT 4] `.env` open in the editor (blur the keys) |
| 5 | 28-36s | "Step four. Run docker compose up. It starts Redis, the API and the worker." | `docker compose up` | text_card | [SCREENSHOT 5] Terminal with the containers running |
| 6 | 36-44s | "Step five. Open localhost 3000 and type your topic." | `http://localhost:3000` | text_card | [SCREENSHOT 6] Browser with the topic typed in the box |
| 7 | 44-52s | "Pick a visual style, hit Generate, and watch every stage run live." | Pick style, Generate | Stock or text_card | [SCREENSHOT 7] Style pills, [SCREENSHOT 8] Pipeline page running |
| 8 | 52-60s | "Download your video. Free to run, open source. Link in the description." | Download. Share. Repeat. | Stock: phone, scrolling | [SCREENSHOT 9] Finished video and Gallery |

### Screenshots to give me

1. Home page (hero and topic box)
2. Docker Desktop running
3. Terminal with the `git clone`
4. `.env` file (hide the keys)
5. Terminal after `docker compose up`
6. Browser at `localhost:3000` with a topic typed
7. Visual style pills
8. Pipeline page mid-run
9. Finished video page and Gallery

### Free local setup (optional bonus scene)

Add after step 4 if you want to show the free route: "No budget? Run Ollama for the script, Kokoro for the voice, and bundled music. No API keys needed for text and voice." The screenshot for this is **Advanced**, with the Custom (OpenAI-compatible) provider selected.

---

## Video 2: Product ad (30-45 seconds)

**Topic:** `Free Reels AI, the open-source studio that turns an idea into a ready-to-post Short`

**Settings:** platform TikTok or Instagram, pacing Fast, archetype `bold_illustration` or `warm_editorial`, music Bundled.

### Creative direction (paste this)

```
# Creative Brief: Free Reels AI product ad

## Visual Style
Fast, punchy, social-first. Bold type, strong contrast, violet to fuchsia gradients.
Mix text_card hooks with energetic stock footage of creators filming, editing
and posting.

## Tone
Confident and a little cheeky. Speak to creators who are tired of editing.

## Script Notes
- Hook in 2 seconds: a pain point, not a feature.
- Use "you". Short punchy lines, 6-10 words.
- Show the 4 steps: Script, Voice, Visuals, Render.
- Finish with a clear call to action.

## Music
Upbeat, modern, driving. Builds to the call to action.
```

### Scene-by-scene script

| # | Time | Narration | On-screen text | Visual | Your screenshot |
|---|------|-----------|----------------|--------|-----------------|
| 1 | 0-3s | "Still spending hours editing one Short?" | Hours. For one Short. | Stock: stressed editor | none |
| 2 | 3-8s | "Type an idea. That's it." | One idea. | text_card | [SCREENSHOT 1] Home topic box with a topic typed |
| 3 | 8-14s | "Free Reels AI writes the script for you." | 01 Script | text_card | [SCREENSHOT 2] Pipeline: script stage |
| 4 | 14-20s | "Adds a natural voiceover." | 02 Voice | text_card | [SCREENSHOT 3] Pipeline: voice stage |
| 5 | 20-27s | "Picks visuals in the style you choose." | 03 Visuals | text_card | [SCREENSHOT 4] Visual style pills / storyboard |
| 6 | 27-33s | "Then renders a captioned, vertical video." | 04 Render | Stock: phone vertical video | [SCREENSHOT 5] Finished video page |
| 7 | 33-39s | "Open source. Runs on your machine. Free to start." | Open source. Free to start. | text_card | [SCREENSHOT 6] Gallery |
| 8 | 39-45s | "Grab it on GitHub. Make your first Short today." | github.com/imharesh/FreeReelAI | text_card with URL | none |

### Screenshots to give me

1. Home page with a topic typed in
2. Pipeline page at the script stage
3. Pipeline page at the voice stage
4. Visual style pills or the storyboard
5. Finished video page
6. Gallery with several videos

---

## Tips

- **Match your claims to the app.** "Free" holds for local script, voice and music. AI images and video use hosted providers and may cost money. The cost estimate shows before you confirm.
- **Hook first.** The first 2 seconds decide whether anyone keeps watching. The ad's first line is the pain point.
- **Captions on.** The pipeline renders captions automatically, so the video works with sound off.
