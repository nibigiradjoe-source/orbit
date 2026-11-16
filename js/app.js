/* Orbit — Joe's personal learning school. Vanilla JS, no build step. */
(() => {
'use strict';

/* ---------------------------------------------------------------- plan */
const PLAN_START = '2026-11-16';
const BREAKS = [['2026-12-21', '2027-01-03'], ['2027-12-20', '2028-01-02']];
const ROLL_LIMIT = '2029-12-31';
const T = (en, fr) => ({ en, fr });

const PHASES = {
  1: T('Foundations', 'Fondations'), 2: T('Python and data', 'Python et données'), 3: T('Money and deals', 'Argent et négociation'),
  4: T('Databases and machine learning', 'Bases de données et machine learning'), 5: T('Building with AI', 'Construire avec l’IA'),
  6: T('Build and get paid', 'Construire et être payé'), 7: T('Grow the business', 'Faire grandir l’entreprise'),
  8: T('Agents and the client capstone', 'Agents et capstone client'), 9: T('Capital and leadership', 'Capital et leadership'),
  10: T('Positioning', 'Positionnement')
};

// hours = planned main-course hours (listed + 25%). Project steps convert weeks × 10.75 h.
const STEPS = [
  { n: '01', id: 'pm101', ph: 1, h: 170, p: 'Coursera', t: T('Google Project Management, courses 1–6', 'Gestion de projet Google, cours 1–6'),
    parts: [[T('Course 1 · Foundations', 'Cours 1 · Fondations'), 13], [T('Course 2 · Initiation', 'Cours 2 · Lancement'), 15], [T('Course 3 · Planning', 'Cours 3 · Planification'), 23],
      [T('Course 4 · Execution', 'Cours 4 · Exécution'), 25], [T('Course 5 · Agile', 'Cours 5 · Agile'), 20], [T('Course 6 · Capstone', 'Cours 6 · Capstone'), 40]] },
  { n: '02', id: 'capm', ph: 1, h: 37.5, p: 'PMI', t: T('CAPM prep and exam', 'Préparation et examen CAPM') },
  { n: '03', id: 'py101', ph: 2, h: 99, p: 'Coursera', t: T('Python for Everybody', 'Python for Everybody'),
    parts: [[T('Getting Started with Python', 'Débuter avec Python'), 17], [T('Python Data Structures', 'Structures de données'), 20], [T('Using Python to Access Web Data', 'Données web avec Python'), 19], [T('Using Databases with Python', 'Bases de données avec Python'), 14], [T('Capstone', 'Capstone'), 9]] },
  { n: '04', id: 'data101', ph: 2, h: 10, p: 'Kaggle', t: T('Pandas and Data Cleaning', 'Pandas et nettoyage de données') },
  { n: '05', id: 'fin101', ph: 3, h: 25, p: 'Coursera', t: T('Introduction to Financial Accounting', 'Introduction à la comptabilité financière') },
  { n: '06', id: 'neg101', ph: 3, h: 17.5, p: 'Coursera', t: T('Successful Negotiation', 'Négociation réussie') },
  { n: '07', id: 'sql101', ph: 4, h: 20, p: 'Coursera', t: T('SQL for Data Science', 'SQL pour la data science') },
  { n: '08', id: 'ml101', ph: 4, h: 119, p: 'Coursera', t: T('Machine Learning Specialization', 'Spécialisation Machine Learning'),
    parts: [[T('Supervised learning', 'Apprentissage supervisé'), 33], [T('Advanced learning algorithms', 'Algorithmes avancés'), 34], [T('Unsupervised, recommenders, RL', 'Non supervisé, recommandation, RL'), 28]] },
  { n: '09', id: 'llm201', ph: 5, h: 25, p: 'Coursera', t: T('Generative AI with LLMs', 'IA générative avec les LLM') },
  { n: '10', id: 'rag201', ph: 5, h: 37.5, p: 'Coursera', t: T('Retrieval Augmented Generation', 'Retrieval Augmented Generation (RAG)') },
  { n: '11', id: 'dl201', ph: 5, h: 62.5, p: 'fast.ai', opt: true, t: T('Practical Deep Learning, Part 1 (optional)', 'Practical Deep Learning, partie 1 (optionnel)') },
  { n: '12', id: 'studio1', ph: 6, h: 129, p: T('Project', 'Projet'), proj: true, t: T('Build & convert: first paid AI client', 'Construire et convertir : premier client IA payant') },
  { n: '13', id: 'mkt101', ph: 7, h: 55, p: 'Coursera', t: T('Google Digital Marketing, 3 courses', 'Marketing digital Google, 3 cours') },
  { n: '14', id: 'fin102', ph: 7, h: 11, p: 'Coursera', t: T('Introduction to Corporate Finance', 'Introduction à la finance d’entreprise') },
  { n: '15', id: 'fin201', ph: 7, h: 65, p: 'Coursera', t: T('Business & Financial Modeling', 'Modélisation financière') },
  { n: '16', id: 'agent301', ph: 8, h: 24, p: 'DeepLearning.AI', t: T('Agentic AI + ML in Production', 'IA agentique + ML en production') },
  { n: '17', id: 'studio2', ph: 8, h: 64.5, p: T('Project', 'Projet'), proj: true, t: T('Capstone I: paid production AI system', 'Capstone I : système IA payé en production') },
  { n: '18', id: 'vc101', ph: 9, h: 11, p: 'Coursera', t: T('Private Equity and Venture Capital', 'Private equity et capital-risque') },
  { n: '19', id: 'lead101', ph: 9, h: 35, p: 'Coursera', t: T('Leading Teams, 2 courses', 'Diriger des équipes, 2 cours') },
  { n: '20', id: 'visibility', ph: 10, fixed: ['2028-09-06', '2028-09-30'], proj: true, t: T('Visibility: 12 pieces published', 'Visibilité : 12 contenus publiés') },
  { n: '21', id: 'opportunity', ph: 10, fixed: ['2028-10-01', '2028-10-31'], proj: true, t: T('Opportunity: 5 applications', 'Opportunités : 5 candidatures') },
  { n: '22', id: 'capstone2', ph: 10, fixed: ['2028-11-01', '2028-11-30'], proj: true, t: T('Capstone II: flagship project', 'Capstone II : projet phare') },
  { n: '23', id: 'consolidate', ph: 10, fixed: ['2028-12-01', '2028-12-31'], proj: true, t: T('Consolidate: two-year review', 'Consolider : bilan de deux ans') }
];

const EVENING = [
  { id: 'lhtl', s: '2026-11-16', e: '2027-01-17', t: T('Learning How to Learn', 'Apprendre comment apprendre'), url: 'https://www.coursera.org/learn/learning-how-to-learn' },
  { id: 'agent101', s: '2026-11-16', e: '2027-03-28', t: T('AI agents track · A1–A8', 'Parcours agents IA · A1–A8'), course: 'agent101' },
  { id: 'wellbeing', s: '2027-03-29', e: '2027-05-02', t: T('The Science of Well-Being', 'La science du bien-être'), url: 'https://www.coursera.org/learn/the-science-of-well-being' },
  { id: 'stat101', s: '2027-05-03', e: '2027-07-04', t: T('Probability & statistics', 'Probabilités et statistiques'), course: 'stat101' },
  { id: 'dev101', s: '2027-07-05', e: '2027-08-01', t: T('Git & GitHub + APIs', 'Git et GitHub + API'), course: 'dev101' },
  { id: 'agentlab', s: '2027-08-09', e: '2027-09-26', t: T('AI agents lab · A9', 'Atelier agents IA · A9'), course: 'agent101' },
  { id: 'web101', s: '2027-09-27', e: '2027-12-05', t: T('Web basics: HTML, CSS, JavaScript', 'Bases du web : HTML, CSS, JavaScript'), course: 'web101' }
];

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DEFAULT_SLOTS = {
  mon: [{ k: 'main', t: '16:15', m: 75 }, { k: 'eve', t: '19:30', m: 60 }],
  tue: [{ k: 'main', t: '13:00', m: 120 }],
  wed: [{ k: 'main', t: '15:00', m: 90 }, { k: 'eve', t: '21:00', m: 60 }],
  thu: [{ k: 'main', t: '13:00', m: 150 }, { k: 'eve', t: '19:30', m: 60 }],
  fri: [{ k: 'main', t: '13:00', m: 120 }],
  sat: [],
  sun: [{ k: 'main', t: '14:30', m: 90 }]
};
const REVIEW_STEPS = [1, 3, 7, 21, 60];
const IN_CLAUDE = !!(window.claude && typeof window.claude.use === 'function');
const REDUCED = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)').matches : false;
const PASS = 0.8;

/* ---------------------------------------------------------------- strings */
const S = {
  en: {
    tab_today: 'Today', tab_roadmap: 'Roadmap', tab_courses: 'Courses', tab_review: 'Review', tab_progress: 'Progress',
    synced: 'Synced', saving: 'Saving…', local: 'This device only', waiting: 'Connecting…', offline: 'Offline · saved here', syncerr: 'Sync failed',
    on_track: 'On track', behind: 'Behind', ahead: 'Ahead', days: 'days', day: 'day',
    you: 'You', plan: 'Plan', step: 'Step', now_step: 'Main course now', based_on_logs: 'Position is based on the study time you log.',
    continue_lesson: 'Start lesson', next_lesson: 'Next Orbit lesson', all_done_avail: 'You have finished every lesson written so far. Log your Coursera study, or review.',
    evening_now: 'Evening slot', today_slots: 'Your slots today', no_slots: 'No study planned today. Rest.', on_break: 'Holiday break. Studying resumes on',
    log_time: 'Log study time', start_timer: 'Start a study session', stop_timer: 'Stop and log', timer_running: 'Session running',
    main: 'Main course', eve: 'Evening', reviews_due: 'questions to review', review_now: 'Review now', streak: 'Study streak',
    sunday_title: 'Sunday review, 1 PM', sunday_open: 'Open the weekly review', coming_up: 'Coming up', apply_aid: 'Apply for Coursera Financial Aid by',
    starts: 'starts', expected_finish: 'Expected finish', planned: 'Planned', logged: 'Logged', hours: 'h', of: 'of',
    roadmap_lead: 'Planned dates use your study hours. Expected dates use the time you have actually logged.',
    include_opt: 'Include optional step 11 (fast.ai)', evening_items: 'Evening slots', finish_ok: 'Projected to finish the courses before Step 20 on 6 Sep 2028.',
    finish_late: 'At your current hours, Step 19 ends after Step 20 starts (6 Sep 2028). Add hours or skip step 11.',
    courses_lead: 'Each Orbit course follows its real course module by module. Pass each module exam with 80% to unlock the next.',
    main_courses: 'Main courses', tracks: 'Tracks', lessons: 'lessons', modules: 'modules', being_written: 'Lessons being written',
    real_course: 'Real course', certificate: 'Certificate', open_real: 'Open the real course', honour: 'Orbit never gives answers to graded Coursera, PMI or Claude Academy work. It teaches the method on parallel examples.',
    module_exam: 'Module exam', final_exam: 'Final exam', locked: 'Locked', pass_prev: 'Pass the previous module exam to unlock.', best: 'Best', passed: 'Passed',
    take_exam: 'Take the exam', retake: 'Retake', not_written: 'Coming soon', pairs: 'Pairs with',
    hook: 'The situation', core: 'Core idea', analogy: 'Think of it like this', example: 'Worked example', practice: 'Practice', quiz: 'Lesson quiz',
    easy: 'Easy', medium: 'Medium', hard: 'Hard', show_answer: 'Show the answer', got_it: 'I had it', missed_it: 'I missed it', your_answer: 'Your answer (optional)',
    correct: 'Correct.', incorrect: 'Not quite.', finish_lesson: 'Finish lesson', answer_all: 'Answer every quiz question to finish.', lesson_done: 'Lesson finished',
    score: 'Score', back_course: 'Back to the course', minutes: 'min',
    exam_intro: 'questions · pass mark 80% · no feedback until the end', time_limit: 'Time limit', start_exam: 'Start the exam', next_q: 'Next question', prev_q: 'Previous',
    submit_exam: 'Submit the exam', exam_pass: 'Passed. The next module is unlocked.', exam_fail: 'Not yet. Redo these lessons, then retake:', review_answers: 'Your answers',
    review_title: 'Spaced review', review_lead: 'Questions come back after 1, 3, 7, 21 and 60 days. A miss sends a question back to day 1.',
    nothing_due: 'Nothing to review today. Finish a lesson to add its questions.', check: 'Check', next: 'Next', review_done: 'Review finished for today',
    progress_title: 'Progress', this_week: 'This week', total_logged: 'Total logged', lessons_done: 'Lessons done', exams_passed: 'Exams passed',
    weekly_hours: 'Main-course hours, last 12 weeks', recent_logs: 'Recent study logs', delete: 'Delete', no_logs: 'No study logged yet.',
    weekly_title: 'Sunday review', week_of: 'Week of', w_finished: 'What did I finish this week?', w_slipped: 'What slipped, and why?', w_focus: 'Main focus for next week',
    w_pitch: 'I pitched one business this week', w_bzwtp: 'I logged my BZWTP project hours', w_slots: 'I checked next week’s study slots', save_review: 'Save this review', saved: 'Saved',
    past_reviews: 'Past reviews', certs: 'Certificates', cert_locked: 'Pass this course’s final exam to unlock its Orbit certificate.',
    download_png: 'Download as PNG', cert_note: 'Unofficial. Issued by Orbit, a personal study app, not by Google, Coursera, PMI or any school.',
    settings: 'Settings', language: 'Language', your_name: 'Name on certificates', study_hours: 'Your study hours',
    study_hours_lead: 'Set the slots you will really keep. Main-course time moves the roadmap; evening time runs the tracks.',
    add_slot: 'Add a slot', save_hours: 'Save my study hours', reset_hours: 'Use the roadmap’s hours', per_week: 'per week', start_date: 'Day 1',
    data: 'Your data', export: 'Download a backup (JSON)', sync_note_ok: 'Progress syncs through your Claude account between your phone and laptop.',
    sync_note_local: 'Sync is not available in this view, so progress is saved on this device only.', kind: 'Type', time: 'Start', length: 'Minutes',
    log_title: 'Log study time', date: 'Date', what: 'What did you study?', save_log: 'Save', cancel: 'Cancel', logged_ok: 'Logged',
    rest: 'Rest', main_short: 'main', eve_short: 'evening', week: 'week', done: 'Done', lesson: 'Lesson', of_total: 'of',
    open: 'Open', module: 'Module', course: 'Course', fr_missing: 'French version coming soon.', cert_ready: 'View certificate',
    status_line_start: 'Day 1 of your re-baselined roadmap.', hours_logged_step: 'logged in this step', current_part: 'Probably on',
    download_failed: 'The download was not saved.', downloads_off: 'Downloads are not available in this view. Take a screenshot instead.',
    passed_on: 'Passed on', unlock_final: 'Pass every module exam to unlock the final exam.', apply_by: 'apply by', apply_aid_now: 'Apply for Coursera Financial Aid now (reviews take up to ~15 days)'
  },
  fr: {
    tab_today: 'Aujourd’hui', tab_roadmap: 'Parcours', tab_courses: 'Cours', tab_review: 'Révision', tab_progress: 'Progrès',
    synced: 'Synchronisé', saving: 'Enregistrement…', local: 'Cet appareil seulement', waiting: 'Connexion…', offline: 'Hors ligne · gardé ici', syncerr: 'Échec de synchro',
    on_track: 'Dans les temps', behind: 'En retard', ahead: 'En avance', days: 'jours', day: 'jour',
    you: 'Vous', plan: 'Plan', step: 'Étape', now_step: 'Cours principal en ce moment', based_on_logs: 'La position se base sur le temps d’étude que vous enregistrez.',
    continue_lesson: 'Commencer la leçon', next_lesson: 'Prochaine leçon Orbit', all_done_avail: 'Vous avez fini toutes les leçons déjà écrites. Enregistrez votre temps Coursera, ou révisez.',
    evening_now: 'Créneau du soir', today_slots: 'Vos créneaux aujourd’hui', no_slots: 'Pas d’étude prévue aujourd’hui. Repos.', on_break: 'Pause des fêtes. Reprise le',
    log_time: 'Enregistrer du temps', start_timer: 'Lancer une séance', stop_timer: 'Arrêter et enregistrer', timer_running: 'Séance en cours',
    main: 'Cours principal', eve: 'Soir', reviews_due: 'questions à réviser', review_now: 'Réviser', streak: 'Série d’étude',
    sunday_title: 'Bilan du dimanche, 13 h', sunday_open: 'Ouvrir le bilan de la semaine', coming_up: 'À venir', apply_aid: 'Demander l’aide financière Coursera avant le',
    starts: 'commence', expected_finish: 'Fin prévue', planned: 'Prévu', logged: 'Enregistré', hours: 'h', of: 'sur',
    roadmap_lead: 'Les dates prévues utilisent vos heures d’étude. Les dates attendues utilisent le temps réellement enregistré.',
    include_opt: 'Inclure l’étape optionnelle 11 (fast.ai)', evening_items: 'Créneaux du soir', finish_ok: 'Fin des cours prévue avant l’étape 20, le 6 sept. 2028.',
    finish_late: 'Avec vos heures actuelles, l’étape 19 finit après le début de l’étape 20 (6 sept. 2028). Ajoutez des heures ou sautez l’étape 11.',
    courses_lead: 'Chaque cours Orbit suit son vrai cours, module par module. Réussissez chaque examen de module à 80 % pour débloquer le suivant.',
    main_courses: 'Cours principaux', tracks: 'Parcours', lessons: 'leçons', modules: 'modules', being_written: 'Leçons en cours d’écriture',
    real_course: 'Vrai cours', certificate: 'Certificat', open_real: 'Ouvrir le vrai cours', honour: 'Orbit ne donne jamais les réponses aux évaluations notées de Coursera, du PMI ou de Claude Academy. Il enseigne la méthode sur des exemples parallèles.',
    module_exam: 'Examen du module', final_exam: 'Examen final', locked: 'Verrouillé', pass_prev: 'Réussissez l’examen du module précédent pour débloquer.', best: 'Meilleur', passed: 'Réussi',
    take_exam: 'Passer l’examen', retake: 'Repasser', not_written: 'Bientôt', pairs: 'Avec',
    hook: 'La situation', core: 'L’idée clé', analogy: 'Pensez-y comme ceci', example: 'Exemple guidé', practice: 'Entraînement', quiz: 'Quiz de la leçon',
    easy: 'Facile', medium: 'Moyen', hard: 'Difficile', show_answer: 'Voir la réponse', got_it: 'Je l’avais', missed_it: 'Je l’ai raté', your_answer: 'Votre réponse (facultatif)',
    correct: 'Correct.', incorrect: 'Pas tout à fait.', finish_lesson: 'Terminer la leçon', answer_all: 'Répondez à toutes les questions du quiz pour terminer.', lesson_done: 'Leçon terminée',
    score: 'Score', back_course: 'Retour au cours', minutes: 'min',
    exam_intro: 'questions · seuil 80 % · correction à la fin', time_limit: 'Temps limite', start_exam: 'Commencer l’examen', next_q: 'Question suivante', prev_q: 'Précédente',
    submit_exam: 'Rendre l’examen', exam_pass: 'Réussi. Le module suivant est débloqué.', exam_fail: 'Pas encore. Refaites ces leçons, puis repassez :', review_answers: 'Vos réponses',
    review_title: 'Révision espacée', review_lead: 'Les questions reviennent après 1, 3, 7, 21 et 60 jours. Une erreur renvoie la question au jour 1.',
    nothing_due: 'Rien à réviser aujourd’hui. Terminez une leçon pour ajouter ses questions.', check: 'Vérifier', next: 'Suivant', review_done: 'Révision du jour terminée',
    progress_title: 'Progrès', this_week: 'Cette semaine', total_logged: 'Total enregistré', lessons_done: 'Leçons faites', exams_passed: 'Examens réussis',
    weekly_hours: 'Heures de cours principal, 12 dernières semaines', recent_logs: 'Derniers enregistrements', delete: 'Supprimer', no_logs: 'Aucun temps enregistré.',
    weekly_title: 'Bilan du dimanche', week_of: 'Semaine du', w_finished: 'Qu’ai-je terminé cette semaine ?', w_slipped: 'Qu’est-ce qui a glissé, et pourquoi ?', w_focus: 'Priorité de la semaine prochaine',
    w_pitch: 'J’ai démarché une entreprise cette semaine', w_bzwtp: 'J’ai enregistré mes heures de projet BZWTP', w_slots: 'J’ai vérifié mes créneaux de la semaine prochaine', save_review: 'Enregistrer ce bilan', saved: 'Enregistré',
    past_reviews: 'Bilans précédents', certs: 'Certificats', cert_locked: 'Réussissez l’examen final de ce cours pour débloquer son certificat Orbit.',
    download_png: 'Télécharger en PNG', cert_note: 'Non officiel. Délivré par Orbit, une application d’étude personnelle, et non par Google, Coursera, le PMI ou une école.',
    settings: 'Réglages', language: 'Langue', your_name: 'Nom sur les certificats', study_hours: 'Vos heures d’étude',
    study_hours_lead: 'Indiquez les créneaux que vous tiendrez vraiment. Le temps de cours principal fait avancer le parcours ; le temps du soir fait avancer les parcours annexes.',
    add_slot: 'Ajouter un créneau', save_hours: 'Enregistrer mes heures', reset_hours: 'Reprendre les heures du parcours', per_week: 'par semaine', start_date: 'Jour 1',
    data: 'Vos données', export: 'Télécharger une sauvegarde (JSON)', sync_note_ok: 'Vos progrès se synchronisent via votre compte Claude entre téléphone et ordinateur.',
    sync_note_local: 'La synchronisation n’est pas disponible ici : vos progrès sont gardés sur cet appareil seulement.', kind: 'Type', time: 'Début', length: 'Minutes',
    log_title: 'Enregistrer du temps', date: 'Date', what: 'Qu’avez-vous étudié ?', save_log: 'Enregistrer', cancel: 'Annuler', logged_ok: 'Enregistré',
    rest: 'Repos', main_short: 'principal', eve_short: 'soir', week: 'semaine', done: 'Fait', lesson: 'Leçon', of_total: 'sur',
    open: 'Ouvrir', module: 'Module', course: 'Cours', fr_missing: 'Version française bientôt disponible.', cert_ready: 'Voir le certificat',
    status_line_start: 'Jour 1 de votre parcours recalé.', hours_logged_step: 'enregistrées dans cette étape', current_part: 'Sans doute sur',
    download_failed: 'Le téléchargement n’a pas été enregistré.', downloads_off: 'Les téléchargements ne sont pas disponibles ici. Faites une capture d’écran.',
    passed_on: 'Réussi le', unlock_final: 'Réussissez tous les examens de module pour débloquer l’examen final.', apply_by: 'demander avant le', apply_aid_now: 'Demandez l’aide financière Coursera maintenant (jusqu’à ~15 jours d’examen)'
  }
};

/* ---------------------------------------------------------------- utils */
const $ = (s, el = document) => el.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const lang = () => (state.settings.lang === 'fr' ? 'fr' : 'en');
const t = k => (S[lang()][k] ?? S.en[k] ?? k);
const L = o => (o == null ? '' : typeof o === 'string' ? o : (o[lang()] || o.en || ''));
const hasFr = o => !o || typeof o === 'string' || !!o.fr;
const pd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12); };
const ymd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (s, n) => { const d = pd(s); d.setDate(d.getDate() + n); return ymd(d); };
const today = () => ymd(new Date());
const dow = s => DAYS[(pd(s).getDay() + 6) % 7];
const mondayOf = s => addDays(s, -((pd(s).getDay() + 6) % 7));
const diffDays = (a, b) => Math.round((pd(b) - pd(a)) / 864e5);
const inBreak = s => BREAKS.some(([a, b]) => s >= a && s <= b);
const fmtDate = (s, withYear = true) => s ? pd(s).toLocaleDateString(lang() === 'fr' ? 'fr-FR' : 'en-GB', withYear ? { day: 'numeric', month: 'short', year: 'numeric' } : { day: 'numeric', month: 'short' }) : '—';
const fmtH = h => (Math.round(h * 10) / 10).toLocaleString(lang() === 'fr' ? 'fr-FR' : 'en-GB');
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const clone = o => JSON.parse(JSON.stringify(o));
const stable = o => JSON.stringify(o, (k, v) => (v && typeof v === 'object' && !Array.isArray(v)) ? Object.keys(v).sort().reduce((a, x) => (a[x] = v[x], a), {}) : v);
const fmtClock = (hm) => { const [h, m] = hm.split(':').map(Number); if (lang() === 'fr') return `${h} h ${String(m).padStart(2, '0')}`; const ap = h >= 12 ? 'PM' : 'AM'; return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${ap}`; };
const addMin = (hm, min) => { const [h, m] = hm.split(':').map(Number); const tt = h * 60 + m + min; return `${String(Math.floor(tt / 60) % 24).padStart(2, '0')}:${String(tt % 60).padStart(2, '0')}`; };
function md(src) {
  const text = L(src);
  if (!text) return '';
  const inline = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
  return text.split(/\n{2,}/).map(block => {
    const lines = block.split('\n');
    if (lines.every(l => /^- /.test(l))) return `<ul>${lines.map(l => `<li>${inline(l.slice(2))}</li>`).join('')}</ul>`;
    if (/^\d+\. /.test(lines[0]) && lines.every(l => /^\d+\. /.test(l) || /^\s+- /.test(l)) && lines.some(l => /^\s+- /.test(l))) {
      const items = []; lines.forEach(l => { if (/^\d+\. /.test(l)) items.push({ t: l.replace(/^\d+\. /, ''), sub: [] }); else items[items.length - 1].sub.push(l.replace(/^\s+- /, '')); });
      return `<ol>${items.map(it => `<li>${inline(it.t)}${it.sub.length ? `<ul>${it.sub.map(x => `<li>${inline(x)}</li>`).join('')}</ul>` : ''}</li>`).join('')}</ol>`;
    }
    if (lines.every(l => /^\d+\. /.test(l))) return `<ol>${lines.map(l => `<li>${inline(l.replace(/^\d+\. /, ''))}</li>`).join('')}</ol>`;
    if (lines.length > 1 && lines.every(l => /^\|.*\|$/.test(l.trim()))) {
      const rows = lines.filter(l => !/^\|[\s:|-]+\|$/.test(l.trim())).map(l => l.trim().slice(1, -1).split('|').map(c => c.trim()));
      return `<div class="tbl"><table><thead><tr>${rows[0].map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${rows.slice(1).map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    }
    return `<p>${lines.map(inline).join('<br>')}</p>`;
  }).join('');
}
function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('on'), 2600); }
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
  del(k) { try { localStorage.removeItem(k); } catch { /* storage unavailable */ } }
};

