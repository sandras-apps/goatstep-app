// The goal picker (components/GoalPicker.svelte) stores the choice as one text value:
//   ''           → no goal ("Other habits")
//   'goal:<id>'  → one of the user's goals
//   'idea:<key>' → one of the suggested goals, created when the habit is saved
//   'new'        → a new goal with the name typed next to it, created when the habit is saved

import { get } from 'svelte/store';
import { categories, createGoal } from './api/habits.js';
import { GOAL_SUGGESTIONS, DEFAULT_GOAL_ICON, nextGoalColor } from './appearance.js';

export function choiceForGoal(goalId) {
  return goalId ? `goal:${goalId}` : '';
}

// Returns the goal id to save with the habit, creating the goal first if needed.
// `translate` is the $t function, used for the name of a suggested goal.
export async function goalIdForChoice(choice, newName, translate) {
  if (choice.startsWith('goal:')) return choice.slice('goal:'.length);

  if (choice.startsWith('idea:')) {
    const idea = GOAL_SUGGESTIONS.find((option) => option.key === choice.slice('idea:'.length));
    const name = translate(`goalSuggestions.${idea.key}`);
    const existing = get(categories).find((goal) => goal.name === name);
    if (existing) return existing.id;
    return (await createGoal({ name, icon: idea.icon, color: idea.color })).id;
  }

  if (choice === 'new' && newName.trim()) {
    const goal = await createGoal({ name: newName.trim(), icon: DEFAULT_GOAL_ICON, color: nextGoalColor(get(categories)) });
    return goal.id;
  }

  return null;
}
