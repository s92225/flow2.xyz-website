import {qualityPreference} from './resolution.js';
export const qualityControls=[document.getElementById('arrival-quality'),document.getElementById('resolution')];
export const quality=qualityPreference(qualityControls);
