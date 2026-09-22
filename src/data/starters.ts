export interface StarterCategory {
  id: string;
  nameDe: string;
  nameEn: string;
  emoji: string;
  color: string;
  startersDe: string[];
  startersEn: string[];
}

export const STARTER_CATEGORIES: StarterCategory[] = [
  {
    id: 'general',
    nameDe: 'Tages- & Satz-Starter',
    nameEn: 'Daily Starters',
    emoji: '⭐',
    color: 'emerald',
    startersDe: [
      'Heute habe ich...',
      'Mein Freund...',
      'Ich glaube, dass...',
      'Am Wochenende möchte ich...',
      'In der Schule haben wir...',
      'Besonders gerne mag ich...',
    ],
    startersEn: [
      'Today I...',
      'My friend...',
      'I think that...',
      'On the weekend I want to...',
      'At school we...',
      'I especially like...',
    ],
  },
  {
    id: 'emotions',
    nameDe: 'Gefühle & Emotionen',
    nameEn: 'Feelings & Emotions',
    emoji: '💛',
    color: 'amber',
    startersDe: [
      'Ich war total stolz, als...',
      'Ich fühlte mich aufgeregt, weil...',
      'Ich war etwas überrascht über...',
      'Ich war ein bisschen enttäuscht, dass...',
      'Ich fühlte mich super glücklich, als...',
      'Ich war etwas nervös vor...',
    ],
    startersEn: [
      'I felt really proud when...',
      'I was so excited because...',
      'I was surprised about...',
      'I was a little disappointed that...',
      'I felt super happy when...',
      'I was nervous before...',
    ],
  },
  {
    id: 'ask_avatar',
    nameDe: 'Den Avatar fragen (Initiative)',
    nameEn: 'Ask the Avatar (Initiation)',
    emoji: '🎤',
    color: 'purple',
    startersDe: [
      'Darf ich dich etwas fragen?',
      'Was machst du am liebsten, wenn...?',
      'Kann ich dir etwas erzählen über...?',
      'Was ist dein absolutes Lieblingsthema?',
      'Darf ich bei dir mitspielen?',
      'Wie würdest du das machen?',
    ],
    startersEn: [
      'Can I ask you something?',
      'What do you like doing most when...?',
      'Can I tell you something about...?',
      'What is your absolute favorite topic?',
      'Can I play together with you?',
      'How would you do that?',
    ],
  },
  {
    id: 'storytelling',
    nameDe: 'Geschichten nacherzählen',
    nameEn: 'Story Retelling',
    emoji: '📖',
    color: 'indigo',
    startersDe: [
      'Zuerst ist folgendes passiert:...',
      'Danach haben die Figuren...',
      'Plötzlich gab es ein Problem:...',
      'Am Ende ging die Geschichte so aus:...',
      'Am besten an der Geschichte fand ich...',
    ],
    startersEn: [
      'First, the following happened:...',
      'Next, the characters...',
      'Suddenly, there was a challenge:...',
      'In the end, it turned out that:...',
      'My favorite part of the story was...',
    ],
  },
  {
    id: 'explaining',
    nameDe: 'Erklären & Beibringen',
    nameEn: 'Explaining & Teaching',
    emoji: '🧠',
    color: 'sky',
    startersDe: [
      'Das funktioniert ganz einfach so:...',
      'Die wichtigste Regel dabei ist...',
      'Man braucht dafür unbedingt...',
      'Mein bester Trick dabei ist...',
      'Man muss darauf achten, dass...',
    ],
    startersEn: [
      'It works simply like this:...',
      'The most important rule is...',
      'What you definitely need is...',
      'My best trick for this is...',
      'You have to make sure that...',
    ],
  },
];
