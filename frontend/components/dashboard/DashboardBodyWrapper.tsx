export const DashboardBodyWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">{children}</div>
    </div>
  );
};



