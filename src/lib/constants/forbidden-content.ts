import type { Audience } from '@/types/domain';

export const FORBIDDEN_BY_AUDIENCE: Record<Audience, string[]> = {
  toddler: [
    'scary', 'monster', 'weapon', 'gun', 'sword', 'knife', 'fight', 'attack',
    'blood', 'violence', 'war', 'battle', 'kill', 'dead', 'death',
    'ghost', 'zombie', 'skeleton', 'skull', 'demon', 'devil', 'witch',
    'vampire', 'werewolf', 'spider', 'snake', 'shark',
    'fire', 'explosion', 'danger', 'falling', 'drowning',
    'crying', 'sad', 'angry', 'screaming', 'nightmare', 'terrified',
    'adult', 'sexy', 'naked', 'beer', 'wine', 'cigarette'
  ],
  children: [
    'scary monster', 'realistic weapon', 'blood', 'gore', 'death scene',
    'violence', 'fighting', 'war', 'battle', 'killing',
    'horror', 'zombie', 'demon', 'devil', 'evil spirit',
    'frightening', 'terrifying', 'nightmare',
    'adult content', 'romance', 'kissing', 'sexy',
    'drug', 'alcohol', 'smoking', 'gambling'
  ],
  tween: [
    'graphic violence', 'gore', 'blood', 'death',
    'adult content', 'sexual', 'suggestive',
    'drug use', 'alcohol', 'smoking',
    'self-harm', 'suicide', 'eating disorder'
  ],
  teen: [
    'explicit violence', 'gore', 'torture',
    'sexual content', 'nudity', 'pornographic',
    'drug use', 'drug paraphernalia',
    'self-harm', 'suicide methods',
    'hate symbols', 'extremist content'
  ],
  adult: [
    'explicit sexual content', 'pornography',
    'child exploitation', 'CSAM',
    'hate symbols', 'extremist propaganda',
    'real violence', 'torture',
    'illegal content', 'drug manufacturing'
  ]
};

export const SAFE_SUGGESTIONS: Record<Audience, string[]> = {
  toddler: [
    'Try: "cute farm animals playing"',
    'Try: "happy vehicles in a town"',
    'Try: "friendly dinosaur with flowers"'
  ],
  children: [
    'Try: "brave knight saving a friendly dragon"',
    'Try: "underwater mermaid palace"',
    'Try: "space adventure with rockets"'
  ],
  tween: [
    'Try: "fantasy castle with mythical creatures"',
    'Try: "sports action scene"',
    'Try: "ocean wildlife adventure"'
  ],
  teen: [
    'Try: "anime-style character portrait"',
    'Try: "geometric abstract patterns"',
    'Try: "gothic architecture scene"'
  ],
  adult: [
    'Try: "intricate mandala pattern"',
    'Try: "botanical garden illustration"',
    'Try: "art nouveau decorative design"'
  ]
};
