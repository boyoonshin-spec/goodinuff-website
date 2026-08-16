export default function AuthBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[var(--accent)] opacity-20 blur-3xl" />
      <div className="absolute -right-16 top-1/3 h-64 w-64 rounded-full bg-[var(--accent2)] opacity-25 blur-3xl" />
      <div className="absolute bottom-[-6rem] left-1/4 h-72 w-72 rounded-full bg-[var(--teal)] opacity-15 blur-3xl" />
    </div>
  );
}
