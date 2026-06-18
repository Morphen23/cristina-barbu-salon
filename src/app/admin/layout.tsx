export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full w-full bg-background pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      {children}
    </div>
  );
}
