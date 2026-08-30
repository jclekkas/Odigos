import type { ReactNode } from 'react';
import { Shell } from './primitives';

/**
 * The closing call to action. Rendered on the deep primary ground, which is the
 * only place in the system that colour is used at full strength — it marks
 * "this is the end of the page and here is the one thing to do next".
 */
export function CTASection({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  children?: ReactNode;
}) {
  return (
    <section className="on-dark bg-primary-deep py-14 text-white sm:py-16">
      <Shell>
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.13em] text-white/70">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-fluid-h2 font-semibold text-white">{title}</h2>
          {body ? (
            <p className="mt-4 max-w-measure text-fluid-lead leading-relaxed text-white/85">{body}</p>
          ) : null}
          {children ? <div className="mt-7 flex flex-wrap gap-3">{children}</div> : null}
        </div>
      </Shell>
    </section>
  );
}
