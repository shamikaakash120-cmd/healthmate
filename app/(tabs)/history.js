/**
 * @layer app (Route)
 * @responsibility Thin route wrapper rendering the History screen.
 */
import { HistoryScreen } from '../../src/features/history/screens';

/**
 * Entry route for the History tab.
 * @returns {React.JSX.Element}
 */
export default function HistoryRoute() {
  return <HistoryScreen />;
}
