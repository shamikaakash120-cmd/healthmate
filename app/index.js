/**
 * @layer app (Route)
 * @responsibility Thin route wrapper importing and displaying the Dashboard screen.
 */
import React from 'react';
import DashboardScreen from '../src/features/dashboard/screens/DashboardScreen';

/**
 * Entry route screen rendering the dashboard.
 * @returns {React.JSX.Element} Dashboard screen view.
 */
export default function IndexRoute() {
  return <DashboardScreen />;
}