/* ---------------------------------------------------------------- state */
const blank = () => ({
  settings: { v: 1, lang: 'en', name: 'Joe Ryan Nibigira', start: PLAN_START, optional: false, saver: false, slots: clone(DEFAULT_SLOTS), updatedAt: 0 },
  progress: { v: 1, lessons: {}, exams: {}, weekly: {}, teach: {}, updatedAt: 0 },
  activity: { v: 1, logs: {}, reviews: {}, days: {}, mistakes: {}, updatedAt: 0 }
});
let state = blank();
const cached = store.get('orbit-state');
if (cached && cached.settings) { const b = blank(); state = { settings: { ...b.settings, ...cached.settings }, progress: { ...b.progress, ...cached.progress }, activity: { ...b.activity, ...cached.activity } }; }

const merge = {
  settings(a, b) { return (b?.updatedAt || 0) > (a?.updatedAt || 0) ? b : a; },
  progress(a, b) {
    const out = { v: 1, lessons: { ...a.lessons }, exams: { ...a.exams }, weekly: { ...a.weekly }, updatedAt: Math.max(a.updatedAt || 0, b.updatedAt || 0) };
    for (const [k, v] of Object.entries(b.lessons || {})) { const x = out.lessons[k]; out.lessons[k] = !x ? v : { at: Math.min(x.at, v.at), score: Math.max(x.score ?? 0, v.score ?? 0) }; }
    for (const [k, v] of Object.entries(b.exams || {})) {
      const x = out.exams[k];
      if (!x) { out.exams[k] = v; continue; }
      const later = (v.lastAt || 0) > (x.lastAt || 0) ? v : x;
      out.exams[k] = { best: Math.max(x.best || 0, v.best || 0), attempts: Math.max(x.attempts || 0, v.attempts || 0), last: later.last, lastAt: later.lastAt,
        passedAt: [x.passedAt, v.passedAt].filter(Boolean).sort()[0] || null };
    }
    for (const [k, v] of Object.entries(b.weekly || {})) { const x = out.weekly[k]; out.weekly[k] = !x || (v.savedAt || 0) > (x.savedAt || 0) ? v : x; }
    out.teach = { ...(a.teach || {}) };
    for (const [k, v] of Object.entries(b.teach || {})) { const x = out.teach[k]; out.teach[k] = !x || (v.at || 0) > (x.at || 0) ? v : x; }
    return out;
  },
  activity(a, b) {
    const out = { v: 1, logs: { ...a.logs }, reviews: { ...a.reviews }, days: { ...a.days }, updatedAt: Math.max(a.updatedAt || 0, b.updatedAt || 0) };
    for (const [k, v] of Object.entries(b.logs || {})) { const x = out.logs[k]; out.logs[k] = !x ? v : (v.del || x.del) ? { ...x, ...v, del: true } : x; }
    for (const [k, v] of Object.entries(b.reviews || {})) { const x = out.reviews[k]; out.reviews[k] = !x || (v.at || 0) > (x.at || 0) ? v : x; }
    for (const [k, v] of Object.entries(b.days || {})) { const x = out.days[k] || {}; out.days[k] = { l: Math.max(x.l || 0, v.l || 0), r: Math.max(x.r || 0, v.r || 0) }; }
    out.mistakes = { ...(a.mistakes || {}) };
    for (const [k, v] of Object.entries(b.mistakes || {})) { const x = out.mistakes[k]; out.mistakes[k] = !x || (v.at || 0) > (x.at || 0) ? v : x; }
    return out;
  }
};

