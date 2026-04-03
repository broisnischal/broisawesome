import { useEffect, useRef, useState } from 'react';
import { useNavigation } from 'react-router';
import { useSpinDelay } from 'spin-delay';
import { cn } from '../lib/utils';

// Progress Bar
export default function ProgessBar() {
  const navigation = useNavigation();
  const busy = navigation.state !== 'idle';

  const delayedPending = useSpinDelay(busy, {
    delay: 600,
    minDuration: 400,
  });

  const ref = useRef<HTMLDivElement>(null);
  const [animationComplete, setAnimationComplete] = useState(true);

  useEffect(() => {
    if (!ref.current) return;
    if (delayedPending) setAnimationComplete(false);

    const animationPromises = ref.current
      .getAnimations()
      .map(({ finished }) => finished);

    Promise.allSettled(animationPromises).then(() => {
      if (!delayedPending) setAnimationComplete(true);
    });
  }, [delayedPending]);

  const showBar = delayedPending || !animationComplete;
  if (!showBar) return null;

  return (
    <div
      role="progressbar"
      aria-hidden={delayedPending ? undefined : true}
      aria-valuetext={delayedPending ? 'Loading' : undefined}
      className="fixed inset-x-0 left-0 top-0 z-[999] h-[0.20rem]"
    >
      <div
        ref={ref}
        className={cn(
          'h-full w-0 bg-blue-500 duration-500 ease-in-out dark:bg-white',
          navigation.state === 'idle' &&
          (animationComplete
            ? 'transition-none'
            : 'w-full opacity-0 transition-all'),
          delayedPending && navigation.state === 'submitting' && 'w-5/12',
          delayedPending && navigation.state === 'loading' && 'w-8/12',
        )}
      />
    </div>
  );
}
