import { start, art, move } from './basics.js';
import { web, dom } from './web.js';
import { game } from './games.js';
import { snake, project } from './snake.js';
export const modules = [
  {
    id: 'start',
    title: 'Kom i gang med kode',
    subtitle: 'Gje ein robot farge, namn og energi.',
    label: 'DIN FØRSTE KODE',
    art: 'robot',
    color: 'blue',
  },
  {
    id: 'art',
    title: 'Pikselkunst og mønster',
    subtitle: 'Frå éi rute til noko heilt ditt.',
    label: 'TEIKN MED KODE',
    art: 'pixel',
    color: 'lime',
  },
  {
    id: 'move',
    title: 'Animasjon og styring',
    subtitle: 'Set ideane i rørsle. Du har kontrollen.',
    label: 'FÅ DET TIL Å LEVE',
    art: 'motion',
    color: 'peach',
  },
  {
    id: 'web',
    title: 'Bygg di eiga nettside',
    subtitle: 'Lag ei festivalside med din eigen stil.',
    label: 'DIN PLASS PÅ NETTET',
    art: 'website',
    color: 'peach',
  },
  {
    id: 'dom',
    title: 'Gjer nettsida levande',
    subtitle: 'Knappar, temabyte og ein liten quiz.',
    label: 'TRYKK. SJÅ. ENDRE.',
    art: 'switch',
    color: 'blue',
  },
  {
    id: 'game',
    title: 'Små spel og eksperiment',
    subtitle: 'Finn reglane som gjer eit spel morosamt.',
    label: 'PRØV EIN IDÉ',
    art: 'target',
    color: 'lime',
  },
  {
    id: 'snake',
    title: 'Bygg Snake',
    subtitle: 'Frå den første ruta til eit heilt spel.',
    label: 'DITT EIGE ARKADESPEL',
    art: 'snake',
    color: 'lime',
  },
  {
    id: 'project',
    title: 'Mitt eige prosjekt',
    subtitle: 'Vel ein idé. Lag noko berre du kan lage.',
    label: 'NO ER DET DIN TUR',
    art: 'spark',
    color: 'blue',
  },
];
export const lessons = [...start, ...art, ...move, ...web, ...dom, ...game, ...snake, ...project];
export const lessonById = (id) => lessons.find((l) => l.id === id);
