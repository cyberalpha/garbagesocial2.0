
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Index from '@/pages/Index';
import { useLanguage } from '@/components/LanguageContext';

const Home = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Index />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
