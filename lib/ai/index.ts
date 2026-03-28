export { eventTracker } from "./eventTracker";
export { buildInitialPreferences, updatePreferences, loadPreferences, savePreferences } from "./preferenceModel";
export { scoreWaves } from "./recommendationEngine";
export { computeCollaborativeScores } from "./collaborativeFilter";
export { applyExploration } from "./banditExplorer";
export { personalizeNotification } from "./notificationPersonalizer";
export { generateInsights } from "./insightGenerator";
export { AI } from "./constants";
export type { UserPreferenceVector, WaveScore, AIEvent, ScoringContext, WaveInteractionAggregate } from "./types";
