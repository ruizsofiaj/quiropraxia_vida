import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  SparkIcon,
  SpineIcon,
  WhatsAppIcon,
} from "@/components/icons";
import { getProfile, waLink } from "@/lib/profile";
import { readDB } from "@/lib/store";
import { WEEKDAYS } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function Home() {
  const P = await getProfile();
  const db = await readDB();
  const days = [1, 2, 3, 4, 5, 6, 0].map((d) => ({ d, hours: db.settings.weekly[d] }));
  const single = db.services.length === 1 ? db.services[0] : null;
  const ServiceIcon = P.custom ? SpineIcon : SparkIcon;

  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 md:grid-cols-[1.15fr_0.85fr] md:pt-20">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-sand-deep px-3 py-1 text-sm font-medium">
            <span className="h-2 w-2 rounded-full bg-orange" /> {P.heroBadge}
          </p>
          <h1 className="text-4xl font-semibold sm:text-5xl md:text-6xl">
            {P.heroTitle[0]}
            <br />
            <span className="text-sea">{P.heroTitle[1]}</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink-soft">{P.intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/reservar" className="btn btn-primary">
              <CalendarIcon className="h-5 w-5" /> Reservar turno online
            </Link>
            <a
              href={waLink(P, P.msg.waHello)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
            >
              <WhatsAppIcon className="h-5 w-5" /> Escribir por WhatsApp
            </a>
          </div>
          <p className="mt-4 text-sm text-ink-soft">
            Elegís día y hora libres. Sin crear cuenta y sin pagar por adelantado.
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          <div
            aria-hidden
            className="absolute -right-5 -top-5 h-3/4 w-3/4 rounded-[45%_55%_50%_50%/55%_45%_55%_45%] bg-orange"
          />
          <div aria-hidden className="absolute -bottom-5 -left-5 h-1/3 w-1/3 rounded-full bg-sea" />
          {P.custom ? (
            <Image
              src="/brand/hugo.jpg"
              alt="Lic. Hugo Rodríguez sosteniendo un modelo de columna vertebral"
              width={370}
              height={560}
              priority
              className="relative aspect-[4/5] w-full rounded-[2rem] bg-white object-cover object-top"
            />
          ) : (
            <div
              role="img"
              aria-label="Espacio para una foto del negocio"
              className="relative grid aspect-[4/5] w-full place-items-center rounded-[2rem] bg-gradient-to-br from-sea to-sea-dark text-center text-white"
            >
              <SparkIcon className="absolute h-56 w-56 text-white/10" />
              <p className="relative px-8 font-serif text-2xl font-semibold">{P.copy.photoLabel}</p>
            </div>
          )}
          {P.custom && (
            <div className="absolute -bottom-4 right-3 rounded-2xl bg-ink px-4 py-3 text-sand shadow-lg">
              <p className="font-serif text-3xl font-semibold leading-none text-orange">20 años</p>
              <p className="text-xs">de experiencia</p>
            </div>
          )}
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" className="scroll-mt-20 bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-3xl font-semibold sm:text-4xl">
            {single ? P.copy.servicesTitleSingle : P.copy.servicesTitleMulti}
          </h2>
          <p className="mt-3 max-w-2xl text-ink-soft">{P.copy.servicesLead}</p>

          <div className={`mt-10 grid gap-5 ${single ? "" : "md:grid-cols-3"}`}>
            {db.services.map((s) => (
              <article
                key={s.id}
                className={`card flex flex-col gap-4 bg-sand/60 ${single ? "sm:flex-row sm:items-center sm:justify-between" : ""}`}
              >
                <div className="flex items-start gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-orange text-ink">
                    <ServiceIcon className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold">{s.name}</h3>
                    <p className="mt-1 max-w-xl text-ink-soft">{s.description}</p>
                    <p className="mt-3 flex items-center gap-2 text-sm font-medium">
                      <ClockIcon className="h-4 w-4 text-sea" /> {s.durationMin} min
                    </p>
                  </div>
                </div>
                <div className={single ? "sm:text-right" : ""}>
                  <p className="font-serif text-4xl font-semibold text-sea">{s.priceLabel}</p>
                  {single && (
                    <Link href="/reservar" className="btn btn-primary mt-3">
                      Reservar <ArrowRightIcon className="h-5 w-5" />
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-semibold sm:text-4xl">{P.copy.stepsTitle}</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {P.copy.steps.map(([title, text], i) => (
            <li key={title} className="flex gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-orange font-serif text-lg font-semibold text-ink">
                {i + 1}
              </span>
              <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-1 text-ink-soft">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Sobre nosotros + video */}
      <section id="sobre-mi" className="scroll-mt-20 bg-sea py-16 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="text-3xl font-semibold sm:text-4xl">{P.copy.aboutTitle}</h2>
            <p className="mt-4 text-lg text-white/90">{P.copy.aboutP1}</p>
            <p className="mt-3 text-white/90">{P.copy.aboutP2}</p>
            {P.custom && (
              <dl className="mt-8 grid grid-cols-2 gap-4 sm:max-w-md">
                <div className="rounded-2xl bg-white/10 p-4">
                  <dt className="text-sm text-white/80">Experiencia</dt>
                  <dd className="font-serif text-3xl font-semibold text-orange">20 años</dd>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <dt className="text-sm text-white/80">Formación</dt>
                  <dd className="font-serif text-3xl font-semibold text-orange">UNC</dd>
                </div>
              </dl>
            )}
          </div>
          <div className="mx-auto w-full max-w-[16rem]">
            {P.custom ? (
              <>
                <video
                  className="aspect-[9/16] w-full rounded-3xl bg-black object-cover"
                  src="/brand/fotos.mp4"
                  controls
                  playsInline
                  preload="metadata"
                  aria-label="Video del consultorio y del trabajo de Hugo"
                />
                <p className="mt-2 text-center text-xs text-white/70">Así trabajamos en el consultorio.</p>
              </>
            ) : (
              <div
                role="img"
                aria-label="Espacio para un video o fotos"
                className="grid aspect-[9/16] w-full place-items-center rounded-3xl bg-white/10 p-6 text-center text-sm text-white/90"
              >
                {P.copy.mediaLabel}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-semibold sm:text-4xl">{P.copy.testimonialsTitle}</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {P.copy.testimonials.map((t) => (
            <figure key={t.name} className="card">
              <blockquote className="text-ink-soft">“{t.text}”</blockquote>
              <figcaption className="mt-4 text-sm font-semibold">
                {t.name} <span className="font-normal text-clay">(ejemplo)</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Ubicación */}
      <section id="ubicacion" className="scroll-mt-20 mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold sm:text-4xl">{P.copy.locationTitle}</h2>
            <p className="mt-4 flex items-start gap-2 text-lg">
              <MapPinIcon className="mt-1 h-5 w-5 shrink-0 text-sea" />
              <span>
                {P.address}
                <span className="block text-sm text-ink-soft">{P.city}</span>
              </span>
            </p>
            <h3 className="mt-8 text-xl font-semibold">Horarios de atención</h3>
            <dl className="mt-3 divide-y divide-line rounded-2xl border border-line bg-white">
              {days.map(({ d, hours }) => (
                <div key={d} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
                  <dt className="font-medium capitalize">{WEEKDAYS[d]}</dt>
                  <dd className="text-ink-soft">
                    {hours.open && hours.ranges.length
                      ? hours.ranges.map((r) => `${r.start} a ${r.end} hs`).join(" y ")
                      : "Cerrado"}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="min-h-72 overflow-hidden rounded-3xl border border-line bg-white">
            <iframe
              title={P.copy.mapTitle}
              className="h-full min-h-72 w-full"
              loading="lazy"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(P.mapQuery)}&output=embed`}
            />
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
        <div className="rounded-[2rem] bg-ink p-8 text-sand sm:p-12">
          <h2 className="max-w-xl text-3xl font-semibold sm:text-4xl">{P.copy.ctaTitle}</h2>
          <Link href="/reservar" className="btn mt-6 bg-orange text-ink hover:bg-[#ffa246]">
            Elegir día y horario <ArrowRightIcon className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </>
  );
}