/* ---------------------------------------------------------------- sync */
const sync = { db: null, uid: null, refs: {}, mode: 'wait', timers: {}, writing: {}, again: {}, gotLive: false };
function setSync(mode) {
  sync.mode = mode;
  const el = $('#sync');
  const map = { ok: 'synced', busy: 'saving', local: 'local', wait: 'waiting', off: 'offline', err: 'syncerr' };
  el.dataset.s = mode === 'off' ? 'local' : mode;
  el.lastElementChild.textContent = t(map[mode] || 'waiting');
}
function persist(docName) {
  state[docName].updatedAt = Date.now();
  store.set('orbit-state', state);
  if (!sync.refs[docName]) return;
  clearTimeout(sync.timers[docName]);
  sync.timers[docName] = setTimeout(() => writeDoc(docName), 1200);
  setSync('busy');
}
async function writeDoc(docName, retried = false) {
  if (sync.writing[docName]) { sync.again[docName] = true; return; }
  sync.writing[docName] = true;
  try {
    await sync.refs[docName].set(clone(state[docName]));
    setSync('ok');
  } catch (e) {
    if (e && e.code === 'unavailable' && !retried) { sync.writing[docName] = false; setTimeout(() => writeDoc(docName, true), 800 + Math.random() * 800); return; }
    setSync(e && e.code === 'unavailable' ? 'off' : 'err');
  }
  sync.writing[docName] = false;
  if (sync.again[docName]) { sync.again[docName] = false; writeDoc(docName); }
}
async function startSync() {
  setSync('wait');
  const cl = window.claude;
  if (!cl || typeof cl.use !== 'function') { setSync('local'); return; }
  let db = null, user = null;
  try { [db, user] = await Promise.all([cl.use('db'), cl.use('user')]); } catch { /* treated as absent */ }
  const id = user ? await user.id().catch(() => null) : null;
  if (!db || !id) { setSync('local'); render(); return; }
  sync.db = db; sync.uid = id;
  const timeout = setTimeout(() => { if (!sync.gotLive) setSync('off'); }, 10000);
  for (const name of ['settings', 'progress', 'activity']) {
    const ref = db.doc(`data/users/${id}/${name}`);
    sync.refs[name] = ref;
    ref.onSnapshot(snap => {
      if (!snap.metadata.fromCache) { sync.gotLive = true; clearTimeout(timeout); }
      if (snap.metadata.hasPendingWrites) return;
      const remote = snap.exists ? snap.data() : null;
      if (!remote) { if (!snap.metadata.fromCache) writeDoc(name); return; }
      const merged = merge[name](state[name], clone(remote));
      const changed = stable(merged) !== stable(state[name]);
      state[name] = merged;
      store.set('orbit-state', state);
      if (stable(merged) !== stable(remote) && !snap.metadata.fromCache) writeDoc(name);
      else if (!sync.writing[name]) setSync('ok');
      if (changed) softRender();
    }, err => { setSync(err && err.code === 'revoked' ? 'local' : 'err'); });
  }
}

/* ---------------------------------------------------------------- schedule engine */
function slotsFor(dateStr) { return (state.settings.slots[dow(dateStr)] || []).slice().sort((a, b) => a.t.localeCompare(b.t)); }
function mainMin(dateStr) { return inBreak(dateStr) ? 0 : slotsFor(dateStr).filter(s => s.k === 'main').reduce((a, s) => a + (+s.m || 0), 0); }
function weekMin(kind) { return DAYS.reduce((a, d) => a + (state.settings.slots[d] || []).filter(s => s.k === kind).reduce((x, s) => x + (+s.m || 0), 0), 0); }
function activeSteps() { return STEPS.filter(s => !s.fixed && (!s.opt || state.settings.optional)); }
function layout(fromDate, doneHours) {
  // Walk the calendar from fromDate, pouring each day's main minutes into steps in order.
  const steps = activeSteps();
  const res = {};
  let carry = doneHours * 60, i = 0, day = fromDate, guard = 0;
  while (i < steps.length && carry >= steps[i].h * 60) { carry -= steps[i].h * 60; res[steps[i].id] = { done: true }; i++; }
  if (i < steps.length) res[steps[i].id] = { start: null, filled: carry };
  while (i < steps.length && day <= ROLL_LIMIT && guard++ < 3000) {
    let avail = mainMin(day);
    while (avail > 0 && i < steps.length) {
      const st = steps[i], r = res[st.id] || (res[st.id] = { start: null, filled: 0 });
      if (!r.start) r.start = day;
      const need = st.h * 60 - r.filled, use = Math.min(need, avail);
      r.filled += use; avail -= use;
      if (r.filled >= st.h * 60 - 0.01) { r.end = day; i++; }
    }
    day = addDays(day, 1);
  }
  return res;
}
function loggedMain() { return Object.values(state.activity.logs).filter(l => !l.del && l.k === 'main').reduce((a, l) => a + (+l.m || 0), 0) / 60; }
function loggedFor(stepId) { return Object.values(state.activity.logs).filter(l => !l.del && l.k === 'main' && l.s === stepId).reduce((a, l) => a + (+l.m || 0), 0) / 60; }
function position() {
  const start = state.settings.start || PLAN_START, now = today();
  let expected = 0;
  for (let d = start; d < now && d <= ROLL_LIMIT; d = addDays(d, 1)) expected += mainMin(d) / 60;
  const actual = loggedMain();
  const steps = activeSteps();
  let acc = 0, cur = steps[steps.length - 1], into = 0;
  for (const s of steps) { if (actual < acc + s.h) { cur = s; into = actual - acc; break; } acc += s.h; }
  const perDay = Math.max(weekMin('main') / 60 / 7, 0.01);
  const daysDiff = Math.round((actual - expected) / perDay);
  const status = daysDiff < -7 ? 'behind' : daysDiff > 7 ? 'ahead' : 'on_track';
  const total = steps.reduce((a, s) => a + s.h, 0);
  return { expected, actual, cur, into, daysDiff, status, total };
}
function currentPart(step, into) {
  if (!step.parts) return null;
  const sum = step.parts.reduce((a, p) => a + p[1], 0), k = step.h / sum;
  let acc = 0;
  for (const [name, h] of step.parts) { if (into < acc + h * k) return { name, startH: acc, h: h * k }; acc += h * k; }
  return { name: step.parts[step.parts.length - 1][0] };
}
function partStarts(step, startDate, intoHours) {
  // projected start date of each remaining part of a multi-course step, from today.
  if (!step.parts) return [];
  const sum = step.parts.reduce((a, p) => a + p[1], 0), k = step.h / sum;
  const out = []; let acc = 0;
  for (const [name, h] of step.parts) { if (acc > intoHours + 0.01) out.push({ name, at: acc - intoHours }); acc += h * k; }
  return out.map(p => {
    let need = p.at * 60, d = startDate, g = 0;
    while (need > 0 && g++ < 2000) { need -= mainMin(d); if (need > 0) d = addDays(d, 1); }
    return { name: p.name, date: d };
  });
}
function eveningNow(dateStr) { return EVENING.filter(e => dateStr >= e.s && dateStr <= e.e); }

/* ---------------------------------------------------------------- content */
let catalog = null;
const content = {};
async function loadCatalog() {
  if (catalog) return catalog;
  const r = await fetch('content/catalog.json', { cache: 'no-cache' });
  catalog = await r.json();
  return catalog;
}
const courseById = id => catalog?.courses.find(c => c.id === id);
async function loadCourse(id) {
  if (content[id] !== undefined) return content[id];
  const c = courseById(id);
  if (!c || !c.content) { content[id] = null; return null; }
  try { const r = await fetch(c.content, { cache: 'no-cache' }); content[id] = await r.json(); } catch { content[id] = null; }
  return content[id];
}
function modLessons(cc, mid) { return cc?.modules?.[mid]?.lessons || []; }
function allLessons(courseId) {
  const c = courseById(courseId), cc = content[courseId];
  if (!c || !cc) return [];
  return c.modules.flatMap(m => modLessons(cc, m.id).map(l => ({ ...l, mid: m.id })));
}
const lessonDone = id => !!state.progress.lessons[id];
const examRec = id => state.progress.exams[id];
const examPassed = id => !!examRec(id)?.passedAt;
function moduleUnlocked(course, idx) {
  if (idx === 0) return true;
  const cc = content[course.id];
  const prev = course.modules[idx - 1];
  if (!cc?.modules?.[prev.id]) return false;
  return examPassed(`${course.id}-${prev.id}`);
}
function nextLesson(courseId) {
  const c = courseById(courseId), cc = content[courseId];
  if (!c || !cc) return null;
  for (let i = 0; i < c.modules.length; i++) {
    if (!moduleUnlocked(c, i)) return null;
    const m = c.modules[i];
    for (const l of modLessons(cc, m.id)) if (!lessonDone(l.id)) return { course: c, module: m, lesson: l };
  }
  return null;
}
function findLesson(lessonId) {
  for (const c of catalog?.courses || []) {
    const cc = content[c.id]; if (!cc) continue;
    for (const m of c.modules) { const ls = modLessons(cc, m.id); const i = ls.findIndex(l => l.id === lessonId); if (i >= 0) return { course: c, module: m, lesson: ls[i], index: i, list: ls }; }
  }
  return null;
}
function questionById(qid) {
  for (const [cid, cc] of Object.entries(content)) {
    if (!cc) continue;
    for (const [mid, m] of Object.entries(cc.modules || {})) {
      for (const l of m.lessons || []) for (const q of l.quiz || []) if (`${l.id}-${q.id}` === qid) return { q, lesson: l };
      for (const q of m.exam?.questions || []) if (`${cid}-${mid}-${q.id}` === qid) return { q, lesson: (m.lessons || []).find(l => l.id === q.lesson) || { title: T('Module exam', 'Examen du module') } };
    }
  }
  return null;
}
function noteMistake(qid, wrong) {
  const m = state.activity.mistakes || (state.activity.mistakes = {});
  if (wrong) m[qid] = { n: (m[qid]?.n || 0) + 1, at: Date.now(), fixed: false };
  else if (m[qid] && !m[qid].fixed) m[qid] = { ...m[qid], fixed: true, at: Date.now() };
}
function masteryOf(c, m) {
  const ls = modLessons(content[c.id], m.id); if (!ls.length) return null;
  const done = ls.filter(l => lessonDone(l.id));
  const ex = examRec(`${c.id}-${m.id}`);
  const avg = done.length ? done.reduce((a, l) => a + (state.progress.lessons[l.id].score || 0), 0) / done.length : 0;
  if (ex?.passedAt && ex.best >= 0.9 && avg >= 0.75 && done.length === ls.length) return 3;
  if (ex?.passedAt) return 2;
  if (done.length) return 1;
  return 0;
}
const MASTERY = [T('Not yet', 'Pas encore'), T('Developing', 'En progrès'), T('Solid', 'Solide'), T('Mastered', 'Maîtrisé')];

/* ---------------------------------------------------------------- activity helpers */
function bumpDay(field) { const d = today(); const x = state.activity.days[d] || { l: 0, r: 0 }; x[field] = (x[field] || 0) + 1; state.activity.days[d] = x; }
function activeOn(d) {
  const x = state.activity.days[d];
  if (x && ((x.l || 0) > 0 || (x.r || 0) >= 5)) return true;
  return Object.values(state.activity.logs).some(l => !l.del && l.d === d && l.m >= 15);
}
function plannedOn(d) { return !inBreak(d) && (state.settings.slots[dow(d)] || []).length > 0; }
function streak() {
  let n = 0, d = today(), g = 0;
  if (!activeOn(d)) d = addDays(d, -1);
  while (g++ < 1000 && d >= (state.settings.start || PLAN_START)) {
    if (!plannedOn(d)) { d = addDays(d, -1); continue; }
    if (!activeOn(d)) break;
    n++; d = addDays(d, -1);
  }
  return n;
}
function dueReviews() {
  const now = today();
  return Object.entries(state.activity.reviews).filter(([, r]) => r.due <= now).sort((a, b) => a[1].due.localeCompare(b[1].due)).map(([k]) => k);
}

/* ---------------------------------------------------------------- ui state */
const ui = { answers: {}, practice: {}, exam: null, review: null, slotsDraft: null, weeklyDraft: null };
const viewEl = () => $('#view');

