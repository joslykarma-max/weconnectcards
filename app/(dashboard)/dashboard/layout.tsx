// The home stays mounted while a section opens over it in the @panel slot
export default function DashboardSectionLayout({ children, panel }: { children: React.ReactNode; panel: React.ReactNode }) {
  return (
    <>
      {children}
      {panel}
    </>
  );
}
