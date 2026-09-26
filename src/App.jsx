import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { VARIANTS, VariantContext } from './lib/variant.jsx';
import Layout from './components/Layout.jsx';
import Landing from './pages/Landing.jsx';
import Home from './pages/Home.jsx';
import Results from './pages/Results.jsx';
import FlightDetail from './pages/FlightDetail.jsx';
import Travelers from './pages/Travelers.jsx';
import Review from './pages/Review.jsx';
import Confirmation from './pages/Confirmation.jsx';
import Login from './pages/Login.jsx';
import Account from './pages/Account.jsx';
import Trips from './pages/Trips.jsx';
import TripDetail from './pages/TripDetail.jsx';
import Admin from './pages/Admin.jsx';
import FareRules from './pages/FareRules.jsx';
import Help from './pages/Help.jsx';
import NotFound from './pages/NotFound.jsx';
import { RequireLogin } from './components/ui.jsx';

function VariantRoot() {
  const { variant } = useParams();
  if (!VARIANTS.includes(variant)) return <Navigate to="/" replace />;
  return (
    <VariantContext.Provider value={{ id: variant, base: `/v/${variant}` }}>
      <Routes>
        <Route path="fare-rules/:fare" element={<FareRules />} />
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="flights" element={<Results />} />
          <Route path="flights/:flightId" element={<FlightDetail />} />
          <Route path="book/travelers" element={<Travelers />} />
          <Route path="book/review" element={<Review />} />
          <Route path="book/confirmation/:ref" element={<Confirmation />} />
          <Route path="login" element={<Login />} />
          <Route path="help" element={<Help />} />
          <Route
            path="account"
            element={
              <RequireLogin>
                <Account />
              </RequireLogin>
            }
          />
          <Route
            path="trips"
            element={
              <RequireLogin>
                <Trips />
              </RequireLogin>
            }
          />
          <Route
            path="trips/:ref"
            element={
              <RequireLogin>
                <TripDetail />
              </RequireLogin>
            }
          />
          <Route
            path="admin"
            element={
              <RequireLogin>
                <Admin />
              </RequireLogin>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </VariantContext.Provider>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/v/:variant/*" element={<VariantRoot />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
