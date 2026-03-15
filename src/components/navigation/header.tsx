interface HeaderProps {
  title: string;
  rightAction?: React.ReactNode;
}

export function Header({ title, rightAction }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[#3D3D3D]">{title}</h1>
        {rightAction && <div>{rightAction}</div>}
      </div>
    </header>
  );
}
