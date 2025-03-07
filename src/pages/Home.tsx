
import Hero from "@/components/Hero";
import SupabaseConnectionTest from "@/components/SupabaseConnectionTest";

const Home = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Hero />
      <div className="mt-8">
        <SupabaseConnectionTest />
      </div>
    </div>
  );
};

export default Home;
