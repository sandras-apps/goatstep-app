// Icons (goals and habits) and colours (goals only: habits show their goal's colour).
// Icons are simple line icons from Lucide (lucide.dev), drawn in the goal's colour.
// Colours: calm tones, all readable on white (WCAG AA, at least 4.6:1).
// Mint, butter yellow and coral are not here on purpose: they are reserved for
// checks, wins and main buttons (docs/brief.md §5).

// One file per icon, so only these icons are loaded.
import Apple from '@lucide/svelte/icons/apple';
import BedDouble from '@lucide/svelte/icons/bed-double';
import Bike from '@lucide/svelte/icons/bike';
import BookOpen from '@lucide/svelte/icons/book-open';
import Brain from '@lucide/svelte/icons/brain';
import Camera from '@lucide/svelte/icons/camera';
import Clock from '@lucide/svelte/icons/clock';
import Code from '@lucide/svelte/icons/code';
import Coffee from '@lucide/svelte/icons/coffee';
import Dumbbell from '@lucide/svelte/icons/dumbbell';
import Flower2 from '@lucide/svelte/icons/flower-2';
import Footprints from '@lucide/svelte/icons/footprints';
import GlassWater from '@lucide/svelte/icons/glass-water';
import GraduationCap from '@lucide/svelte/icons/graduation-cap';
import Guitar from '@lucide/svelte/icons/guitar';
import Headphones from '@lucide/svelte/icons/headphones';
import Heart from '@lucide/svelte/icons/heart';
import HeartPulse from '@lucide/svelte/icons/heart-pulse';
import House from '@lucide/svelte/icons/house';
import Languages from '@lucide/svelte/icons/languages';
import Leaf from '@lucide/svelte/icons/leaf';
import Lightbulb from '@lucide/svelte/icons/lightbulb';
import Moon from '@lucide/svelte/icons/moon';
import Mountain from '@lucide/svelte/icons/mountain';
import Palette from '@lucide/svelte/icons/palette';
import PenLine from '@lucide/svelte/icons/pen-line';
import Pill from '@lucide/svelte/icons/pill';
import Salad from '@lucide/svelte/icons/salad';
import ShowerHead from '@lucide/svelte/icons/shower-head';
import Sparkles from '@lucide/svelte/icons/sparkles';
import Sprout from '@lucide/svelte/icons/sprout';
import Sun from '@lucide/svelte/icons/sun';
import Target from '@lucide/svelte/icons/target';
import Users from '@lucide/svelte/icons/users';
import Wallet from '@lucide/svelte/icons/wallet';

// The key is what the database stores in the `icon` column.
export const ICONS = {
  target: Target,
  sparkles: Sparkles,
  dumbbell: Dumbbell,
  footprints: Footprints,
  bike: Bike,
  'heart-pulse': HeartPulse,
  mountain: Mountain,
  apple: Apple,
  salad: Salad,
  'glass-water': GlassWater,
  coffee: Coffee,
  pill: Pill,
  moon: Moon,
  'bed-double': BedDouble,
  sun: Sun,
  'shower-head': ShowerHead,
  'book-open': BookOpen,
  'pen-line': PenLine,
  'graduation-cap': GraduationCap,
  languages: Languages,
  lightbulb: Lightbulb,
  brain: Brain,
  code: Code,
  leaf: Leaf,
  'flower-2': Flower2,
  sprout: Sprout,
  heart: Heart,
  headphones: Headphones,
  guitar: Guitar,
  palette: Palette,
  camera: Camera,
  users: Users,
  house: House,
  wallet: Wallet,
  clock: Clock
};

export const DEFAULT_GOAL_ICON = 'target';
export const DEFAULT_HABIT_ICON = 'sparkles';

// The key is the name used for the colour's label in en.json / it.json ("colors.night", …).
export const COLORS = [
  { key: 'night', value: '#2B3A67' },
  { key: 'slate', value: '#56657F' },
  { key: 'ocean', value: '#2F6F8F' },
  { key: 'sage', value: '#4F7A5A' },
  { key: 'plum', value: '#7A4E7E' },
  { key: 'rose', value: '#B04A5E' },
  { key: 'earth', value: '#8A5A2B' },
  { key: 'iris', value: '#5E56A8' }
];

export const DEFAULT_COLOR = COLORS[0].value;

// Habits without a goal ("Other habits") use this calm grey-blue.
export const NEUTRAL_COLOR = '#56657F';

// The colour of a habit = the colour of its goal.
export function habitColor(habit, goals) {
  return goals.find((goal) => goal.id === habit.category_id)?.color ?? NEUTRAL_COLOR;
}

// A colour for a new goal that the user's other goals don't use yet (so goals are easy to tell apart).
export function nextGoalColor(goals) {
  const used = new Set(goals.map((goal) => goal.color));
  return (COLORS.find((color) => !used.has(color.value)) ?? COLORS[goals.length % COLORS.length]).value;
}

// Goals suggested during onboarding (texts in en.json / it.json under "goalSuggestions").
export const GOAL_SUGGESTIONS = [
  { key: 'stronger', icon: 'dumbbell', color: '#2F6F8F' },
  { key: 'sleep', icon: 'moon', color: '#5E56A8' },
  { key: 'read', icon: 'book-open', color: '#8A5A2B' },
  { key: 'calm', icon: 'leaf', color: '#4F7A5A' },
  { key: 'eat', icon: 'salad', color: '#B04A5E' },
  { key: 'learn', icon: 'lightbulb', color: '#7A4E7E' }
];
