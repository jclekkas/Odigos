import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from '@/App';
import { SeoContext, type SeoStore } from '@/lib/seo';

export { staticRoutes } from '@/routes';
export { site } from '@/data/site';

export function render(url: string) {
  const store: SeoStore = { current: null };
  const html = renderToString(
    <SeoContext.Provider value={store}>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </SeoContext.Provider>
  );
  return { html, seo: store.current };
}