/* ---------------------------------------------------------------- router */
const ROUTES = ['today', 'roadmap', 'courses', 'review', 'progress', 'prefs', 'weekly'];
function route() {
  const h = (location.hash || '#today').slice(1);
  if (ROUTES.includes(h)) return { name: h };
  let m;
  if ((m = h.match(/^course-([a-z0-9]+)$/))) return { name: 'course', id: m[1] };
  if ((m = h.match(/^lesson-([a-z0-9-]+)$/))) return { name: 'lesson', id: m[1] };
  if ((m = h.match(/^exam-([a-z0-9-]+)$/))) return { name: 'exam', id: m[1] };
  if ((m = h.match(/^cert-([a-z0-9]+)$/))) return { name: 'cert', id: m[1] };
  return { name: 'today' };
}
async function render(anim = false) {
  await loadCatalog().catch(() => null);
  const r = route();
  const tab = { course: 'courses', lesson: 'courses', exam: 'courses', cert: 'progress', weekly: 'progress', prefs: '' }[r.name] ?? r.name;
  document.querySelectorAll('.tabs a').forEach(a => { if (a.dataset.tab === tab) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  document.querySelectorAll('[data-t]').forEach(el => { el.textContent = t(el.dataset.t); });
  $('#lang').textContent = lang() === 'fr' ? 'EN' : 'FR';
  document.documentElement.lang = lang();
  // make sure the content the view needs is loaded
  const need = new Set(['pm101', 'agent101']);
  if (r.name === 'course' || r.name === 'cert') need.add(r.id);
  if (r.name === 'lesson' || r.name === 'exam') need.add(r.id.split('-')[0]);
  await Promise.all([...need].map(loadCourse));
  const views = { today: vToday, roadmap: vRoadmap, courses: vCourses, course: vCourse, lesson: vLesson, exam: vExam, review: vReview, progress: vProgress, weekly: vWeekly, prefs: vSettings, cert: vCert };
  cleanupScenes();
  viewEl().innerHTML = views[r.name](r);
  if (anim && !REDUCED) { const v = viewEl(); v.classList.remove('enter'); void v.offsetWidth; v.classList.add('enter'); }
  mountScenes();
  if (r.name === 'lesson') wireLessonExtras(r.id);
  const due = dueReviews().length, b = $('#due-badge');
  b.hidden = !due; b.textContent = due;
  setSync(sync.mode);
  if (r.name === 'today') tickTimer();
}
function softRender() { const r = route().name; if (!['lesson', 'exam', 'review', 'prefs', 'weekly'].includes(r)) render(); }
window.addEventListener('hashchange', () => { const n = route().name; if (n === 'review') ui.review = null; if (n === 'prefs') ui.slotsDraft = null; if (n === 'weekly') ui.weeklyDraft = null; render(true).then(() => { window.scrollTo(0, 0); viewEl().focus({ preventScroll: true }); }); });

/* ---------------------------------------------------------------- shared view parts */
function pill(status) {
  const cls = { on_track: 'good', behind: 'warn', ahead: 'info' }[status];
  return `<span class="pill ${cls}">${esc(t(status))}</span>`;
}
function trackSVG(pos) {
  // HTML track: positions in %, so it stays legible at 360px and on desktop.
  const steps = activeSteps(), total = pos.total, P = h => Math.min(Math.max(h / total, 0), 1) * 100;
  let acc = 0, lastPh = 0, marks = '';
  for (const s of steps) { if (acc > 0) marks += `<i class="${s.ph !== lastPh ? 'ph' : 'tk'}" style="left:${P(acc)}%"></i>`; lastPh = s.ph; acc += s.h; }
  const a = P(pos.actual), e = P(pos.expected);
  const al = a < 8 ? 'l' : a > 92 ? 'r' : '', el = e < 8 ? 'l' : e > 92 ? 'r' : '';
  return `<div class="tr" role="img" aria-label="${esc(`${t('you')} ${fmtH(pos.actual)} h, ${t('plan')} ${fmtH(pos.expected)} h ${t('of')} ${fmtH(total)} h`)}">
    <div class="tr-rail"><b style="width:${a}%"></b>${marks}</div>
    <span class="tr-you ${al}" style="left:${a}%"><em>${esc(t('you'))}</em></span>
    <span class="tr-plan ${el}" style="left:${e}%"><em>${esc(t('plan'))}</em></span>
  </div><div class="row between small muted mono"><span>${esc(fmtDate(state.settings.start))}</span><span>${esc(fmtDate('2028-12-31'))}</span></div>`;
}
function realLink(c) { return c.real?.url ? `<a href="${esc(c.real.url)}" target="_blank" rel="noopener">${esc(L(c.real.name))}</a>` : esc(L(c.real?.name)); }
function frNote(o) { return lang() === 'fr' && !hasFr(o) ? `<p class="note">${esc(t('fr_missing'))}</p>` : ''; }

/* ---------------------------------------------------------------- views */
function vToday() {
  const pos = position(), now = today(), cur = pos.cur;
  const part = currentPart(cur, pos.into);
  const nl = nextLesson(cur.id) || null;
  const eve = eveningNow(now);
  const eveLesson = eve.map(e => e.course && nextLesson(e.course)).find(Boolean);
  const slots = slotsFor(now);
  const dd = Math.abs(pos.daysDiff);
  const statusLine = pos.status === 'on_track' && pos.actual === 0 && pos.expected === 0 ? t('status_line_start')
    : pos.status === 'on_track' ? `${fmtH(pos.actual)} h ${t('logged').toLowerCase()} · ${t('plan').toLowerCase()} ${fmtH(pos.expected)} h`
      : `${dd} ${dd === 1 ? t('day') : t('days')} ${pos.status === 'behind' ? t('behind').toLowerCase() : t('ahead').toLowerCase()} · ${fmtH(pos.actual)} / ${fmtH(pos.expected)} h`;
  const due = dueReviews().length;
  const timer = store.get('orbit-timer');
  const proj = layout(now, pos.actual);
  const pr = proj[cur.id] || {};
  const parts = partStarts(cur, now, pos.into).slice(0, 2);
  const nextSteps = activeSteps().filter(s => (proj[s.id] || {}).start && !(proj[s.id] || {}).done && s.id !== cur.id).slice(0, 2);
  const upcoming = [...parts.map(p => ({ name: L(cur.t) + ' · ' + L(p.name), date: p.date, aid: cur.p === 'Coursera' })),
    ...nextSteps.map(s => ({ name: `${t('step')} ${s.n} · ${L(s.t)}`, date: proj[s.id].start, aid: s.p === 'Coursera' }))].slice(0, 3);
  const isSunday = dow(now) === 'sun';
  const brk = inBreak(now) ? BREAKS.find(([a, b]) => now >= a && now <= b) : null;

  return `
  <section class="card">
    <div class="row between"><span class="eyebrow">${esc(t('now_step'))} · ${esc(t('step'))} ${cur.n}</span>${pill(pos.status)}</div>
    <h1>${esc(L(cur.t))}</h1>
    ${part ? `<p class="muted">${esc(t('current_part'))} ${esc(L(part.name))}</p>` : ''}
    <div class="track">${trackSVG(pos)}</div>
    <p class="small muted">${esc(statusLine.replace(/\.$/, ''))} · ${esc(t('expected_finish'))}: <span class="mono">${esc(fmtDate(pr.end))}</span>. ${esc(t('based_on_logs'))}</p>
  </section>

  <section class="card">
    <span class="eyebrow">${esc(t('next_lesson'))}</span>
    ${nl ? `<h2>${esc(L(nl.lesson.title))}</h2>
      <p class="muted small">${esc(nl.course.code)} · ${esc(L(nl.module.title))} · <span class="mono">${nl.lesson.minutes} ${esc(t('minutes'))}</span></p>
      <a class="btn primary block" href="#lesson-${esc(nl.lesson.id)}">${esc(t('continue_lesson'))}</a>`
    : `<p>${esc(t('all_done_avail'))}</p><button class="btn primary block" data-action="log">${esc(t('log_time'))}</button>`}
    ${eveLesson ? `<a class="item" href="#lesson-${esc(eveLesson.lesson.id)}"><span class="mark now">${esc(t('eve_short').slice(0, 1).toUpperCase())}</span><span class="grow"><span class="t">${esc(L(eveLesson.lesson.title))}</span><span class="s">${esc(t('evening_now'))} · ${esc(eveLesson.course.code)} · ${eveLesson.lesson.minutes} ${esc(t('minutes'))}</span></span></a>` : ''}
  </section>

  <section class="card">
    <div class="section-title"><h2>${esc(t('today_slots'))}</h2><span class="muted small">${esc(fmtDate(now))}</span></div>
    ${brk ? `<p>${esc(t('on_break'))} <span class="mono">${esc(fmtDate(addDays(brk[1], 1)))}</span>.</p>`
      : slots.length ? `<div class="list">${slots.map(s => `<div class="item"><span class="mono" style="width:76px">${esc(fmtClock(s.t))}</span><span class="grow"><span class="t">${esc(s.k === 'main' ? L(cur.t) : eve.map(e => L(e.t)).join(' · ') || t('eve'))}</span><span class="s">${esc(s.k === 'main' ? t('main') : t('eve'))} · ${s.m} ${esc(t('minutes'))}</span></span></div>`).join('')}</div>`
        : `<p class="muted">${esc(t('no_slots'))}</p>`}
    <div class="row">
      ${timer ? `<button class="btn" data-action="timer-stop">${esc(t('stop_timer'))} · <span class="mono" id="timer-el">0:00</span></button>`
      : `<button class="btn" data-action="timer-start">${esc(t('start_timer'))}</button>`}
      <button class="link" data-action="log">${esc(t('log_time'))}</button>
    </div>
  </section>

  <div class="grid2">
    <a class="card" href="#review" style="text-decoration:none;color:inherit"><div class="stat"><b>${due}</b><span>${esc(t('reviews_due'))}</span></div></a>
    <div class="card"><div class="stat"><b>${streak()}</b><span>${esc(t('streak'))} · ${esc(t('days'))}</span></div></div>
  </div>

  ${isSunday ? `<section class="card"><h2>${esc(t('sunday_title'))}</h2><a class="btn" href="#weekly">${esc(t('sunday_open'))}</a></section>` : ''}

  ${upcoming.length ? `<section class="card"><h2>${esc(t('coming_up'))}</h2><div class="list">${upcoming.map(u => `<div class="item"><span class="grow"><span class="t">${esc(u.name)}</span><span class="s">${esc(t('starts'))} <span class="mono">${esc(fmtDate(u.date))}</span>${u.aid ? ` · ${addDays(u.date, -21) <= now ? esc(t('apply_aid_now')) : `${esc(t('apply_aid'))} <span class="mono">${esc(fmtDate(addDays(u.date, -21)))}</span>`}` : ''}</span></span></div>`).join('')}</div></section>` : ''}
  `;
}

function vRoadmap() {
  const pos = position(), now = today();
  const base = layout(state.settings.start || PLAN_START, 0);
  const proj = layout(now, pos.actual);
  const s19 = proj.lead101?.end || base.lead101?.end;
  const late = s19 && s19 >= '2028-09-06';
  let lastPh = 0;
  const rows = STEPS.filter(s => !s.opt || true).map(s => {
    const phHead = s.ph !== lastPh ? `<div class="phase-h">${esc(L(PHASES[s.ph]))}</div>` : ''; lastPh = s.ph;
    const isCur = s.id === pos.cur.id;
    const skipped = s.opt && !state.settings.optional;
    const b = s.fixed ? { start: s.fixed[0], end: s.fixed[1] } : base[s.id] || {};
    const p = s.fixed ? { start: s.fixed[0], end: s.fixed[1] } : proj[s.id] || {};
    const lg = loggedFor(s.id);
    const hasCourse = !!courseById(s.id);
    const done = p.done;
    const meta = skipped ? `<span class="s">${lang() === 'fr' ? 'Liste « seulement si en avance »' : 'Backlog: only if you are ahead'}</span>`
      : `<span class="s">${esc(t('planned'))} <span class="mono">${esc(fmtDate(b.start, false))} → ${esc(fmtDate(b.end))}</span>${!s.fixed ? ` · ${esc(t('expected_finish'))} <span class="mono">${esc(done ? t('done') : fmtDate(p.end))}</span>` : ''}</span>
        ${!s.fixed ? `<span class="s"><span class="mono">${fmtH(lg)} / ${fmtH(s.h)} h</span></span>` : ''}`;
    return `${phHead}<${hasCourse ? `a href="#course-${s.id}"` : 'div'} class="item${isCur ? ' current' : ''}"><span class="step-n">${s.n}</span><span class="grow"><span class="t">${esc(L(s.t))}</span>${meta}</span>${isCur ? pill(pos.status) : done ? `<span class="pill plain">${esc(t('done'))}</span>` : ''}</${hasCourse ? 'a' : 'div'}>`;
  }).join('');
  const eve = EVENING.map(e => {
    const live = now >= e.s && now <= e.e;
    const href = e.course && courseById(e.course) ? `#course-${e.course}` : null;
    return `<${href ? `a href="${href}"` : 'div'} class="item${live ? ' current' : ''}"><span class="grow"><span class="t">${esc(L(e.t))}</span><span class="s mono">${esc(fmtDate(e.s, false))} → ${esc(fmtDate(e.e))}</span></span>${live ? '<span class="pill info">' + (lang() === 'fr' ? 'En cours' : 'Now') + '</span>' : ''}</${href ? 'a' : 'div'}>`;
  }).join('');
  return `
  <section class="stack"><h1>${esc(t('tab_roadmap'))}</h1><p class="muted">${esc(t('roadmap_lead'))}</p></section>
  <section class="card">
    <div class="track">${trackSVG(pos)}</div>
    <p class="small ${late ? '' : 'muted'}" style="${late ? 'color:var(--warn)' : ''}">${esc(late ? t('finish_late') : t('finish_ok'))}</p>
    <label class="check"><input type="checkbox" data-action="toggle-opt" ${state.settings.optional ? 'checked' : ''}> ${esc(t('include_opt'))}</label>
  </section>
  <section class="card"><div class="list">${rows}</div></section>
  <section class="card"><h2>${esc(t('evening_items'))}</h2><div class="list">${eve}</div></section>`;
}

function courseStats(c) {
  const ls = allLessons(c.id);
  const done = ls.filter(l => lessonDone(l.id)).length;
  const exams = c.modules.filter(m => examPassed(`${c.id}-${m.id}`)).length;
  return { total: ls.length, done, exams };
}
function vCourses() {
  if (!catalog) return `<p class="empty">Catalog not loaded.</p>`;
  const pos = position();
  const card = c => {
    const st = courseStats(c), step = STEPS.find(s => s.id === c.id);
    const isNow = c.id === pos.cur.id || EVENING.some(e => e.course === c.id && today() >= e.s && today() <= e.e);
    return `<a class="item" href="#course-${c.id}"><span class="step-n">${esc(c.badge || (step ? step.n : ''))}</span><span class="grow"><span class="t">${esc(c.code)} · ${esc(L(c.title))}</span><span class="s">${c.modules.length} ${esc(t('modules'))} · ${st.total ? `<span class="mono">${st.done}/${st.total}</span> ${esc(t('lessons'))}` : esc(t('being_written'))}</span></span>${isNow ? '<span class="pill info">' + (lang() === 'fr' ? 'En cours' : 'Now') + '</span>' : ''}</a>`;
  };
  return `
  <section class="stack"><h1>${esc(t('tab_courses'))}</h1><p class="muted">${esc(t('courses_lead'))}</p></section>
  <section class="card"><h2>${esc(t('tracks'))}</h2><div class="list">${catalog.courses.filter(c => c.kind === 'track').map(card).join('')}</div></section>
  <section class="card"><h2>${esc(t('main_courses'))}</h2><div class="list">${catalog.courses.filter(c => c.kind === 'main').map(card).join('')}</div></section>`;
}

function vCourse(r) {
  const c = courseById(r.id);
  if (!c) return `<p class="empty">Course not found. <a href="#courses">${esc(t('tab_courses'))}</a></p>`;
  const cc = content[c.id];
  const mods = c.modules.map((m, i) => {
    const unlocked = moduleUnlocked(c, i);
    const ls = modLessons(cc, m.id);
    const exId = `${c.id}-${m.id}`, ex = examRec(exId), hasExam = !!cc?.modules?.[m.id]?.exam;
    const lessonsHtml = ls.length ? ls.map((l, j) => {
      const done = lessonDone(l.id);
      return unlocked ? `<a class="item" href="#lesson-${esc(l.id)}"><span class="mark ${done ? 'done' : ''}">${done ? '✓' : j + 1}</span><span class="grow"><span class="t">${esc(L(l.title))}</span><span class="s mono">${l.minutes} ${esc(t('minutes'))}</span></span></a>`
        : `<div class="item"><span class="mark lock">${j + 1}</span><span class="grow"><span class="t muted">${esc(L(l.title))}</span></span></div>`;
    }).join('') : `<div class="item"><span class="grow"><span class="s">${esc(t('not_written'))}</span></span></div>`;
    const examHtml = hasExam ? (unlocked && ls.every(l => lessonDone(l.id))
      ? `<a class="item" href="#exam-${exId}"><span class="mark ${ex?.passedAt ? 'done' : 'now'}">${ex?.passedAt ? '✓' : 'E'}</span><span class="grow"><span class="t">${esc(t('module_exam'))}</span><span class="s">${ex ? `${esc(t('best'))} <span class="mono">${Math.round(ex.best * 100)}%</span>` : '80%'}</span></span></a>`
      : `<div class="item"><span class="mark lock">E</span><span class="grow"><span class="t muted">${esc(t('module_exam'))}</span><span class="s">${esc(unlocked ? (lang() === 'fr' ? 'Terminez les leçons du module.' : 'Finish the module’s lessons first.') : t('pass_prev'))}</span></span></div>`) : '';
    return `<div class="card"><div class="row between"><span class="eyebrow">${esc(t('module'))} ${i + 1}</span>${!unlocked ? `<span class="pill plain">${esc(t('locked'))}</span>` : ex?.passedAt ? `<span class="pill good">${esc(t('passed'))}</span>` : ''}</div>
      <h2>${esc(L(m.title))}</h2>${m.pairs ? `<p class="small muted">${esc(t('pairs'))}: ${esc(L(m.pairs))}</p>` : ''}
      ${(() => { const ms = masteryOf(c, m); return ms == null ? '' : `<div class="row small"><span class="mastery" aria-hidden="true">${[0, 1, 2, 3].map(k => `<i class="${k < ms + (ms > 0 ? 1 : 0) ? 'f' : ''}"></i>`).join('')}</span><span class="muted">${esc(L(MASTERY[ms]))}</span></div>`; })()}
      <div class="list">${lessonsHtml}${examHtml}</div></div>`;
  }).join('');
  const allMods = c.modules.every(m => examPassed(`${c.id}-${m.id}`));
  const fin = cc?.final;
  const finRec = examRec(`${c.id}-final`);
  return `
  <nav class="crumbs"><a href="#courses">${esc(t('tab_courses'))}</a><span>/</span><span>${esc(c.code)}</span></nav>
  <section class="card">
    <span class="eyebrow">${esc(c.code)}${c.step ? ` · ${esc(t('step'))} ${esc(c.step)}` : ''}</span>
    <h1>${esc(L(c.title))}</h1>
    <p>${esc(L(c.objective))}</p>
    <div class="list">
      <div class="item"><span class="grow"><span class="s">${esc(t('real_course'))}</span><span class="t">${realLink(c)}</span></span></div>
      <div class="item"><span class="grow"><span class="s">${esc(t('certificate'))}</span><span>${esc(L(c.real?.cert))}</span></span></div>
    </div>
    <p class="note">${esc(t('honour'))}</p>
  </section>
  ${mods}
  <section class="card"><h2>${esc(t('final_exam'))}</h2>
    ${fin ? (allMods ? `<a class="btn" href="#exam-${c.id}-final">${esc(finRec ? t('retake') : t('take_exam'))}</a>` : `<p class="muted">${esc(t('unlock_final'))}</p>`) : `<p class="muted">${esc(t('not_written'))}</p>`}
    ${finRec?.passedAt ? `<a class="btn" href="#cert-${c.id}">${esc(t('cert_ready'))}</a>` : ''}
    ${(cc?.mocks || []).map(mk => `<a class="item" href="#exam-${c.id}-${mk.id}"><span class="grow"><span class="t">${esc(L(mk.title))}</span><span class="s">${mk.questions.length} Q${mk.limit ? ` · ${mk.limit} ${esc(t('minutes'))}` : ''}</span></span></a>`).join('')}
  </section>`;
}

function qHTML(key, q, mode, chosen, reveal) {
  // mode: 'instant' shows feedback as soon as chosen; 'exam' only marks selection; 'result' shows all.
  const showFb = (mode === 'instant' && chosen != null) || mode === 'result';
  const opts = (q.options || []).map((o, i) => {
    let cls = '';
    if (showFb) { if (i === q.answer) cls = 'right'; else if (i === chosen) cls = 'wrong'; } else if (i === chosen) cls = 'sel';
    return `<button class="opt ${cls}" data-action="pick" data-key="${esc(key)}" data-i="${i}" ${showFb ? 'disabled' : ''}><span class="k">${'ABCDEFG'[i]}</span><span>${esc(L(o))}</span></button>`;
  }).join('');
  const fb = showFb ? `<div class="why ${chosen === q.answer ? 'good' : 'bad'}"><b>${esc(chosen === q.answer ? t('correct') : t('incorrect'))}</b>${md(q.why)}</div>` : '';
  return `<div class="q" data-qwrap="${esc(key)}"><div class="qtext">${md(q.q)}</div><div class="opts">${opts}</div>${fb}</div>`;
}
function practiceHTML(key, p) {
  if (p.options) return qHTML(key, p, 'instant', ui.answers[key]);
  const st = ui.practice[key] || {};
  return `<div class="q" data-qwrap="${esc(key)}"><div class="qtext">${md(p.q)}</div>
    <label class="field"><span class="muted">${esc(t('your_answer'))}</span><textarea data-key="${esc(key)}" data-action="practice-text">${esc(st.text || '')}</textarea></label>
    ${st.open ? `<div class="why"><b>${lang() === 'fr' ? 'Réponse' : 'Answer'}</b>${md(p.a)}${p.why ? md(p.why) : ''}</div>
      <div class="row"><button class="btn small ${st.self === 'y' ? 'primary' : ''}" data-action="self" data-key="${esc(key)}" data-v="y">${esc(t('got_it'))}</button><button class="btn small ${st.self === 'n' ? 'primary' : ''}" data-action="self" data-key="${esc(key)}" data-v="n">${esc(t('missed_it'))}</button></div>`
      : `<button class="btn small" data-action="reveal" data-key="${esc(key)}">${esc(t('show_answer'))}</button>`}
  </div>`;
}
function vLesson(r) {
  const f = findLesson(r.id);
  if (!f) return `<p class="empty">${esc(t('not_written'))}. <a href="#courses">${esc(t('tab_courses'))}</a></p>`;
  const { course: c, module: m, lesson: l, index, list } = f;
  const unlocked = moduleUnlocked(c, c.modules.indexOf(m));
  if (!unlocked) return `<p class="empty">${esc(t('pass_prev'))} <a href="#course-${c.id}">${esc(t('back_course'))}</a></p>`;
  const levels = ['easy', 'medium', 'hard'];
  const quizAnswered = (l.quiz || []).every(q => ui.answers[`${l.id}-${q.id}`] != null);
  const rec = state.progress.lessons[l.id];
  const nextL = list[index + 1];
  return `
  <nav class="crumbs"><a href="#courses">${esc(t('tab_courses'))}</a><span>/</span><a href="#course-${c.id}">${esc(c.code)}</a><span>/</span><span>${esc(L(m.title))}</span></nav>
  <article class="card lesson">
    <div class="stack"><span class="eyebrow">${esc(t('lesson'))} ${index + 1} ${esc(t('of_total'))} ${list.length} · <span class="mono">${l.minutes} ${esc(t('minutes'))}</span></span>
      <h1>${esc(L(l.title))}</h1>${l.pairs ? `<p class="small muted">${esc(t('pairs'))}: ${esc(L(l.pairs))}</p>` : ''}${frNote(l.core)}</div>
    <div class="block"><span class="label">${esc(t('hook'))}</span><div class="hook prose">${md(l.hook)}</div></div>
    <div class="block"><span class="label">${esc(t('core'))}</span><div class="prose">${md(l.core)}</div></div>
    ${sceneHTML(l)}
    <div class="block"><span class="label">${esc(t('analogy'))}</span><div class="analogy prose">${md(l.analogy)}</div></div>
    <div class="block"><span class="label">${esc(t('example'))}</span><div class="prose">${md(l.example)}</div></div>
    <div class="block"><span class="label">${esc(t('practice'))}</span>
      ${(l.practice || []).map((p, i) => `<div class="stack"><span class="pill plain">${esc(t(p.level || levels[i]))}</span>${practiceHTML(`${l.id}-p${i}`, p)}</div>`).join('<hr style="border:0;border-top:1px solid var(--line);width:100%">')}
    </div>
    <div class="block"><span class="label">${esc(t('quiz'))}</span>
      ${(l.quiz || []).map(q => qHTML(`${l.id}-${q.id}`, q, 'instant', ui.answers[`${l.id}-${q.id}`])).join('')}
    </div>
    ${teachHTML(l)}
    ${tutorHTML(l)}
    ${rec ? `<p class="pill good" style="align-self:flex-start">${esc(t('lesson_done'))} · ${Math.round((rec.score || 0) * 100)}%</p>` : ''}
    <div class="stack">
      <button class="btn primary block" data-action="finish-lesson" data-id="${esc(l.id)}" ${quizAnswered ? '' : 'disabled'}>${esc(t('finish_lesson'))}</button>
      ${quizAnswered ? '' : `<p class="note">${esc(t('answer_all'))}</p>`}
      ${nextL ? `<a class="link" href="#lesson-${esc(nextL.id)}">${esc(L(nextL.title))} →</a>` : `<a class="link" href="#course-${c.id}">${esc(t('back_course'))}</a>`}
    </div>
  </article>`;
}

function examDef(examId) {
  const [cid, ...rest] = examId.split('-'); const key = rest.join('-');
  const c = courseById(cid), cc = content[cid];
  if (!c || !cc) return null;
  if (key === 'final' && cc.final) return { c, title: T(`${c.code} · Final exam`, `${c.code} · Examen final`), questions: cc.final.questions, limit: cc.final.limit, kind: 'final' };
  const mk = (cc.mocks || []).find(x => x.id === key);
  if (mk) return { c, title: mk.title, questions: mk.questions, limit: mk.limit, kind: 'mock' };
  const m = c.modules.find(x => x.id === key);
  if (m && cc.modules?.[key]?.exam) return { c, m, title: T(`Module exam · ${L(m.title)}`, `Examen du module · ${L(m.title)}`), questions: cc.modules[key].exam.questions, limit: cc.modules[key].exam.limit, kind: 'module' };
  return null;
}
function vExam(r) {
  const d = examDef(r.id);
  if (!d) return `<p class="empty">${esc(t('not_written'))}</p>`;
  const ex = ui.exam && ui.exam.id === r.id ? ui.exam : null;
  const rec = examRec(r.id);
  const head = `<nav class="crumbs"><a href="#courses">${esc(t('tab_courses'))}</a><span>/</span><a href="#course-${d.c.id}">${esc(d.c.code)}</a></nav>`;
  if (!ex) {
    return `${head}<section class="card"><h1>${esc(L(d.title))}</h1>
      <p><span class="mono">${d.questions.length}</span> ${esc(t('exam_intro'))}${d.limit ? ` · ${esc(t('time_limit'))} <span class="mono">${d.limit} ${esc(t('minutes'))}</span>` : ''}</p>
      ${rec ? `<p class="muted">${esc(t('best'))} <span class="mono">${Math.round(rec.best * 100)}%</span>${rec.passedAt ? ` · ${esc(t('passed_on'))} ${esc(fmtDate(rec.passedAt.slice(0, 10)))}` : ''}</p>` : ''}
      <button class="btn primary block" data-action="exam-start" data-id="${esc(r.id)}">${esc(rec ? t('retake') : t('start_exam'))}</button></section>`;
  }
  if (ex.result) {
    const res = ex.result;
    const redo = [...new Set(ex.qs.filter((q, i) => ex.answers[i] !== q.answer && q.lesson).map(q => q.lesson))].map(id => findLesson(id)).filter(Boolean);
    return `${head}<section class="card"><span class="eyebrow">${esc(L(d.title))}</span>
      <div class="row"><span class="score">${Math.round(res.score * 100)}%</span>${res.score >= PASS ? `<span class="pill good">${esc(t('passed'))}</span>` : `<span class="pill warn">${lang() === 'fr' ? 'Pas encore' : 'Not yet'}</span>`}</div>
      <p>${esc(res.score >= PASS ? (d.kind === 'final' ? (lang() === 'fr' ? 'Réussi. Votre certificat Orbit est débloqué.' : 'Passed. Your Orbit certificate is unlocked.') : t('exam_pass')) : t('exam_fail'))}</p>
      ${res.score < PASS && redo.length ? `<div class="list">${redo.map(f => `<a class="item" href="#lesson-${esc(f.lesson.id)}"><span class="grow"><span class="t">${esc(L(f.lesson.title))}</span></span></a>`).join('')}</div>` : ''}
      <div class="row">${res.score >= PASS && d.kind === 'final' ? `<a class="btn primary" href="#cert-${d.c.id}">${esc(t('cert_ready'))}</a>` : `<a class="btn primary" href="#course-${d.c.id}">${esc(t('back_course'))}</a>`}<button class="btn" data-action="exam-start" data-id="${esc(r.id)}">${esc(t('retake'))}</button></div></section>
      <section class="card"><h2>${esc(t('review_answers'))}</h2>${ex.qs.map((q, i) => qHTML(`exam-${i}`, q, 'result', ex.answers[i])).join('<hr style="border:0;border-top:1px solid var(--line);width:100%">')}</section>`;
  }
  const i = ex.idx, q = ex.qs[i];
  return `${head}<section class="card">
    <div class="row between"><span class="eyebrow">${esc(L(d.title))}</span>${ex.limit ? `<span class="timer" id="exam-timer"></span>` : ''}</div>
    <div class="progress-dots">${ex.qs.map((_, k) => `<i class="${ex.answers[k] != null ? 'a' : ''} ${k === i ? 'c' : ''}"></i>`).join('')}</div>
    <span class="small muted mono">${i + 1} / ${ex.qs.length}</span>
    ${qHTML(`exam-${i}`, q, 'exam', ex.answers[i])}
    <div class="row between">
      <button class="btn" data-action="exam-prev" ${i === 0 ? 'disabled' : ''}>${esc(t('prev_q'))}</button>
      ${i < ex.qs.length - 1 ? `<button class="btn primary" data-action="exam-next">${esc(t('next_q'))}</button>`
      : `<button class="btn primary" data-action="exam-submit" ${ex.answers.every(a => a != null) ? '' : 'disabled'}>${esc(t('submit_exam'))}</button>`}
    </div></section>`;
}

const ivlOf = r => r ? (r.ivl != null ? r.ivl : (r.box != null ? REVIEW_STEPS[r.box] : 0)) : 0;
function nextIvl(r, g) { const i = ivlOf(r); return g === 'again' ? 1 : g === 'hard' ? Math.max(1, Math.round(i * 1.2) || 1) : g === 'good' ? Math.max(3, Math.round(i * 2.5)) : Math.max(5, Math.round(i * 3.5)); }
function vReview() {
  const mist = Object.entries(state.activity.mistakes || {}).filter(([, m]) => !m.fixed).map(([k]) => k);
  if (!ui.review) ui.review = { mode: 'due', queue: dueReviews().slice(0, 20), i: 0, chosen: null, right: 0, graded: false };
  const rv = ui.review;
  const live = rv.queue.filter(k => questionById(k));
  const head = `<section class="stack"><h1>${esc(t('review_title'))}</h1><p class="muted">${esc(lang() === 'fr' ? 'Après chaque bonne réponse, dites à quel point c’était facile : Orbit espace la question en conséquence. Les erreurs vont dans votre carnet d’erreurs.' : 'After each right answer, say how easy it felt: Orbit spaces the question to match. Misses go to your mistakes notebook.')}</p>
    <div class="seg" role="group"><button data-action="rv-mode" data-v="due" aria-pressed="${rv.mode === 'due'}">${esc(lang() === 'fr' ? 'À réviser' : 'Due')} · ${dueReviews().length}</button><button data-action="rv-mode" data-v="mistakes" aria-pressed="${rv.mode === 'mistakes'}">${esc(lang() === 'fr' ? 'Erreurs' : 'Mistakes')} · ${mist.length}</button></div></section>`;
  if (!live.length) return `${head}<p class="empty">${esc(rv.mode === 'due' ? t('nothing_due') : (lang() === 'fr' ? 'Aucune erreur en attente. Bien joué.' : 'No open mistakes. Well done.'))}</p>`;
  if (rv.i >= live.length) return `${head}<section class="card"><h2>${esc(t('review_done'))}</h2><p><span class="score">${rv.right}/${live.length}</span></p><a class="btn primary" href="#today">${esc(t('tab_today'))}</a></section>`;
  const key = live[rv.i], { q, lesson } = questionById(key);
  const ok = rv.chosen === q.answer, r = state.activity.reviews[key];
  const grades = ['hard', 'good', 'easy'].map(g => `<button class="btn" data-action="rv-grade" data-g="${g}">${esc({ hard: lang() === 'fr' ? 'Difficile' : 'Hard', good: lang() === 'fr' ? 'Bien' : 'Good', easy: lang() === 'fr' ? 'Facile' : 'Easy' }[g])}<small>${nextIvl(r, g)} ${esc(nextIvl(r, g) === 1 ? t('day') : t('days'))}</small></button>`).join('');
  return `${head}<section class="card">
    <span class="small muted mono">${rv.i + 1} / ${live.length} · ${esc(L(lesson.title))}</span>
    ${qHTML('review', q, 'instant', rv.chosen)}
    ${rv.chosen == null ? '' : ok && rv.mode === 'due' && !rv.graded ? `<div class="grade" style="grid-template-columns:repeat(3,1fr)">${grades}</div>` : `<button class="btn primary block" data-action="review-next">${esc(t('next'))}</button>`}
  </section>`;
}

function weekLogged(mon, kind) { const end = addDays(mon, 6); return Object.values(state.activity.logs).filter(l => !l.del && l.k === kind && l.d >= mon && l.d <= end).reduce((a, l) => a + (+l.m || 0), 0) / 60; }
function weekPlanned(mon) { let m = 0; for (let i = 0; i < 7; i++) m += mainMin(addDays(mon, i)); return m / 60; }
function vProgress() {
  const now = today(), mon = mondayOf(now);
  const lessons = Object.keys(state.progress.lessons).length;
  const exams = Object.values(state.progress.exams).filter(e => e.passedAt).length;
  const total = Object.values(state.activity.logs).filter(l => !l.del).reduce((a, l) => a + (+l.m || 0), 0) / 60;
  // 12-week chart
  const weeks = []; for (let k = 11; k >= 0; k--) { const m = addDays(mon, -7 * k); weeks.push({ m, p: weekPlanned(m), a: weekLogged(m, 'main') }); }
  const max = Math.max(4, ...weeks.map(w => Math.max(w.p, w.a)));
  const W = 640, H = 160, bw = (W - 40) / 12;
  const Y = v => H - 22 - (H - 40) * (v / max);
  const bars = weeks.map((w, k) => { const x = 36 + k * bw; return `<rect class="p" x="${x + 4}" y="${Y(w.p)}" width="${bw / 2 - 5}" height="${H - 22 - Y(w.p)}" rx="2"/><rect class="a" x="${x + bw / 2}" y="${Y(w.a)}" width="${bw / 2 - 5}" height="${H - 22 - Y(w.a)}" rx="2"/>${k % 3 === 2 || k === 11 ? `<text x="${x + bw / 2}" y="${H - 6}" text-anchor="middle">${esc(fmtDate(w.m, false))}</text>` : ''}`; }).join('');
  const gridY = [0, Math.round(max / 2), Math.round(max)].map(v => `<line class="g" x1="32" x2="${W}" y1="${Y(v)}" y2="${Y(v)}"/><text x="28" y="${Y(v) + 4}" text-anchor="end">${v}</text>`).join('');
  const logs = Object.entries(state.activity.logs).filter(([, l]) => !l.del).sort((a, b) => (b[1].d + b[1].at).localeCompare(a[1].d + a[1].at)).slice(0, 10);
  const itemName = l => { const s = STEPS.find(x => x.id === l.s) || EVENING.find(x => x.id === l.s); return s ? L(s.t) : l.s; };
  const certs = (catalog?.courses || []).filter(c => examPassed(`${c.id}-final`));
  return `
  <section class="stack"><h1>${esc(t('progress_title'))}</h1></section>
  <div class="grid2 grid4">
    <div class="card"><div class="stat"><b>${fmtH(weekLogged(mon, 'main'))}<span class="small muted"> / ${fmtH(weekPlanned(mon))} h</span></b><span>${esc(t('this_week'))} · ${esc(t('main_short'))}</span></div></div>
    <div class="card"><div class="stat"><b>${fmtH(total)} h</b><span>${esc(t('total_logged'))}</span></div></div>
    <div class="card"><div class="stat"><b>${lessons}</b><span>${esc(t('lessons_done'))}</span></div></div>
    <div class="card"><div class="stat"><b>${exams}</b><span>${esc(t('exams_passed'))}</span></div></div>
  </div>
  <section class="card chart"><h2>${esc(t('weekly_hours'))}</h2>
    <div class="legend"><span><i style="background:var(--line)"></i>${esc(t('planned'))}</span><span><i style="background:var(--accent)"></i>${esc(t('logged'))}</span></div>
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t('weekly_hours'))}">${gridY}${bars}</svg></section>
  <section class="card"><div class="section-title"><h2>${esc(t('weekly_title'))}</h2><a class="btn small" href="#weekly">${esc(t('open'))}</a></div>
    <p class="muted small">${esc(t('streak'))}: <span class="mono">${streak()}</span> ${esc(t('days'))}</p></section>
  <section class="card"><div class="section-title"><h2>${esc(t('recent_logs'))}</h2><button class="btn small" data-action="log">${esc(t('log_time'))}</button></div>
    ${logs.length ? `<div class="list">${logs.map(([id, l]) => `<div class="item"><span class="grow"><span class="t">${esc(itemName(l))}</span><span class="s"><span class="mono">${esc(fmtDate(l.d, false))} · ${l.m} ${esc(t('minutes'))}</span> · ${esc(l.k === 'main' ? t('main_short') : t('eve_short'))}</span></span><button class="link" data-action="del-log" data-id="${esc(id)}">${esc(t('delete'))}</button></div>`).join('')}</div>` : `<p class="muted">${esc(t('no_logs'))}</p>`}
  </section>
  <section class="card"><h2>${esc(t('certs'))}</h2>${certs.length ? `<div class="list">${certs.map(c => `<a class="item" href="#cert-${c.id}"><span class="grow"><span class="t">${esc(c.code)} · ${esc(L(c.title))}</span></span></a>`).join('')}</div>` : `<p class="muted small">${esc(t('cert_locked'))}</p>`}</section>`;
}

function vWeekly() {
  const now = today(), mon = mondayOf(now);
  const rec = state.progress.weekly[mon] || {};
  if (!ui.weeklyDraft || ui.weeklyDraft.mon !== mon) ui.weeklyDraft = { mon, ...clone(rec) };
  const w = ui.weeklyDraft;
  const pos = position();
  const lessonsWk = Object.values(state.progress.lessons).filter(x => { const d = ymd(new Date(x.at)); return d >= mon && d <= addDays(mon, 6); }).length;
  const past = Object.entries(state.progress.weekly).filter(([k]) => k !== mon).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 4);
  const box = (k, label) => `<label class="check"><input type="checkbox" data-action="wk-check" data-k="${k}" ${w[k] ? 'checked' : ''}> ${esc(label)}</label>`;
  return `
  <nav class="crumbs"><a href="#progress">${esc(t('tab_progress'))}</a></nav>
  <section class="stack"><h1>${esc(t('weekly_title'))}</h1><p class="muted">${esc(t('week_of'))} <span class="mono">${esc(fmtDate(mon))}</span></p></section>
  <div class="grid2">
    <div class="card"><div class="stat"><b>${fmtH(weekLogged(mon, 'main'))}<span class="small muted"> / ${fmtH(weekPlanned(mon))} h</span></b><span>${esc(t('main'))}</span></div></div>
    <div class="card"><div class="stat"><b>${lessonsWk}</b><span>${esc(t('lessons_done'))}</span></div></div>
  </div>
  <section class="card"><div class="row between"><span>${esc(t('step'))} ${pos.cur.n} · ${esc(L(pos.cur.t))}</span>${pill(pos.status)}</div></section>
  <section class="card">
    ${box('pitch', t('w_pitch'))}${box('bzwtp', t('w_bzwtp'))}${box('slots', t('w_slots'))}
    <label class="field" for="wk-fin">${esc(t('w_finished'))}<textarea id="wk-fin" data-action="wk-text" data-k="finished">${esc(w.finished || '')}</textarea></label>
    <label class="field" for="wk-slip">${esc(t('w_slipped'))}<textarea id="wk-slip" data-action="wk-text" data-k="slipped">${esc(w.slipped || '')}</textarea></label>
    <label class="field" for="wk-focus">${esc(t('w_focus'))}<textarea id="wk-focus" data-action="wk-text" data-k="focus">${esc(w.focus || '')}</textarea></label>
    <button class="btn primary block" data-action="wk-save">${esc(t('save_review'))}</button>
    ${rec.savedAt ? `<p class="note">${esc(t('saved'))} · ${esc(new Date(rec.savedAt).toLocaleString(lang() === 'fr' ? 'fr-FR' : 'en-GB'))}</p>` : ''}
  </section>
  ${past.length ? `<section class="card"><h2>${esc(t('past_reviews'))}</h2>${past.map(([k, v]) => `<details><summary>${esc(fmtDate(k))}</summary><div class="prose small">${v.finished ? `<p><b>${esc(t('w_finished'))}</b><br>${esc(v.finished)}</p>` : ''}${v.slipped ? `<p><b>${esc(t('w_slipped'))}</b><br>${esc(v.slipped)}</p>` : ''}${v.focus ? `<p><b>${esc(t('w_focus'))}</b><br>${esc(v.focus)}</p>` : ''}</div></details>`).join('')}</section>` : ''}`;
}

function vSettings() {
  if (!ui.slotsDraft) ui.slotsDraft = clone(state.settings.slots);
  const sd = ui.slotsDraft;
  const sum = k => DAYS.reduce((a, d) => a + (sd[d] || []).filter(s => s.k === k).reduce((x, s) => x + (+s.m || 0), 0), 0) / 60;
  const dayName = d => pd(addDays('2026-11-16', DAYS.indexOf(d))).toLocaleDateString(lang() === 'fr' ? 'fr-FR' : 'en-GB', { weekday: 'long' });
  const days = DAYS.map(d => `<div class="day"><div class="row between"><b style="text-transform:capitalize">${esc(dayName(d))}</b><button class="link" data-action="slot-add" data-d="${d}">+ ${esc(t('add_slot'))}</button></div>
    ${(sd[d] || []).length ? (sd[d] || []).map((s, i) => `<div class="slot">
      <select aria-label="${esc(t('kind'))}" data-action="slot-edit" data-d="${d}" data-i="${i}" data-f="k"><option value="main" ${s.k === 'main' ? 'selected' : ''}>${esc(t('main'))}</option><option value="eve" ${s.k === 'eve' ? 'selected' : ''}>${esc(t('eve'))}</option></select>
      <input type="time" aria-label="${esc(t('time'))}" value="${esc(s.t)}" data-action="slot-edit" data-d="${d}" data-i="${i}" data-f="t">
      <input type="number" min="15" max="600" step="15" aria-label="${esc(t('length'))}" value="${esc(s.m)}" data-action="slot-edit" data-d="${d}" data-i="${i}" data-f="m">
      <button class="x" aria-label="${esc(t('delete'))}" data-action="slot-del" data-d="${d}" data-i="${i}">×</button></div>`).join('') : `<p class="small muted">${esc(t('rest'))}</p>`}</div>`).join('');
  return `
  <section class="stack"><h1>${esc(t('settings'))}</h1></section>
  <section class="card"><h2>${esc(t('study_hours'))}</h2><p class="muted small">${esc(t('study_hours_lead'))}</p>
    <p class="mono">${esc(t('main'))}: ${fmtH(sum('main'))} h · ${esc(t('eve'))}: ${fmtH(sum('eve'))} h ${esc(t('per_week'))}</p>
    <div class="row small muted"><span style="flex:1">${esc(t('kind'))}</span><span style="flex:1">${esc(t('time'))}</span><span style="flex:1">${esc(t('length'))}</span><span style="width:44px"></span></div>
    ${days}
    <button class="btn primary block" data-action="slots-save">${esc(t('save_hours'))}</button>
    <button class="link" data-action="slots-reset">${esc(t('reset_hours'))}</button>
  </section>
  <section class="card"><h2>${esc(t('language'))}</h2>
    <div class="seg" role="group"><button data-action="set-lang" data-v="en" aria-pressed="${lang() === 'en'}">English</button><button data-action="set-lang" data-v="fr" aria-pressed="${lang() === 'fr'}">Français</button></div>
    <label class="field" for="name">${esc(t('your_name'))}<input id="name" type="text" value="${esc(state.settings.name)}" data-action="set-name"></label>
    <label class="field" for="startd">${esc(t('start_date'))}<input id="startd" type="date" value="${esc(state.settings.start)}" data-action="set-start"></label>
  </section>
  <section class="card"><h2>${esc(lang() === 'fr' ? 'Hors ligne et données' : 'Offline and data')}</h2>
    <p class="small muted">${esc(IN_CLAUDE ? (sync.refs.settings ? t('sync_note_ok') : t('sync_note_local')) : (lang() === 'fr' ? 'Version hors ligne : tout le contenu est gardé sur cet appareil et marche sans connexion. Vos progrès sont enregistrés ici ; utilisez Exporter/Importer pour les déplacer.' : 'Offline version: all content is stored on this device and works without a connection. Progress is saved here; use Export/Import to move it.'))}</p>
    ${ui.installEvt ? `<button class="btn" data-action="install">${esc(lang() === 'fr' ? 'Installer Orbit sur cet appareil' : 'Install Orbit on this device')}</button>` : ''}
    <label class="check"><input type="checkbox" data-action="saver" ${state.settings.saver ? 'checked' : ''}> ${esc(lang() === 'fr' ? 'Économie de données : animations 2D au lieu de la 3D' : 'Data saver: 2D animations instead of 3D')}</label>
    <div class="row"><button class="btn" data-action="export">${esc(lang() === 'fr' ? 'Exporter mes progrès' : 'Export my progress')}</button><button class="btn" data-action="import">${esc(lang() === 'fr' ? 'Importer des progrès' : 'Import progress')}</button><input type="file" id="import-file" accept="application/json,.json" hidden></div>
    <p class="note">${esc(lang() === 'fr' ? 'L’import fusionne : rien n’est effacé, le meilleur score et la date la plus récente gagnent.' : 'Import merges: nothing is erased; best scores and latest dates win.')}</p></section>`;
}

function certSVG(c, rec) {
  const name = state.settings.name || 'Joe Ryan Nibigira';
  const date = rec.passedAt ? pd(rec.passedAt.slice(0, 10)).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const hours = fmtH(loggedFor(c.id));
  const idc = `ORB-${c.id.toUpperCase()}-${(rec.passedAt || '').replace(/\D/g, '').slice(0, 8)}`;
  const f = 'IBM Plex Sans, Segoe UI, Helvetica, Arial, sans-serif';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 707" font-family="${f}">
    <rect width="1000" height="707" fill="#FFFFFF"/>
    <rect x="24" y="24" width="952" height="659" fill="none" stroke="#1D6A86" stroke-width="2"/>
    <rect x="36" y="36" width="928" height="635" fill="none" stroke="#D9E1E5" stroke-width="1"/>
    <g transform="translate(80 92)"><ellipse cx="22" cy="22" rx="20" ry="10.5" fill="none" stroke="#14232D" stroke-width="2.6" transform="rotate(-24 22 22)"/><circle cx="22" cy="22" r="5.2" fill="#14232D"/><circle cx="37" cy="14.8" r="3.4" fill="#1D6A86"/></g>
    <text x="140" y="124" font-size="26" font-weight="600" fill="#14232D">Orbit</text>
    <text x="920" y="124" font-size="14" text-anchor="end" fill="#A2382A" font-weight="600">UNOFFICIAL · NON OFFICIEL</text>
    <text x="80" y="220" font-size="18" fill="#56697A">Certificate of completion · Certificat de réussite</text>
    <text x="80" y="290" font-size="46" font-weight="600" fill="#14232D">${esc(name)}</text>
    <text x="80" y="345" font-size="18" fill="#56697A">completed the Orbit course · a terminé le cours Orbit</text>
    <text x="80" y="395" font-size="28" font-weight="600" fill="#1D6A86">${esc(c.code)} · ${esc(c.title.en)}</text>
    <text x="80" y="440" font-size="16" fill="#14232D">Final exam ${Math.round((rec.best || 0) * 100)}% · ${hours} h of study logged · Passed ${esc(date)}</text>
    <text x="80" y="468" font-size="16" fill="#56697A">Studied alongside: ${esc(L(c.real?.name))}</text>
    <line x1="80" y1="560" x2="920" y2="560" stroke="#D9E1E5"/>
    <text x="80" y="592" font-size="13" fill="#56697A">This certificate is issued by Orbit, a personal study app. It is not a credential from Google, Coursera, PMI, DeepLearning.AI, Anthropic or any school.</text>
    <text x="80" y="614" font-size="13" fill="#56697A">Ce certificat est délivré par Orbit, une application d’étude personnelle. Ce n’est pas un titre de Google, Coursera, du PMI ou d’une école.</text>
    <text x="920" y="648" font-size="12" text-anchor="end" fill="#56697A" font-family="IBM Plex Mono, Menlo, monospace">${esc(idc)}</text>
  </svg>`;
}
function vCert(r) {
  const c = courseById(r.id), rec = examRec(`${r.id}-final`);
  if (!c) return `<p class="empty">Course not found.</p>`;
  if (!rec?.passedAt) return `<nav class="crumbs"><a href="#course-${c.id}">${esc(c.code)}</a></nav><p class="empty">${esc(t('cert_locked'))}</p>`;
  return `<nav class="crumbs"><a href="#progress">${esc(t('tab_progress'))}</a><span>/</span><span>${esc(t('certificate'))}</span></nav>
  <section class="card cert"><h1>${esc(c.code)} · ${esc(t('certificate'))}</h1>${certSVG(c, rec)}<p class="note">${esc(t('cert_note'))}</p>
  <button class="btn primary" data-action="cert-png" data-id="${c.id}">${esc(t('download_png'))}</button></section>`;
}

/* ---------------------------------------------------------------- dialogs */
function openLog(prefillMin) {
  const pos = position(), now = today();
  const eve = eveningNow(now);
  const nowH = new Date().getHours();
  const guessEve = eve.length && slotsFor(now).some(s => s.k === 'eve' && Math.abs(+s.t.slice(0, 2) - nowH) <= 2);
  const d = $('#sheet');
  const opts = kind => kind === 'main'
    ? activeSteps().map(s => `<option value="${s.id}" ${s.id === pos.cur.id ? 'selected' : ''}>${s.n} · ${esc(L(s.t))}</option>`).join('')
    : EVENING.map(e => `<option value="${e.id}" ${eve[0]?.id === e.id ? 'selected' : ''}>${esc(L(e.t))}</option>`).join('');
  d.innerHTML = `<form class="sheet" method="dialog" id="log-form">
    <h2 id="sheet-title">${esc(t('log_title'))}</h2>
    <div class="seg" role="group"><button type="button" data-action="log-kind" data-v="main" aria-pressed="${!guessEve}">${esc(t('main'))}</button><button type="button" data-action="log-kind" data-v="eve" aria-pressed="${!!guessEve}">${esc(t('eve'))}</button></div>
    <label class="field" for="log-item">${esc(t('what'))}<select id="log-item">${opts(guessEve ? 'eve' : 'main')}</select></label>
    <label class="field" for="log-min">${esc(t('length'))}<input id="log-min" type="number" min="5" max="600" step="5" value="${prefillMin || 60}"></label>
    <div class="chips">${[30, 45, 60, 90, 120].map(m => `<button type="button" class="btn small" data-action="log-quick" data-v="${m}">${m}</button>`).join('')}</div>
    <label class="field" for="log-date">${esc(t('date'))}<input id="log-date" type="date" value="${now}" max="${now}"></label>
    <div class="row"><button type="submit" class="btn primary" value="save">${esc(t('save_log'))}</button><button type="button" class="btn" data-action="sheet-close">${esc(t('cancel'))}</button></div>
  </form>`;
  d.dataset.kind = guessEve ? 'eve' : 'main';
  d.dataset.opts = '';
  d._opts = opts;
  d.showModal();
  $('#log-form').addEventListener('submit', e => {
    e.preventDefault();
    const m = Math.round(+$('#log-min').value || 0);
    if (m < 1) return;
    state.activity.logs[uid()] = { d: $('#log-date').value || today(), m, k: d.dataset.kind, s: $('#log-item').value, at: Date.now() };
    persist('activity');
    store.del('orbit-timer');
    d.close();
    toast(`${t('logged_ok')} · ${m} ${t('minutes')}`);
    render();
  });
}
function tickTimer() {
  clearInterval(tickTimer.i);
  const tm = store.get('orbit-timer'); if (!tm) return;
  const upd = () => { const el = $('#timer-el'); if (!el) return clearInterval(tickTimer.i); const s = Math.floor((Date.now() - tm.start) / 1000); el.textContent = `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}`; };
  upd(); tickTimer.i = setInterval(upd, 15000);
}
function examTick() {
  clearInterval(examTick.i);
  const ex = ui.exam; if (!ex || !ex.limit || ex.result) return;
  const upd = () => {
    const left = ex.limit * 60 - Math.floor((Date.now() - ex.started) / 1000);
    const el = $('#exam-timer');
    if (left <= 0) { clearInterval(examTick.i); submitExam(true); return; }
    if (el) el.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
  };
  upd(); examTick.i = setInterval(upd, 1000);
}
function shuffle(a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
function submitExam() {
  const ex = ui.exam; if (!ex) return;
  const right = ex.qs.filter((q, i) => ex.answers[i] === q.answer).length;
  const [ecid, ...erest] = ex.id.split('-'); const emid = erest.join('-');
  ex.qs.forEach((q, i) => noteMistake(`${ecid}-${emid}-${q.id}`, ex.answers[i] !== q.answer));
  persist('activity');
  const score = right / ex.qs.length;
  ex.result = { score };
  const prev = state.progress.exams[ex.id] || { best: 0, attempts: 0, passedAt: null };
  state.progress.exams[ex.id] = { best: Math.max(prev.best || 0, score), attempts: (prev.attempts || 0) + 1, last: score, lastAt: Date.now(),
    passedAt: prev.passedAt || (score >= PASS ? new Date().toISOString() : null) };
  persist('progress');
  clearInterval(examTick.i);
  render().then(() => window.scrollTo(0, 0));
}
async function downloadCert(id) {
  const c = courseById(id), rec = examRec(`${id}-final`);
  const svg = certSVG(c, rec);
  const img = new Image();
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  img.onload = () => {
    const cv = document.createElement('canvas'); cv.width = 2000; cv.height = 1414;
    const cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height); cx.drawImage(img, 0, 0, cv.width, cv.height);
    URL.revokeObjectURL(url);
    cv.toBlob(b => saveFile(`orbit-certificate-${id}.png`, b), 'image/png');
  };
  img.src = url;
}


/* ---------------------------------------------------------------- lesson extras: partial updates, scenes, teach-back, tutor */
function findLessonByKey(key) {
  const m = key.match(/^(.*)-(p\d+|q\d+)$/); if (!m) return null;
  const f = findLesson(m[1]); if (!f) return null;
  if (m[2][0] === 'p') return { ...f, isQuiz: false, p: f.lesson.practice[+m[2].slice(1)] };
  return { ...f, isQuiz: true, q: (f.lesson.quiz || []).find(q => q.id === m[2]) };
}
function patchQuestion(key) {
  const f = findLessonByKey(key), el = document.querySelector(`[data-qwrap="${CSS.escape(key)}"]`);
  if (!f || !el) { render(); return; }
  const html = f.isQuiz ? qHTML(key, f.q, 'instant', ui.answers[key]) : practiceHTML(key, f.p);
  const tmp = document.createElement('div'); tmp.innerHTML = html; const nu = tmp.firstElementChild;
  el.replaceWith(nu);
  const fb = nu.querySelector('.why'); if (fb && !REDUCED) fb.animate([{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: 'cubic-bezier(0.23,1,0.32,1)' });
  const all = (f.lesson.quiz || []).every(q => ui.answers[`${f.lesson.id}-${q.id}`] != null);
  const btn = document.querySelector('[data-action="finish-lesson"]'); if (btn && all) { btn.disabled = false; btn.nextElementSibling?.classList.contains('note') && btn.nextElementSibling.remove(); }
}
ui.sceneDefs = {}; ui.sceneCleanups = []; ui.chats = {};
function sceneHTML(l) {
  const list = l.scenes || (l.scene ? [l.scene] : []);
  if (!list.length) return '';
  return `<div class="block"><span class="label">${esc(lang() === 'fr' ? 'Voir en mouvement' : 'See it move')}</span>${list.map((sc, i) => { const k = `${l.id}-s${i}`; ui.sceneDefs[k] = sc; return `<figure class="scene" data-scene-key="${k}"><div class="scene-mount"><p class="small muted">${esc(lang() === 'fr' ? 'Chargement de l’animation…' : 'Loading the animation…')}</p></div>${sc.caption ? `<figcaption>${esc(L(sc.caption))}${['orbit3d', 'prism3d'].includes(sc.type) && !state.settings.saver ? ` · ${esc(lang() === 'fr' ? 'faites glisser pour tourner' : 'drag to rotate')}` : ''}</figcaption>` : ''}</figure>`; }).join('')}</div>`;
}
let scenesP = null;
function loadScenes() { if (window.OrbitScenes) return Promise.resolve(); if (!scenesP) scenesP = new Promise((res, rej) => { const sc = document.createElement('script'); sc.src = 'js/scenes.js'; sc.onload = res; sc.onerror = rej; document.head.appendChild(sc); }); return scenesP; }
function cleanupScenes() { ui.sceneCleanups.forEach(f => { try { f(); } catch { /* ignore */ } }); ui.sceneCleanups = []; }
function mountScenes() {
  const figs = document.querySelectorAll('[data-scene-key]'); if (!figs.length) return;
  loadScenes().then(() => figs.forEach(fig => {
    if (!fig.isConnected) return;
    const def = ui.sceneDefs[fig.dataset.sceneKey]; const mount = fig.querySelector('.scene-mount');
    ui.sceneCleanups.push(window.OrbitScenes.mount(mount, def, { lang: lang(), reduced: REDUCED, saver: !!state.settings.saver, L }));
  })).catch(() => figs.forEach(f => { f.querySelector('.scene-mount').innerHTML = `<p class="small muted">${esc(lang() === 'fr' ? 'Animation indisponible hors ligne pour l’instant.' : 'Animation not available offline yet.')}</p>`; }));
}
function keyIdeas(l) { return [...new Set((L(l.core).match(/\*\*(.+?)\*\*/g) || []).map(x => x.slice(2, -2).replace(/[:.]$/, '')))].slice(0, 6); }
function teachHTML(l) {
  const saved = state.progress.teach?.[l.id]?.text || '';
  const keys = keyIdeas(l);
  return `<div class="block"><span class="label">${esc(lang() === 'fr' ? 'Expliquez-le à votre tour' : 'Teach it back')}</span>
    <p class="small muted">${esc(lang() === 'fr' ? 'Expliquez l’idée en 2–3 phrases, comme à un membre de votre équipe. C’est la façon la plus sûre de vérifier que vous avez compris.' : 'Explain the idea in 2–3 sentences, as you would to someone on your team. It is the surest test that you understood it.')}</p>
    <textarea id="teach-${esc(l.id)}" aria-label="${esc(lang() === 'fr' ? 'Votre explication' : 'Your explanation')}">${esc(saved)}</textarea>
    ${keys.length ? `<p class="small muted">${esc(lang() === 'fr' ? 'Avez-vous utilisé :' : 'Did you use:')} ${keys.map(k => `<span class="pill plain">${esc(k)}</span>`).join(' ')}</p>` : ''}
    <div class="row"><button class="btn small" data-action="teach-save" data-id="${esc(l.id)}">${esc(t('saved') === 'Saved' ? 'Save' : 'Enregistrer')}</button>
    <button class="btn small" data-action="teach-ai" data-id="${esc(l.id)}" data-needs-sample hidden>${esc(lang() === 'fr' ? 'Avis du tuteur' : 'Get tutor feedback')}</button></div>
    <div class="why" id="teach-out-${esc(l.id)}" hidden></div></div>`;
}
function tutorHTML(l) {
  return `<details class="card flat" data-needs-sample hidden><summary>${esc(lang() === 'fr' ? 'Demander au tuteur' : 'Ask the tutor')}</summary>
    <p class="small muted">${esc(lang() === 'fr' ? 'Questions sur cette leçon. Le tuteur explique la méthode mais ne donne jamais de réponses aux évaluations notées.' : 'Ask about this lesson. The tutor explains the method but never gives answers to graded assessments.')}</p>
    <div class="chat" id="chat-${esc(l.id)}"></div>
    <textarea id="ask-${esc(l.id)}" aria-label="${esc(lang() === 'fr' ? 'Votre question' : 'Your question')}"></textarea>
    <button class="btn small" data-action="tutor-send" data-id="${esc(l.id)}">${esc(lang() === 'fr' ? 'Envoyer' : 'Send')}</button></details>`;
}
let sampleP = null;
function getSample() { if (!IN_CLAUDE) return Promise.resolve(null); if (!sampleP) sampleP = window.claude.use('sample').catch(() => null); return sampleP; }
function wireLessonExtras() { getSample().then(sm => { if (sm) document.querySelectorAll('[data-needs-sample]').forEach(e => { e.hidden = false; }); }); }
const VENTURES = 'Osvion Studio (web/marketing agency), JR Events (events, Fancy Fridays), BZWTP (zero-waste programme in Bujumbura), PrimeCleanSolutions, Burux (solar), Genda (electric taxi app), Van Beach Resort (client), and his AI projects Survivor (earn-or-die agent), ANGE Noée (personal assistant) and a Python paper-trading bot';
function lessonContext(l) { return `Lesson: ${L(l.title)}\nCore idea:\n${L(l.core)}\nWorked example:\n${L(l.example)}`; }
const sampleErr = e => ({ not_granted: lang() === 'fr' ? 'Le tuteur n’est pas autorisé dans cette vue.' : 'The tutor is not allowed in this view.', rate_limited: lang() === 'fr' ? 'Trop de demandes. Réessayez dans un moment.' : 'Too many requests. Try again in a moment.' }[e?.code] || (lang() === 'fr' ? 'Le tuteur n’a pas pu répondre. Réessayez.' : 'The tutor could not answer. Try again.'));
async function teachFeedback(id) {
  const f = findLesson(id), sm = await getSample(); if (!f || !sm) return;
  const text = $('#teach-' + CSS.escape(id))?.value.trim(); const out = $('#teach-out-' + CSS.escape(id));
  if (!text) { toast(lang() === 'fr' ? 'Écrivez d’abord votre explication.' : 'Write your explanation first.'); return; }
  state.progress.teach[id] = { text: text.slice(0, 2000), at: Date.now() }; persist('progress');
  out.hidden = false; out.textContent = lang() === 'fr' ? 'Le tuteur lit…' : 'The tutor is reading…';
  const prompt = `You are Orbit, a demanding but kind tutor for Joe, a 24-year-old founder in Bujumbura. Reply in ${lang() === 'fr' ? 'French' : 'English'}, plain text, at most 110 words.\n\n${lessonContext(f.lesson)}\n\nJoe's teach-back (his own explanation):\n"""${text}"""\n\nGive: 1) one line on what he got right; 2) at most 3 short bullets naming anything missing or wrong, each tied to the lesson; 3) one probing question that makes him apply the idea to one of his ventures. Do not rewrite his answer for him.`;
  try { await sm(prompt, { cache: false, onText: ({ text: tx }) => { out.textContent = tx; } }); } catch (e) { out.textContent = e?.text || sampleErr(e); }
}
async function tutorSend(id) {
  const f = findLesson(id), sm = await getSample(); if (!f || !sm) return;
  const box = $('#ask-' + CSS.escape(id)), chat = $('#chat-' + CSS.escape(id)); const q = box.value.trim(); if (!q) return;
  const turns = ui.chats[id] || (ui.chats[id] = []);
  turns.push({ role: 'user', content: q }); box.value = '';
  const me = document.createElement('div'); me.className = 'msg me'; me.textContent = q; chat.appendChild(me);
  const ai = document.createElement('div'); ai.className = 'msg ai'; ai.textContent = lang() === 'fr' ? 'Réflexion…' : 'Thinking…'; chat.appendChild(ai); chat.scrollTop = chat.scrollHeight;
  const RULES = `You are Orbit's tutor for one lesson. Learner: Joe, founder in Bujumbura (French first, fluent English). His ventures: ${VENTURES}. Reply in ${lang() === 'fr' ? 'French' : 'English'}, plain text, at most 150 words, one idea at a time, using his ventures as examples. Teach Socratically: when he is stuck, give a hint before the answer. HONOUR RULE: if he asks for answers to a graded Coursera, PMI/CAPM or Claude Academy assessment or capstone, refuse that part kindly and teach the method on a parallel example instead.\n\n${lessonContext(f.lesson)}`;
  try {
    const { text } = await sm([{ role: 'user', content: RULES }, ...turns.slice(-8)], { cache: false, onText: ({ text: tx }) => { ai.textContent = tx; chat.scrollTop = chat.scrollHeight; } });
    turns.push({ role: 'assistant', content: text });
  } catch (e) { ai.textContent = e?.text || sampleErr(e); turns.pop(); }
}
async function saveFile(name, blob) {
  if (IN_CLAUDE) {
    const dl = await window.claude.use('downloads').catch(() => null);
    if (!dl) { toast(t('downloads_off')); return; }
    dl.save({ filename: name, data: blob }).catch(e => { if (e?.code !== 'declined') toast(t('download_failed')); });
    return;
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
document.addEventListener('change', e => {
  if (e.target.id !== 'import-file' || !e.target.files?.[0]) return;
  const fr = new FileReader();
  fr.onload = () => {
    try {
      const inc = JSON.parse(fr.result);
      if (!inc.progress || !inc.activity) throw new Error('bad');
      for (const n of ['progress', 'activity']) state[n] = merge[n](state[n], inc[n]);
      if (inc.settings) state.settings = merge.settings(state.settings, inc.settings);
      ['settings', 'progress', 'activity'].forEach(persist);
      toast(lang() === 'fr' ? 'Progrès importés et fusionnés.' : 'Progress imported and merged.'); render();
    } catch { toast(lang() === 'fr' ? 'Ce fichier n’est pas une sauvegarde Orbit.' : 'That file is not an Orbit backup.'); }
  };
  fr.readAsText(e.target.files[0]);
});
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); ui.installEvt = e; if (route().name === 'prefs') render(); });
if (!IN_CLAUDE && 'serviceWorker' in navigator && /^https?:/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => { /* offline mode unavailable */ });

