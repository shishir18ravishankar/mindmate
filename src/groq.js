const SEED_PROFILES = [
  {
    name: 'Aryan Mehta',
    studying: 'Computer Science, 2nd year',
    freeTime: 'Hitting the gym and playing chess online — I love the strategy in both.',
    building: 'A chess engine with an opening book trained on grandmaster games',
    lookingFor: 'Someone who loves building things and can geek out about algorithms or strategy',
    funFact: "I can solve a Rubik's cube in under a minute while explaining the algorithm",
    tags: ['CS', 'gym', 'chess', 'builder', 'algorithms'],
  },
  {
    name: 'Priya Nair',
    studying: 'Design, 1st year',
    freeTime: 'Sketching UI concepts and going for early morning runs to clear my head.',
    building: 'A design system for student apps that actually looks good on phones',
    lookingFor: "Someone curious about the intersection of tech and beauty, or anyone who appreciates good typography",
    funFact: "I redesigned my college's app wireframe just for fun — professors asked to use it",
    tags: ['UI/UX', 'design', 'running', 'art', 'mobile'],
  },
  {
    name: 'Rohan Das',
    studying: 'Mechanical Engineering, 2nd year',
    freeTime: 'Jamming on guitar and binge-watching anime — currently obsessed with Frieren.',
    building: 'A small autonomous robot for our college robotics club showcase',
    lookingFor: "Someone who won't judge my anime addiction and maybe has a creative side",
    funFact: 'I wrote and recorded a lo-fi track that accidentally blew up on SoundCloud',
    tags: ['robotics', 'guitar', 'anime', 'mechanical', 'music'],
  },
  {
    name: 'Meera Iyer',
    studying: 'Data Science, 1st year',
    freeTime: 'Doing yoga every morning and losing myself in books — sci-fi mostly.',
    building: 'An ML model to predict student burnout from study patterns',
    lookingFor: 'Someone thoughtful who cares about using tech for actual good, not just hype',
    funFact: 'I read 52 books last year, one per week, including 3 textbooks voluntarily',
    tags: ['AI/ML', 'yoga', 'reading', 'data', 'sci-fi'],
  },
  {
    name: 'Karan Singh',
    studying: 'Electronics Engineering, 3rd year',
    freeTime: 'Photography walks around campus and running 5ks at sunrise.',
    building: 'An IoT greenhouse system that texts you when your plants need water',
    lookingFor: "Someone with a maker mindset who appreciates the physical world, not just software",
    funFact: 'I once built a working FM radio transmitter from scratch in my dorm room',
    tags: ['IoT', 'photography', 'running', 'electronics', 'maker'],
  },
  {
    name: 'Ananya Reddy',
    studying: 'Psychology, 2nd year',
    freeTime: 'Writing short fiction and exploring mental health apps to see what actually helps.',
    building: 'A journaling app with gentle AI prompts for students going through stress',
    lookingFor: "Someone emotionally intelligent who thinks deeply and isn't afraid of real conversations",
    funFact: 'My short story was published in a literary magazine — under a pseudonym',
    tags: ['psychology', 'writing', 'mental health', 'empathy', 'storytelling'],
  },
  {
    name: 'Dev Sharma',
    studying: 'Computer Science, 1st year',
    freeTime: "Vibe coding with AI tools and being that annoying morning person who's chirpy at 7am.",
    building: 'A browser extension that turns any YouTube video into a concise study note',
    lookingFor: 'Someone who ships things fast, loves learning in public, and maybe wants to co-found something small',
    funFact: 'I shipped my first paid product at 17 — it made exactly ₹847 before I forgot about it',
    tags: ['AI tools', 'morning person', 'builder', 'CS', 'startup mindset'],
  },
  {
    name: 'Tara Pillai',
    studying: 'Biotechnology, 2nd year',
    freeTime: 'Painting watercolors and doing macro photography of plants and fungi.',
    building: 'A platform to help patients understand their lab reports using plain language AI',
    lookingFor: 'Someone at the intersection of science and art, who thinks healthcare could be more human',
    funFact: 'I found a previously undocumented fungal species during a college trek and submitted it to iNaturalist',
    tags: ['biotech', 'health tech', 'photography', 'painting', 'science'],
  },
]

function formatCandidate(p, index) {
  const lines = [
    `Profile ${index + 1}: ${p.name} (${p.studying})`,
    `- Free time: ${p.freeTime}`,
    `- Building: ${p.building || 'Not specified'}`,
    `- Looking for: ${p.lookingFor}`,
    `- Fun fact: ${p.funFact}`,
  ]
  if (p.tags?.length) lines.push(`- Tags: ${p.tags.join(', ')}`)
  return lines.join('\n')
}

function buildPrompt(userProfile, candidates) {
  const candidatesText = candidates.map(formatCandidate).join('\n\n')

  return `You are a campus friend-matching AI. A student has filled out their profile. Pick the 3 best matches from the candidate profiles below and explain specifically WHY they would click — referencing concrete details from both profiles.

USER PROFILE:
Name: ${userProfile.name}
Studying: ${userProfile.studying}
Free time: ${userProfile.freeTime}
Currently building: ${userProfile.building || 'Not specified'}
Looking for: ${userProfile.lookingFor}
Fun fact: ${userProfile.funFact}

CANDIDATE PROFILES:
${candidatesText}

Return ONLY a valid JSON array with exactly 3 objects. Each object must have:
- "name": string (exact name from candidate profiles)
- "course": string (exact studying/course from candidate profiles)
- "tags": array of 3-5 strings (most relevant interests/traits)
- "why": string (2-3 sentences explaining specifically why this match works, referencing details from BOTH profiles)

Return only the JSON array, no other text.`
}

// realProfiles: normalized profiles from Supabase (may be empty or partial)
export async function findMatches(userProfile, realProfiles = []) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY
  if (!apiKey) throw new Error('VITE_GROQ_API_KEY is not set in your .env file')

  // Fill up to 8 candidates: real users first, then seeds (by name dedup)
  const realNames = new Set(realProfiles.map(p => p.name))
  const filteredSeeds = SEED_PROFILES.filter(s => !realNames.has(s.name))
  const candidates = [...realProfiles, ...filteredSeeds].slice(0, 8)

  if (candidates.length === 0) throw new Error('No candidate profiles found')

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: buildPrompt(userProfile, candidates) }],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Groq API error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content?.trim()
  if (!content) throw new Error('Empty response from Groq')

  const jsonMatch = content.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('Could not parse matches from AI response')

  const matches = JSON.parse(jsonMatch[0])
  if (!Array.isArray(matches) || matches.length === 0) throw new Error('Invalid matches format from AI')

  return matches.slice(0, 3)
}
