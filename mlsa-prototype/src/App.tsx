import { useCallback, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { SkipLink } from './components/SkipLink';
import { PrototypeBanner } from './components/PrototypeBanner';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SearchOverlay } from './components/SearchOverlay';
import { Home } from './pages/Home';
import { GetHelp } from './pages/GetHelp';
import { OurWork } from './pages/OurWork';
import { About } from './pages/About';
import { Concept } from './pages/Concept';
import { NotFound } from './pages/NotFound';

/**
 * Landmark structure, in document order:
 *
 *   skip link → prototype banner → announcement (aside) → header/nav →
 *   main#main → footer
 *
 * One <main> for the whole app, so route changes swap its contents rather than
 * creating a second main landmark. The search overlay is rendered as a sibling
 * of main so it is never nested inside the content it covers.
 */
export default function App() {
  const [searchOpen, setSearchOpen] = useState(false);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  return (
    <div className="flex min-h-screen flex-col">
      <SkipLink />
      <PrototypeBanner />
      <AnnouncementBar />
      <Header onOpenSearch={openSearch} />

      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Routes>
          <Route path="/" element={<Home onOpenSearch={openSearch} />} />
          <Route path="/get-help" element={<GetHelp />} />
          <Route path="/our-work" element={<OurWork />} />
          <Route path="/about" element={<About />} />
          <Route path="/concept" element={<Concept />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />

      <SearchOverlay open={searchOpen} onClose={closeSearch} />
    </div>
  );
}
