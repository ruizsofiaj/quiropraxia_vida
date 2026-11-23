import Image from "next/image";
import Link from "next/link";
import { BUSINESS, waLink } from "@/lib/business";
import { IS_DEMO } from "@/lib/demo";
import { InstagramIcon, WhatsAppIcon } from "./icons";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-sand/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" aria-label={`${BUSINESS.name}, inicio`}>
          {IS_DEMO ? (
            <span className="font-serif text-xl font-semibold">
              Quiropraxia <span className="text-sea">Ejemplo</span>
            </span>
          ) : (
            <Image
              src="/brand/logo-marca.png"
              alt={BUSINESS.name}
              width={1698}
              height={194}
              priority
              className="h-6 w-auto sm:h-7"
            />
          )}
        </Link>
        <nav aria-label="Principal" className="flex items-center gap-1 sm:gap-3">
          <Link href="/#servicios" className="hidden px-3 py-2 text-sm font-medium hover:text-sea md:block">
            Consulta
          </Link>
          <Link href="/#sobre-mi" className="hidden px-3 py-2 text-sm font-medium hover:text-sea md:block">
            Sobre {BUSINESS.firstName}
          </Link>
          <Link href="/#ubicacion" className="hidden px-3 py-2 text-sm font-medium hover:text-sea md:block">
            Ubicación
          </Link>
          <Link href="/reservar" className="btn btn-primary !min-h-11 !px-5 text-sm">
            Reservar turno
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-ink text-sand">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 sm:grid-cols-3">
        <div>
          {IS_DEMO ? (
            <span className="font-serif text-xl font-semibold">{BUSINESS.name}</span>
          ) : (
            <Image
              src="/brand/logo-marca-claro.png"
              alt={BUSINESS.name}
              width={1698}
              height={194}
              className="h-7 w-auto"
            />
          )}
          <p className="mt-3 text-sm text-sand/75">{BUSINESS.title}</p>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Contacto</p>
          <ul className="mt-2 space-y-1.5 text-sand/80">
            <li>
              <a className="underline-offset-4 hover:underline" href={waLink()}>
                WhatsApp {BUSINESS.whatsappDisplay}
              </a>
            </li>
            <li>
              {BUSINESS.address}
              <br />
              {BUSINESS.city}
            </li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Más</p>
          <ul className="mt-2 space-y-1.5 text-sand/80">
            <li>
              <a
                className="inline-flex items-center gap-2 underline-offset-4 hover:underline"
                href={BUSINESS.instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramIcon className="h-4 w-4" /> @quiropraxia.vida
              </a>
            </li>
            <li>
              <Link className="underline-offset-4 hover:underline" href="/privacidad">
                Política de privacidad
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <p className="border-t border-sand/15 py-4 text-center text-xs text-sand/60">
        © {new Date().getFullYear()} {BUSINESS.name}. Los resultados pueden variar según cada persona.
      </p>
    </footer>
  );
}

export function WhatsAppFab() {
  return (
    <a
      href={waLink(`Hola ${BUSINESS.firstName}, quería consultarte por un turno.`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir por WhatsApp"
      className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#1f8f4e] text-white shadow-lg shadow-black/20 transition-transform hover:scale-105"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
