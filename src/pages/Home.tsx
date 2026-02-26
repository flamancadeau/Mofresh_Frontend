import { HeroSection } from '@/components/HeroSection';
import { Header } from '@/components/ui/Header';
import { Footer } from '@/components/ui/Footer';
import { TopBar } from '@/components/ui/TopBar';

function Home() {
  return (
    <>
      <TopBar />
      <Header />
      <HeroSection />
      <Footer />
    </>
  );
}

export default Home;