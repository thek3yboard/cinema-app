import Image from "next/image";
import logo from '@/assets/cinema.png';

export default function LoggedLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <div className="h-screen flex flex-col overflow-y-scroll">
        <nav className="sticky top-0 p-[6px] h-11 bg-gradient-to-r from-aero-blue to-blueish-gray border-b-2 border-slate-700"><Image className="ml-1" src={logo} alt="Logo" width={125} /></nav>
        <div className="min-h-full">
          {children}
          <div className="h-6 flex justify-center items-end bg-blueish-gray">
            <footer className="h-6 text-nyanza">Copyright © 2024 Juan Ignacio Leiva</footer>
          </div>
        </div>
      </div>
    );
  }
  