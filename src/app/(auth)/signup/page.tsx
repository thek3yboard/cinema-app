import Image from "next/image";
import logo from '@/assets/cinema.png';

export default function Login() {
  return(
    <div className="flex flex-col h-screen w-screen justify-center items-center
    bg-gradient-to-b from-aero-blue to-blueish-gray">
      <Image className="m-4" src={logo} alt="Logo" width={256} />
      <div className="flex h-2/4 w-3/4 sm:w-1/6
      bg-gradient-to-b from-nyanza to-pastel-yellow rounded-md border-2 border-gray-500">
        <form className="flex flex-col w-full h-full justify-center items-center">
          <label className="m-4 font-bold text-slate-700">E-mail</label>
          <input className="h-8 p-1 w-3/4 border-2 border-aero-blue rounded-md bg-blueish-gray text-white"/>
          <label className="m-4 font-bold text-slate-700">Password</label>
          <input type="password" className="h-8 p-1 w-3/4 border-2 border-aero-blue rounded-md bg-blueish-gray text-white"/>
          <button className="h-12 w-1/2 m-10 rounded-md font-bold text-white border-2 border-gray-500 bg-blueish-gray">Sign Up</button>
        </form>
      </div>
    </div>
  );
}