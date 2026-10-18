import { renderToString } from 'react-dom/server';
import App from './App';
export { siteRoutes, routeAliases, structuredData } from './config/routes';
export function render(path: string) { return renderToString(<App path={path} />); }
