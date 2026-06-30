const withInstantScrollBehavior = (callback: () => void) => {
  const root = document.documentElement;
  const body = document.body;
  const previousRootBehavior = root.style.scrollBehavior;
  const previousBodyBehavior = body.style.scrollBehavior;

  root.style.scrollBehavior = 'auto';
  body.style.scrollBehavior = 'auto';
  callback();
  root.style.scrollBehavior = previousRootBehavior;
  body.style.scrollBehavior = previousBodyBehavior;
};

let restoreSmoothTimer: number | undefined;

export const runWithNativeSmoothDisabled = (callback: () => void, restoreDelay = 0) => {
  const root = document.documentElement;
  const body = document.body;
  const previousRootBehavior = root.style.scrollBehavior;
  const previousBodyBehavior = body.style.scrollBehavior;

  if (restoreSmoothTimer) {
    window.clearTimeout(restoreSmoothTimer);
  }

  root.style.scrollBehavior = 'auto';
  body.style.scrollBehavior = 'auto';
  callback();

  restoreSmoothTimer = window.setTimeout(() => {
    root.style.scrollBehavior = previousRootBehavior;
    body.style.scrollBehavior = previousBodyBehavior;
    restoreSmoothTimer = undefined;
  }, restoreDelay);
};

export const cancelActiveScroll = () => {
  document.dispatchEvent(new WheelEvent('wheel', { deltaY: 0, cancelable: true }));

  withInstantScrollBehavior(() => {
    window.scrollTo({ top: window.scrollY, left: window.scrollX, behavior: 'auto' });
  });
};

export const jumpToTopWithoutAnimation = () => {
  cancelActiveScroll();

  withInstantScrollBehavior(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  });
};

let pendingScrollTarget: string | null = null;

export const setPendingScrollTarget = (target: string) => {
  pendingScrollTarget = target;
};

export const consumePendingScrollTarget = () => {
  const target = pendingScrollTarget;
  pendingScrollTarget = null;
  return target;
};

export const jumpToElementWithoutAnimation = (targetId: string, offset = 0) => {
  cancelActiveScroll();

  const target = document.getElementById(targetId);
  if (!target) return;

  withInstantScrollBehavior(() => {
    // Calcul de la position pure (layout) ignorant les transforms CSS
    let top = 0;
    let el: HTMLElement | null = target;
    while (el) {
      top += el.offsetTop;
      el = el.offsetParent as HTMLElement | null;
    }
    top += offset;
    window.scrollTo({ top: Math.max(0, top), left: 0, behavior: 'auto' });
  });
};
