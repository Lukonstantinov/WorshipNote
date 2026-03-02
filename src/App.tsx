import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './shared/components/Layout'
import HomePage from './pages/HomePage'
import SongPage from './pages/SongPage'
import SongEditPage from './pages/SongEditPage'
import SetlistPage from './pages/SetlistPage'
import SetlistEditPage from './pages/SetlistEditPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/library" replace />} />
          <Route path="/library" element={<HomePage />} />
          <Route path="/songs/:id" element={<SongPage />} />
          <Route path="/songs/:id/edit" element={<SongEditPage />} />
          <Route path="/songs/new" element={<SongEditPage />} />
          <Route path="/setlists" element={<SetlistPage />} />
          <Route path="/setlists/:id" element={<SetlistPage />} />
          <Route path="/setlists/:id/edit" element={<SetlistEditPage />} />
          <Route path="/setlists/new" element={<SetlistEditPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
