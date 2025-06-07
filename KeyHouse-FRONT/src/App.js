import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CreateAccount from "./components/CreateAccount";
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import Home from "./components/Home";
import Layout from "./components/Layout";
import Profile from "./components/Profile";
import Favorites from "./components/Favorites";
import SobreNosotros from "./components/SobreNosotros";
import DetalleCasa  from "./components/DetalleCasa";
import MisPropiedades from './components/MisPropiedades';
import EditarPropiedad from './components/EditarPropiedad';
import PublicarPropiedad from './components/PublicarPropiedad';
import Solicitudes from './components/Solicitudes';
import Sidebar from './components/Sidebar';
import Reportes from './components/Reportes';
import ReportesAdmin from "./components/ReportesAdmin";
import CentroDeAyuda from "./components/CentroDeAyuda";
import Seguridad from "./components/Seguridad";
import ProblemasReservas from "./components/ProblemasReservas";
import ApoyoDiscapacitados from "./components/ApoyoDiscapacitados";
import OpcionesCancelacion from "./components/OpcionesCancelacion";
import ConsejosArrendadores from "./components/ConsejosArrendadores";
import RecursosAnfitriones from "./components/RecursosAnfitriones";
import GarantiaKeyhouse from "./components/GarantiaKeyhouse";
import BuscarCoinquilino from "./components/BuscarCoinquilino";
import PublicarApartamento from "./components/PublicarApartamento";
import Blog from "./components/Blog";
import TrabajaConNosotros from "./components/TrabajaConNosotros";
import Inversionistas from "./components/Inversionistas";
import EspaciosKeyhouseOrg from "./components/EspaciosKeyhouseOrg";

function App() {
  const usuario = localStorage.getItem("usuario_id");

    return (
    <Router>
      <Sidebar />
      <Routes>
        <Route path="/favoritos" element={<Favorites />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/" element={<Login />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reportes" element={<Reportes />} />
        
        {/* Rutas protegidas */}
        <Route path="/" element={<Layout />}>
          <Route path="/sobre" element={<SobreNosotros />} />
          <Route path="/ayuda" element={<CentroDeAyuda />} />
          <Route path="/seguridad" element={<Seguridad />} />
          <Route path="/cancelacion" element={<OpcionesCancelacion/>} />
          <Route path="/problemas-reserva" element={<ProblemasReservas />} />
          <Route path="/discapacitados" element={<ApoyoDiscapacitados />} />
          <Route path="/publicar" element={<BuscarCoinquilino />} />
          <Route path="/consejos" element={<ConsejosArrendadores />} />
          <Route path="/recursos" element={<RecursosAnfitriones />} />
          <Route path="/garantia" element={<GarantiaKeyhouse />} />
          <Route path="/coinquilino" element={<PublicarApartamento />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/trabaja" element={<TrabajaConNosotros />} />
          <Route path="/inversionistas" element={<Inversionistas />} />
          <Route path="/espacios" element={<EspaciosKeyhouseOrg />} />      
          <Route path="/discapacitados" element={<ApoyoDiscapacitados />} />
          <Route path="/casa/:id" element={<DetalleCasa />} />
          <Route path="home" element={<Home />} />
          <Route path="/solicitudes" element={<Solicitudes idDueno={usuario} />} />
          <Route path="/reportes-admin" element={<ReportesAdmin />} />

        </Route>
        <Route path="/mis-propiedades" element={<MisPropiedades />} />
        <Route path="/editar-propiedad/:id" element={<EditarPropiedad />} />
        <Route path="/publicar-propiedad" element={<PublicarPropiedad />} />
        </Routes>     
    </Router>
  );
}

export default App;