/**
 * @layer app (Route)
 * @responsibility Thin route wrapper rendering the Record Form modal screen.
 */
import { RecordFormScreen } from '../src/features/records/screens';

/**
 * Route for creating or editing health records.
 * @returns {React.JSX.Element}
 */
export default function RecordFormRoute() {
  return <RecordFormScreen />;
}
