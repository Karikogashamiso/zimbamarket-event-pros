import { useRef, useCallback, useMemo } from 'react';

// Debounce utility for performance optimization
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle utility for performance optimization
export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

// Hook for stable callback references
export const useStableCallback = <T extends (...args: any[]) => any>(
  callback: T
): T => {
  const ref = useRef<T>(callback);
  ref.current = callback;
  
  return useCallback((...args: any[]) => ref.current(...args), []) as T;
};

// Hook for memoizing expensive computations
export const useDeepMemo = <T>(
  factory: () => T,
  deps: React.DependencyList
): T => {
  const ref = useRef<{ deps: React.DependencyList; value: T }>();
  
  if (!ref.current || !depsEqual(ref.current.deps, deps)) {
    ref.current = { deps, value: factory() };
  }
  
  return ref.current.value;
};

// Deep equality check for dependencies
const depsEqual = (
  deps1: React.DependencyList,
  deps2: React.DependencyList
): boolean => {
  if (deps1.length !== deps2.length) return false;
  
  for (let i = 0; i < deps1.length; i++) {
    if (deps1[i] !== deps2[i]) return false;
  }
  
  return true;
};

// Image lazy loading optimization
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
): IntersectionObserver => {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };
  
  return new IntersectionObserver(callback, defaultOptions);
};

// Memory cleanup utilities
export const cleanup = {
  intervals: new Set<NodeJS.Timeout>(),
  timeouts: new Set<NodeJS.Timeout>(),
  observers: new Set<IntersectionObserver>(),
  
  addInterval: (id: NodeJS.Timeout) => {
    cleanup.intervals.add(id);
  },
  
  addTimeout: (id: NodeJS.Timeout) => {
    cleanup.timeouts.add(id);
  },
  
  addObserver: (observer: IntersectionObserver) => {
    cleanup.observers.add(observer);
  },
  
  clearAll: () => {
    cleanup.intervals.forEach(clearInterval);
    cleanup.timeouts.forEach(clearTimeout);
    cleanup.observers.forEach(observer => observer.disconnect());
    
    cleanup.intervals.clear();
    cleanup.timeouts.clear();
    cleanup.observers.clear();
  }
};

// Performance monitoring utilities
export const measureRenderTime = (componentName: string) => {
  const start = performance.now();
  
  return () => {
    const end = performance.now();
    const renderTime = end - start;
    
    if (renderTime > 16) { // More than one frame at 60fps
      console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
  };
};

// Bundle size monitoring
export const logBundleInfo = (componentName: string, size?: number) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Component loaded: ${componentName}${size ? ` (${size}kb)` : ''}`);
  }
};