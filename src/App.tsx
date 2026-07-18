import { AppRouter } from '@/app/router/app-router';
import { LocalizationProvider } from '@/features/localization/localization-provider';

function App() {
  return (
    <LocalizationProvider>
      <AppRouter />
    </LocalizationProvider>
  );
}

export default App;
