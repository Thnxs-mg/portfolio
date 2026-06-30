/**
 * Préchargement des chunks lazy-loadés.
 * À appeler au survol des liens de navigation pour éliminer
 * la latence de chargement lors du premier clic.
 */

// Cache pour éviter des imports en double
let allProjectsPreloaded = false;

export const preloadAllProjects = (): void => {
  if (allProjectsPreloaded) return;
  allProjectsPreloaded = true;
  import('../components/Sections/AllProject');
};
