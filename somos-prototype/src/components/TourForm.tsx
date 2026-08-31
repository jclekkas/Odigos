import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { locations } from '@/data/locations';
import { Button } from '@/components/Button';
import { cn } from '@/lib/cn';

type Values = {
  name: string;
  email: string;
  phone: string;
  location: string;
  childAge: string;
  timeframe: string;
  contactMethod: string;
  message: string;
};

const EMPTY: Values = {
  name: '',
  email: '',
  phone: '',
  location: '',
  childAge: '',
  timeframe: '',
  contactMethod: 'email',
  message: '',
};

const AGES = [
  'Under 2',
  '2 years',
  '3 years',
  '4 years',
  '5 years',
  'More than one child',
];

const TIMEFRAMES = [
  'As soon as possible',
  'Within 1–3 months',
  'Next school year',
  'Just exploring',
];

const CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23655C52' stroke-width='1.6' stroke-linecap='round'%3E%3Cpath d='m4 6.5 4 4 4-4'/%3E%3C/svg%3E\")";

const selectStyle: React.CSSProperties = {
  backgroundImage: CHEVRON,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 1rem center',
  backgroundSize: '1rem',
};

const fieldClass =
  'w-full min-h-[54px] rounded-[1rem] border-2 border-ink/12 bg-white px-4 text-[1rem] text-ink placeholder:text-ink-soft transition-colors duration-200 hover:border-ink/25 focus:border-grass-500 focus:outline-none focus:ring-4 focus:ring-grass-500/20';

function Label({ htmlFor, children, optional }: { htmlFor: string; children: string; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-[0.9rem] font-semibold text-ink">
      {children}
      {optional ? <span className="ml-1.5 font-normal text-ink-soft">(optional)</span> : null}
    </label>
  );
}

