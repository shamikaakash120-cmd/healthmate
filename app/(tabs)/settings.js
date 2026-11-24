/**
 * @layer app (Route)
 * @responsibility Thin route wrapper rendering the Settings screen.
 */
import { SettingsScreen } from '../../src/features/settings/screens';

/**
 * Entry route for the Settings tab.
 * @returns {React.JSX.Element}
 */
export default function SettingsRoute() {
  return <SettingsScreen />;
}
