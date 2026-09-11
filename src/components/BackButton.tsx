import Link from "next/link";

export default function BackButton({
  href = "/",
  label = "Back to Works",
}: {
  href?: string;
  label?: string;
}) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1.5 font-sans text-sm text-forest/70 transition-colors hover:text-gold-dark"
    >
      <span aria-hidden>←</span> {label}
    </Link>
  );
}
