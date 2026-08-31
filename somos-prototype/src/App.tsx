import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MobileTourBar } from '@/components/MobileTourBar';
import Home from '@/pages/Home';
import Programs from '@/pages/Programs';
import Approach from '@/pages/Approach';
import LocationsPage from '@/pages/Locations';
import LocationDetail from '@/pages/LocationDetail';
import Admissions from '@/pages/Admissions';
import About from '@/pages/About';
import Families from '@/pages/Families';
import Careers from '@/pages/Careers';
import Privacy from '@/pages/Privacy';
import Accessibility from '@/pages/Accessibility';
import NotFound from '@/pages/NotFound';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Header />
      <main id="main" className="flex-1 pt-[92px]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/approach" element={<Approach />} />
          <Route path="/locations" element={<LocationsPage />} />
          <Route path="/locations/:slug" element={<LocationDetail />} />
          <Route path="/admissions" element={<Admissions />} />
          <Route path="/about" element={<About />} />
          <Route path="/families" element={<Families />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/accessibility" element={<Accessibility />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <MobileTourBar />
    </div>
  );
}
