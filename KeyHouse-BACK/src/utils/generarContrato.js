// modulos/alquileres/utils/generarContrato.js
const fs = require('fs');
const PDFDocument = require('pdfkit');
const path = require('path');

function formatearFecha(fecha) {
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  const date = new Date(fecha);
  const dia = date.getDate();
  const mes = meses[date.getMonth()];
  const anio = date.getFullYear();

  return `${dia} de ${mes} de ${anio}`;
}

function generarContratoPDF(datos, fechaInicio) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const nombreArchivo = `contrato_${datos.alquiler_id}.pdf`;
    const ruta = path.join(__dirname, '../../../contratos', nombreArchivo);

    // Asegúrate de que la carpeta exista
    if (!fs.existsSync(path.dirname(ruta))) {
      fs.mkdirSync(path.dirname(ruta), { recursive: true });
    }

    const stream = fs.createWriteStream(ruta);
    doc.pipe(stream);

    // Título del contrato
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('Contrato de Arrendamiento de Inmueble', { align: 'center' })
      .moveDown(2);

    // Datos generales
    doc
      .fontSize(12)
      .font('Helvetica')
      .text(`Entre el propietario ${datos.nombre_dueno}, de cédula ${datos.cedula_dueno} en adelante "El Arrendador",`)
      .text(`y el inquilino ${datos.nombre_inquilino}, de cedula ${datos.cedula_inquilino} en adelante "El Arrendatario",`)
      .text(`se celebra el presente contrato de arrendamiento, el cual se regirá por las siguientes cláusulas:`)
      .moveDown(2);

    // Información del inmueble
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('1. Identificación del Inmueble', { underline: true })
      .moveDown(0.5)
      .fontSize(12)
      .font('Helvetica')
      .text(`Dirección del inmueble: ${datos.direccion}`)
      .moveDown(1);

    // Duración del contrato
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('2. Duración del Contrato', { underline: true })
      .moveDown(0.5)
      .fontSize(12)
      .font('Helvetica')
      .text(`Fecha de inicio: ${formatearFecha(fechaInicio)}`)
      .text(`Fecha de finalización: Indefinido`)
      .moveDown(1);

    // Obligaciones
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('3. Obligaciones del Arrendatario', { underline: true })
      .moveDown(0.5)
      .fontSize(12)
      .font('Helvetica')
      .text(`El Arrendatario se compromete a pagar el canon de arrendamiento de manera oportuna, con un precio de $${datos.precio}, a conservar el inmueble en buen estado y a restituirlo al finalizar el contrato en las mismas condiciones en las que fue entregado.`)
      .moveDown(1);

    // Cláusulas adicionales
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('4. Cláusulas Adicionales', { underline: true })
      .moveDown(0.5)
      .fontSize(12)
      .font('Helvetica')
      .text('Cualquier otro acuerdo entre las partes deberá constar por escrito y firmado por ambas partes.')
      .moveDown(2);

    // Firmas
    doc
      .fontSize(12)
      .text('Firmado en conformidad por las partes:')
      .moveDown(2);

    doc.text('___________________________         ___________________________');
    doc.text('     El Arrendador                                El Arrendatario');
    doc.moveDown(2);

    // Finalizar documento
    doc.end();

    stream.on('finish', () => resolve(nombreArchivo));
    stream.on('error', reject);
  });
}

module.exports = generarContratoPDF;
