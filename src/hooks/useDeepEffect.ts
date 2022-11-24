import { useEffect, useRef } from 'react';
import deepEqual from 'fast-deep-equal/es6/react';

const isPrimitive = (value: number | string) =>
  ['number', 'string', 'boolean'].includes(typeof value);

const warnDeps = (dependencies: any[]) => {
  if (dependencies.length === 0) {
    console.warn('useDeepEffect should not be used with no dependencies. Use useEffect instead.');
  }

  if (dependencies.every(isPrimitive)) {
    console.warn('useDeepEffect should not be used with primitive values. Use useEffect instead.');
  }
};

const getTriggerDeps = (dependencies: any[], comparisonFn: Function): number[] => {
  const ref = useRef<React.DependencyList>(); // eslint-disable-line react-hooks/rules-of-hooks
  const triggerDeps = useRef<number>(0); // eslint-disable-line react-hooks/rules-of-hooks

  if (!comparisonFn(dependencies, ref.current)) {
    ref.current = dependencies;
    triggerDeps.current = Math.random();
  }

  return [triggerDeps.current];
};

const useDeepEffect = (
  fn: React.EffectCallback,
  dependencies: any[] = [],
  comparisonFn: Function = deepEqual
): void => {
  if (process.env.NODE_ENV !== 'production') {
    warnDeps(dependencies);
  }

  return useEffect(fn, getTriggerDeps(dependencies, comparisonFn)); // eslint-disable-line react-hooks/exhaustive-deps
};

export default useDeepEffect;
