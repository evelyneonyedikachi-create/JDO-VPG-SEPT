import { PictureScene } from '../types';
import marsImg from '../assets/images/mars_station_scene_1787648156398.jpg';
import treehouseImg from '../assets/images/treehouse_adventure_1787648171427.jpg';
import stadiumImg from '../assets/images/stadium_bg_1787571076279.jpg';
import playgroundImg from '../assets/images/playground_bg_1787570993565.jpg';
import libraryImg from '../assets/images/library_bg_1787571089499.jpg';

export const PICTURE_SCENES: PictureScene[] = [
  {
    id: 'mars_station',
    titleDe: 'Die geheime Mars-Forschungsstation 🚀',
    titleEn: 'The Secret Mars Research Station 🚀',
    imageUrl: marsImg,
    descriptionDe: 'Eine leuchtende Kuppel-Station auf dem roten Planeten Mars mit Robotern und Sternenhimmel.',
    descriptionEn: 'A glowing research dome on the red planet Mars with friendly robots and starry cosmos.',
    starterQuestionsDe: [
      'Was siehst du auf diesem Bild ganz vorne?',
      'Was für eine Aufgabe hat der kleine Roboter wohl gerade?',
      'Was könnte drinnen in der leuchtenden Kuppel passieren?',
      'Wenn du dort landen würdest: Was würdest du als Erstes erforschen?',
    ],
    starterQuestionsEn: [
      'What do you notice first in this picture?',
      'What mission might the explorer robot have?',
      'What could be happening inside the glowing biodome?',
      'If you landed here, what would you explore first?',
    ],
  },
  {
    id: 'treehouse_adventure',
    titleDe: 'Das magische Baumhaus im Zauberwald 🌳',
    titleEn: 'The Magic Treehouse in the Enchanted Woods 🌳',
    imageUrl: treehouseImg,
    descriptionDe: 'Ein riesiges Holz-Baumhaus mit Hängebrücken, bunten Laternen und einer geheimen Schatztruhe.',
    descriptionEn: 'A giant wooden treehouse with suspension bridges, colorful lanterns, and secret treasures.',
    starterQuestionsDe: [
      'Welches Detail am Baumhaus gefällt dir am besten?',
      'Wer wohnt deiner Meinung nach ganz oben in dem Baumhaus?',
      'Was verbirgt sich wohl in der geheimen Kammer?',
      'Erfinde eine kurze Geschichte: Wie bist du über die Hängebrücke geklettert?',
    ],
    starterQuestionsEn: [
      'Which treehouse feature do you like best?',
      'Who do you think lives at the very top?',
      'What secret could be hidden inside?',
      'Make up a mini adventure: How did you cross the rope bridge?',
    ],
  },
  {
    id: 'stadium_match',
    titleDe: 'Das große Finale im Flutlicht-Stadion ⚽',
    titleEn: 'The Big Championship Under the Lights ⚽',
    imageUrl: stadiumImg,
    descriptionDe: 'Ein gewaltiges Stadion mit jubelnden Fans, grünem Rasen und der 90. Spielminute.',
    descriptionEn: 'A roaring stadium packed with fans, bright turf and the 90th minute penalty showdown.',
    starterQuestionsDe: [
      'Beschreibe die Stimmung im Stadion: Was hörst und siehst du?',
      'Stell dir vor, du stehst am Elfmeterpunkt in der 90. Minute: Was machst du?',
      'Wer jubelt wohl auf den Tribünen mit dir?',
      'Wie endet dieses packende Spiel?',
    ],
    starterQuestionsEn: [
      'Describe the atmosphere in the stadium: what do you see and hear?',
      'Imagine you are taking the penalty in the 90th minute: what do you do?',
      'Who is cheering with you in the stands?',
      'How does this epic championship match conclude?',
    ],
  },
  {
    id: 'playground_action',
    titleDe: 'Der bunte Abenteuer-Pausenhof ☀️',
    titleEn: 'The Colorful Adventure Playground ☀️',
    imageUrl: playgroundImg,
    descriptionDe: 'Ein sonniger Spielplatz mit Klettergerüsten, Schaukeln und lachenden Freunden.',
    descriptionEn: 'A sunny playground with climbing gyms, swings, and laughing friends.',
    starterQuestionsDe: [
      'Was machen die Kinder auf dem Spielplatz gerade?',
      'Welches Spiel würdest du hier mit deinen Freunden spielen?',
      'Was passiert, wenn jemand den Ball über den Zaun schießt?',
    ],
    starterQuestionsEn: [
      'What are the kids doing on the playground?',
      'Which game would you play here with your friends?',
      'What happens if someone kicks the ball over the fence?',
    ],
  },
  {
    id: 'library_chamber',
    titleDe: 'Die geheimnisvolle Schatzkammer der Bücher 📚',
    titleEn: 'The Mysterious Treasure Chamber of Books 📚',
    imageUrl: libraryImg,
    descriptionDe: 'Eine gemütliche Bücherei mit hohen Regalen, alten Weltkarten und leuchtenden Büchern.',
    descriptionEn: 'A cozy library with tall wooden shelves, glowing books and ancient maps.',
    starterQuestionsDe: [
      'Welches Buch würdest du aus dem obersten Regal ziehen?',
      'Was passiert, wenn man das leuchtende Buch öffnet?',
      'Wohin führt wohl die geheime Tür hinter dem Bücherregal?',
    ],
    starterQuestionsEn: [
      'Which book would you pull from the top shelf?',
      'What happens when you open the glowing book?',
      'Where does the hidden door behind the bookshelf lead?',
    ],
  },
];
