import { useLang } from '@/i18n/LanguageContext';
import { OFFICES } from '@/data/organization';

/**
 * A restrained representation of statewide reach.
 *
 * Montana's outline is close to a rectangle with one notched corner, which is
 * why a simple SVG can carry it honestly. This is NOT a data map: it does not
 * claim county-level accuracy, and the office markers are indicative placement,
 * not survey coordinates. Everything it actually asserts — three offices, all
 * 56 counties, every Tribal Reservation — is stated in text beside it, so the
 * graphic can be ignored entirely without losing information.
 */
export function MontanaReach() {
  const { t } = useLang();

  // Indicative positions only, in the SVG's own coordinate space.
  const markers = [
    { city: 'Missoula', x: 88, y: 88 },
    { city: 'Helena', x: 158, y: 118 },
    { city: 'Billings', x: 236, y: 140 },
  ];

  return (
    <figure className="rounded-card border border-line bg-surface p-6 shadow-card sm:p-8">
      <svg
        viewBox="0 0 380 210"
        role="img"
        aria-labelledby="reach-title reach-desc"
        className="w-full"
      >
        <title id="reach-title">
          {t({
            en: 'Simplified outline of Montana with MLSA’s three offices marked',
            es: 'Contorno simplificado de Montana con las tres oficinas de MLSA marcadas',
          })}
        </title>
        <desc id="reach-desc">
          {t({
            en: 'An indicative illustration. MLSA has offices in Missoula, Helena and Billings, and serves all 56 Montana counties and every Tribal Reservation in the state.',
            es: 'Una ilustración indicativa. MLSA tiene oficinas en Missoula, Helena y Billings, y atiende los 56 condados de Montana y todas las reservaciones tribales del estado.',
          })}
        </desc>

        {/* Simplified state silhouette. */}
        <path
          d="M22 58 L74 44 L88 22 L118 34 L140 26 L358 26 L358 184 L44 184 L34 150 L20 128 Z"
          className="fill-primary-tint stroke-primary-border"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {markers.map((marker) => (
          <g key={marker.city}>
            <circle cx={marker.x} cy={marker.y} r="7" className="fill-primary" />
            <circle cx={marker.x} cy={marker.y} r="13" className="fill-primary/20" />
            <text
              x={marker.x + 20}
              y={marker.y + 5}
              className="fill-ink text-[13px] font-semibold"
              style={{ fontFamily: 'inherit' }}
            >
              {marker.city}
            </text>
          </g>
        ))}
      </svg>

      <figcaption className="mt-5 border-t border-line pt-4">
        <p className="text-sm font-semibold text-ink">
          {t({ en: 'Offices', es: 'Oficinas' })}: {OFFICES.map((o) => o.city).join(', ')}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">
          {t({
            en: 'Services reach all 56 Montana counties and every Tribal Reservation. Illustration is indicative, not a data map.',
            es: 'Los servicios llegan a los 56 condados de Montana y a todas las reservaciones tribales. La ilustración es indicativa, no un mapa de datos.',
          })}
        </p>
      </figcaption>
    </figure>
  );
}