/* ---------------------------------------------------------------- events */
document.addEventListener('click', async e => {
  const el = e.target.closest('[data-action]'); if (!el) return;
  const a = el.dataset.action;
  if (['practice-text', 'wk-text', 'slot-edit', 'set-name', 'set-start'].includes(a)) return;
  if (a === 'pick') {
    const key = el.dataset.key, i = +el.dataset.i;
    if (key.startsWith('exam-')) { ui.exam.answers[ui.exam.idx] = i; render(); return; }
    if (key === 'review') {
      const rv = ui.review; if (rv.chosen != null) return; rv.chosen = i;
      const live = rv.queue.filter(k => questionById(k)); const qk = live[rv.i]; const { q } = questionById(qk);
      const ok = i === q.answer; if (ok) rv.right++;
      noteMistake(qk, !ok);
      if (!ok && rv.mode === 'due') state.activity.reviews[qk] = { ivl: 1, due: addDays(today(), 1), at: Date.now() };
      bumpDay('r'); persist('activity'); render(); return;
    }
    if (ui.answers[key] != null) return;
    ui.answers[key] = i;
    const f = findLessonByKey(key);
    if (f && f.isQuiz) { noteMistake(key, i !== f.q.answer); persist('activity'); }
    patchQuestion(key); return;
  }
  if (a === 'reveal') { ui.practice[el.dataset.key] = { ...(ui.practice[el.dataset.key] || {}), open: true }; patchQuestion(el.dataset.key); return; }
  if (a === 'self') { ui.practice[el.dataset.key] = { ...(ui.practice[el.dataset.key] || {}), self: el.dataset.v }; patchQuestion(el.dataset.key); return; }
  if (a === 'rv-mode') {
    const mode = el.dataset.v;
    const queue = mode === 'due' ? dueReviews().slice(0, 20) : Object.entries(state.activity.mistakes || {}).filter(([, m]) => !m.fixed).map(([k]) => k).slice(0, 20);
    ui.review = { mode, queue, i: 0, chosen: null, right: 0, graded: false }; render(); return;
  }
  if (a === 'rv-grade') {
    const rv = ui.review, live = rv.queue.filter(k => questionById(k)), qk = live[rv.i], r = state.activity.reviews[qk];
    const ivl = nextIvl(r, el.dataset.g);
    state.activity.reviews[qk] = { ivl, due: addDays(today(), ivl), at: Date.now() };
    persist('activity'); rv.i++; rv.chosen = null; render(); return;
  }
  if (a === 'saver') { state.settings.saver = el.checked; persist('settings'); return; }
  if (a === 'teach-ai') { teachFeedback(el.dataset.id); return; }
  if (a === 'tutor-send') { tutorSend(el.dataset.id); return; }
  if (a === 'teach-save') { const tx = $('#teach-' + CSS.escape(el.dataset.id)); if (tx) { state.progress.teach[el.dataset.id] = { text: tx.value.slice(0, 2000), at: Date.now() }; persist('progress'); toast(t('saved')); } return; }
  if (a === 'install') { if (ui.installEvt) { ui.installEvt.prompt(); ui.installEvt = null; render(); } return; }
  if (a === 'import') { $('#import-file')?.click(); return; }
  if (a === 'finish-lesson') {
    const f = findLesson(el.dataset.id); if (!f) return;
    const qs = f.lesson.quiz || [];
    const right = qs.filter(q => ui.answers[`${f.lesson.id}-${q.id}`] === q.answer).length;
    const score = qs.length ? right / qs.length : 1;
    const had = state.progress.lessons[f.lesson.id];
    state.progress.lessons[f.lesson.id] = { at: had?.at || Date.now(), score: Math.max(had?.score || 0, score) };
    for (const q of qs) { const k = `${f.lesson.id}-${q.id}`; if (!state.activity.reviews[k]) state.activity.reviews[k] = { box: 0, due: addDays(today(), 1), at: Date.now() }; }
    if (!had) bumpDay('l');
    persist('progress'); persist('activity');
    toast(`${t('lesson_done')} · ${Math.round(score * 100)}%`);
    const nx = f.list[f.index + 1];
    location.hash = nx ? `#lesson-${nx.id}` : `#course-${f.course.id}`;
    return;
  }
  if (a === 'exam-start') {
    const d = examDef(el.dataset.id); if (!d) return;
    const qs = d.kind === 'mock' ? d.questions : shuffle(d.questions);
    ui.exam = { id: el.dataset.id, qs, idx: 0, answers: qs.map(() => null), started: Date.now(), limit: d.limit || 0, result: null };
    await render(); examTick(); return;
  }
  if (a === 'exam-next') { ui.exam.idx = Math.min(ui.exam.idx + 1, ui.exam.qs.length - 1); render(); return; }
  if (a === 'exam-prev') { ui.exam.idx = Math.max(ui.exam.idx - 1, 0); render(); return; }
  if (a === 'exam-submit') { submitExam(); return; }
  if (a === 'review-next') { ui.review.i++; ui.review.chosen = null; ui.review.graded = false; render(); return; }
  if (a === 'log') { openLog(); return; }
  if (a === 'log-quick') { $('#log-min').value = el.dataset.v; return; }
  if (a === 'log-kind') {
    const d = $('#sheet'); d.dataset.kind = el.dataset.v;
    d.querySelectorAll('[data-action="log-kind"]').forEach(b => b.setAttribute('aria-pressed', b === el));
    $('#log-item').innerHTML = d._opts(el.dataset.v); return;
  }
  if (a === 'sheet-close') { $('#sheet').close(); return; }
  if (a === 'timer-start') { store.set('orbit-timer', { start: Date.now() }); render(); return; }
  if (a === 'timer-stop') { const tm = store.get('orbit-timer'); const min = tm ? Math.max(5, Math.round((Date.now() - tm.start) / 60000)) : 60; openLog(min); return; }
  if (a === 'del-log') { const l = state.activity.logs[el.dataset.id]; if (l) { l.del = true; persist('activity'); render(); } return; }
  if (a === 'toggle-opt') { state.settings.optional = el.checked; persist('settings'); render(); return; }
  if (a === 'set-lang') { state.settings.lang = el.dataset.v; persist('settings'); render(); return; }
  if (a === 'slot-add') { (ui.slotsDraft[el.dataset.d] ||= []).push({ k: 'main', t: '13:00', m: 60 }); render(); return; }
  if (a === 'slot-del') { ui.slotsDraft[el.dataset.d].splice(+el.dataset.i, 1); render(); return; }
  if (a === 'slots-reset') { ui.slotsDraft = clone(DEFAULT_SLOTS); render(); return; }
  if (a === 'slots-save') { state.settings.slots = clone(ui.slotsDraft); persist('settings'); toast(t('saved')); render(); return; }
  if (a === 'wk-check') { ui.weeklyDraft[el.dataset.k] = el.checked; return; }
  if (a === 'wk-save') { const w = { ...ui.weeklyDraft }; const mon = w.mon; delete w.mon; state.progress.weekly[mon] = { ...w, savedAt: Date.now() }; persist('progress'); toast(t('saved')); render(); return; }
  if (a === 'cert-png') { downloadCert(el.dataset.id); return; }
  if (a === 'export') {
    saveFile(`orbit-backup-${today()}.json`, new Blob([JSON.stringify(state)], { type: 'application/json' }));
  }
});
document.addEventListener('input', e => {
  const el = e.target, a = el.dataset?.action;
  if (a === 'practice-text') ui.practice[el.dataset.key] = { ...(ui.practice[el.dataset.key] || {}), text: el.value };
  if (a === 'wk-text') ui.weeklyDraft[el.dataset.k] = el.value;
});
document.addEventListener('change', e => {
  const el = e.target, a = el.dataset?.action;
  if (a === 'slot-edit') { const s = ui.slotsDraft[el.dataset.d][+el.dataset.i]; s[el.dataset.f] = el.dataset.f === 'm' ? Math.max(15, Math.round(+el.value || 15)) : el.value; render(); }
  if (a === 'set-name') { state.settings.name = el.value.trim().slice(0, 80) || 'Joe Ryan Nibigira'; persist('settings'); }
  if (a === 'set-start' && /^\d{4}-\d{2}-\d{2}$/.test(el.value)) { state.settings.start = el.value; persist('settings'); }
});
$('#lang').addEventListener('click', () => { state.settings.lang = lang() === 'fr' ? 'en' : 'fr'; persist('settings'); render(); });

/* ---------------------------------------------------------------- boot */
setSync('wait');
render().then(() => startSync());
})();
