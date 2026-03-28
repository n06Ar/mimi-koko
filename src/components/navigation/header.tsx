interface HeaderProps {
  title: string;
  rightAction?: React.ReactNode;
  leftAction?: React.ReactNode;
  centerTitle?: boolean;
}

export function Header({ title, rightAction, leftAction, centerTitle = false }: HeaderProps) {
  if (centerTitle || leftAction) {
    return (
      <header className="sticky top-0 z-40 bg-white" style={{ height: "56px", borderBottom: "1px solid #F0EDE8", display: "flex", alignItems: "center", padding: "0 20px" }}>
        <div className="flex w-full items-center justify-between">
          <div className="w-16">{leftAction}</div>
          <h1 className="text-base font-semibold text-[#3D3D3D]">{title}</h1>
          <div className="w-16 text-right">{rightAction}</div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 bg-white" style={{ height: "56px", borderBottom: "1px solid #F0EDE8", display: "flex", alignItems: "center", padding: "0 20px" }}>
      <div className="flex w-full items-center justify-between">
        <h1 className="text-xl font-bold text-[#3D3D3D]">{title}</h1>
        {rightAction && <div>{rightAction}</div>}
      </div>
    </header>
  );
}
