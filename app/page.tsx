import Dashboard from "@/components/Dashboard";
import HeroSection from "@/components/hero-section";
import { getSession } from "@/lib/server";


export default async function Home() {
  const session =await getSession()
  return (
    <div className="">

    {
      !session?
      <HeroSection/>:
      <div className="  mt-20">
        <Dashboard/>
      </div>
    }
    </div>
  );
}
