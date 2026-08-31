import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '@/components/Primitives';
import { Photo } from '@/components/Photo';
import { Dots } from '@/components/Doodles';

export function PageHero({
  eyebrow,
  title,
  lede,
  photo,
  actions,
  breadcrumbs,
  aside,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  photo: string;
  actions?: ReactNode;
  breadcrumbs?: { name: string; path: string }[];
  aside?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-cream-50">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-28 -top-36 h-[26rem] w-[26rem] rounded-full bg-sun-100" />
        <div className="absolute -left-36 top-24 h-[22rem] w-[22rem] rounded-full bg-sky-50" />
      </div>
      <Container className="relative pt-8 sm:pt-12">
        {breadcrumbs?.length ? (
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.85rem] text-ink-soft">
              {breadcrumbs.map((crumb, i) => (
                <li key={crumb.path} className="flex items-center gap-2">
                  {i > 0 ? <span aria-hidden="true">/</span> : null}
                  {i === breadcrumbs.length - 1 ? (
                    <span aria-current="page" className="text-ink-muted">
                      {crumb.name}
                    </span>
                  ) : (
                    <Link to={crumb.path} className="underline-offset-4 hover:text-ink hover:underline">
                      {crumb.name}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="mt-5 max-w-3xl text-display-lg">{title}</h1>
          </div>
          <div>
            {lede ? <p className="lede max-w-xl">{lede}</p> : null}
            {actions ? <div className="mt-7 flex flex-col gap-3 sm:flex-row">{actions}</div> : null}
          </div>
        </div>
      </Container>

      <Container className="relative mt-12 sm:mt-14">
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute -inset-3 rotate-[-1deg] rounded-blob bg-white"
          />
          <Photo id={photo} ratio="21/9" priority rounded="rounded-blob" className="relative shadow-lift" />
          <Dots className="absolute -bottom-5 left-8 hidden h-12 w-24 text-sun-300 lg:block" rows={3} cols={6} />
        </div>
        {aside ? <div className="mt-8">{aside}</div> : null}
      </Container>
    </section>
  );
}
