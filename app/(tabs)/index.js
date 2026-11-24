/**
 * @layer app (Route)
 * @responsibility Thin route wrapper rendering the Dashboard (Home) screen.
 */
import { DashboardScreen } from '../../src/features/dashboard/screens';

/**
 * Entry route for the Home tab.
 * @returns {React.JSX.Element}
 */
export default function HomeRoute() {
  return <DashboardScreen />;
}
