import { SidebarProvider } from '../shared/organisms/SidebarContext';
import { Sidebar } from '../shared/organisms/Sidebar';
import FoodTrackerPage from './organisms/FoodTrackerPage';

export default function FoodTrackerRoot() {
  return (
    <SidebarProvider>
      <Sidebar />
      <FoodTrackerPage />
    </SidebarProvider>
  );
}