export function TourForm() {
  const [params] = useSearchParams();
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const successRef = useRef<HTMLDivElement | null>(null);

  const presetLocation = params.get('location') ?? '';
  useEffect(() => {
    if (presetLocation && locations.some((l) => l.slug === presetLocation)) {
      setValues((v) => (v.location ? v : { ...v, location: presetLocation }));
    }
  }, [presetLocation]);

  useEffect(() => {
    if (submitted) successRef.current?.focus();
  }, [submitted]);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  const chosenLocation = useMemo(
    () => locations.find((l) => l.slug === values.location),
    [values.location]
  );

  const FIELD_IDS: Partial<Record<keyof Values, string>> = {
    name: 'tf-name',
    email: 'tf-email',
    phone: 'tf-phone',
    location: 'tf-location',
    timeframe: 'tf-timeframe',
  };

  function validate(): Partial<Record<keyof Values, string>> {
    const next: Partial<Record<keyof Values, string>> = {};
    if (!values.name.trim()) next.name = 'Please tell us your name.';
    if (!values.email.trim()) next.email = 'Please add an email address so we can reply.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim()))
      next.email = 'That email address does not look complete.';
    if (values.contactMethod === 'phone' && !values.phone.trim())
      next.phone = 'Add a phone number, or choose email as your preferred contact.';
    if (!values.location) next.location = 'Choose a school, or select “Not sure yet”.';
    if (!values.timeframe) next.timeframe = 'Let us know roughly when you would like to start.';
    setErrors(next);
    return next;
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate();
    const firstKey = (Object.keys(FIELD_IDS) as (keyof Values)[]).find((k) => found[k]);
    if (firstKey) {
      document.getElementById(FIELD_IDS[firstKey]!)?.focus();
      return;
    }
    // Prototype behaviour: nothing is transmitted or stored anywhere.
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        className="rounded-card border-2 border-grass-200 bg-grass-50 p-9 shadow-soft sm:p-12"
      >
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-grass-600 text-white">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        </span>
        <h3 className="mt-6 text-display-sm">Thank you.</h3>
        <p className="mt-3 max-w-prose text-lede">
          The Somos team will be in touch to arrange your visit
          {chosenLocation && chosenLocation.slug !== 'unsure'
            ? ` to ${chosenLocation.city}`
            : ''}
          .
        </p>
        <p className="mt-4 max-w-prose text-[0.95rem] leading-relaxed text-ink-muted">
          If you would like to speak with someone sooner, call the school directly —
          {' '}
          {locations.map((loc, i) => (
            <span key={loc.slug}>
              {i > 0 ? ' or ' : ''}
              {loc.city} at{' '}
              <a
                href={`tel:${loc.phone.replace(/\D/g, '')}`}
                className="font-semibold text-grass-700 underline underline-offset-4"
              >
                {loc.phone}
              </a>
            </span>
          ))}
          .
        </p>
        <button
          type="button"
          onClick={() => {
            setValues(EMPTY);
            setSubmitted(false);
          }}
          className="mt-7 min-h-[44px] font-semibold text-grass-700 underline underline-offset-4"
        >
          Request another tour
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-card border-2 border-sun-200 bg-white p-6 shadow-soft sm:p-9"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="tf-name">Parent or guardian name</Label>
          <input
            id="tf-name"
            name="name"
            autoComplete="name"
            className={cn(fieldClass, errors.name && 'border-grass-600')}
            value={values.name}
            onChange={(e) => set('name', e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'tf-name-error' : undefined}
          />
          {errors.name ? (
            <p id="tf-name-error" className="mt-2 text-[0.87rem] font-medium text-coral-600">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="tf-email">Email</Label>
          <input
            id="tf-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            className={cn(fieldClass, errors.email && 'border-grass-600')}
            value={values.email}
            onChange={(e) => set('email', e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'tf-email-error' : undefined}
          />
          {errors.email ? (
            <p id="tf-email-error" className="mt-2 text-[0.87rem] font-medium text-coral-600">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="tf-phone" optional>
            Phone
          </Label>
          <input
            id="tf-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className={cn(fieldClass, errors.phone && 'border-grass-600')}
            value={values.phone}
            onChange={(e) => set('phone', e.target.value)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'tf-phone-error' : undefined}
          />
          {errors.phone ? (
            <p id="tf-phone-error" className="mt-2 text-[0.87rem] font-medium text-coral-600">
              {errors.phone}
            </p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="tf-location">Preferred location</Label>
          <select
            id="tf-location"
            name="location"
            className={cn(fieldClass, 'appearance-none pr-10', errors.location && 'border-grass-600')}
            style={selectStyle}
            value={values.location}
            onChange={(e) => set('location', e.target.value)}
            aria-invalid={Boolean(errors.location)}
            aria-describedby={errors.location ? 'tf-location-error' : undefined}
          >
            <option value="">Select a school</option>
            {locations.map((loc) => (
              <option key={loc.slug} value={loc.slug}>
                {loc.city}
              </option>
            ))}
            <option value="unsure">Not sure yet</option>
          </select>
          {errors.location ? (
            <p id="tf-location-error" className="mt-2 text-[0.87rem] font-medium text-coral-600">
              {errors.location}
            </p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="tf-age">Child’s age</Label>
          <select
            id="tf-age"
            name="childAge"
            className={cn(fieldClass, 'appearance-none pr-10')}
            style={selectStyle}
            value={values.childAge}
            onChange={(e) => set('childAge', e.target.value)}
          >
            <option value="">Select an age</option>
            {AGES.map((age) => (
              <option key={age} value={age}>
                {age}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="tf-timeframe">Desired start</Label>
          <select
            id="tf-timeframe"
            name="timeframe"
            className={cn(fieldClass, 'appearance-none pr-10', errors.timeframe && 'border-grass-600')}
            style={selectStyle}
            value={values.timeframe}
            onChange={(e) => set('timeframe', e.target.value)}
            aria-invalid={Boolean(errors.timeframe)}
            aria-describedby={errors.timeframe ? 'tf-timeframe-error' : undefined}
          >
            <option value="">Select a timeframe</option>
            {TIMEFRAMES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {errors.timeframe ? (
            <p id="tf-timeframe-error" className="mt-2 text-[0.87rem] font-medium text-coral-600">
              {errors.timeframe}
            </p>
          ) : null}
        </div>

        <fieldset className="sm:col-span-2">
          <legend className="mb-3 text-[0.9rem] font-semibold text-ink">
            Preferred contact method
          </legend>
          <div className="flex flex-wrap gap-3">
            {[
              { value: 'email', label: 'Email' },
              { value: 'phone', label: 'Phone call' },
              { value: 'text', label: 'Text message' },
            ].map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  'inline-flex min-h-[50px] cursor-pointer items-center gap-2.5 rounded-pill border-2 px-5 font-semibold transition-colors duration-200',
                  values.contactMethod === opt.value
                    ? 'border-coral-500 bg-coral-50 text-ink'
                    : 'border-ink/12 bg-white text-ink-muted hover:border-ink/25'
                )}
              >
                <input
                  type="radio"
                  name="contactMethod"
                  value={opt.value}
                  checked={values.contactMethod === opt.value}
                  onChange={(e) => set('contactMethod', e.target.value)}
                  className="h-4 w-4 accent-grass-600"
                />
                <span className="text-[0.95rem] font-medium">{opt.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="sm:col-span-2">
          <Label htmlFor="tf-message" optional>
            Anything you would like us to know
          </Label>
          <textarea
            id="tf-message"
            name="message"
            rows={4}
            className={cn(fieldClass, 'min-h-[130px] resize-y py-3 leading-relaxed')}
            placeholder="Questions about schedules, an IFSP or IEP, siblings, or anything else."
            value={values.message}
            onChange={(e) => set('message', e.target.value)}
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" size="lg" withArrow className="w-full sm:w-auto">
          Request a Tour
        </Button>
        <p className="text-[0.85rem] leading-relaxed text-ink-soft sm:max-w-xs">
          We use your details only to arrange your visit and answer your questions.
        </p>
      </div>
    </form>
  );
}
