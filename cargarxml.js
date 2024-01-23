function cargarXML(theFile) {
  return function (e) {
    console.log("importando " + theFile.name)
    try {
      var contenido = e.target.result
      var xmlDoc = $.parseXML(contenido)
      var $xml = $(xmlDoc)
      var comprobante = $xml.find("cfdi\\:Comprobante")
      var out = {
        archivo: theFile.name,
        version: comprobante.attr("Version"),
        folio: comprobante.attr("Folio"),
        fecha: comprobante.attr("Fecha"),
        condicionPago: comprobante.attr("CondicionesDePago"),
        formaPago: comprobante.attr("FormaPago"),
        noCertificado: comprobante.attr("NoCertificado"),
        certificado: comprobante.attr("Certificado"),
        subTotal: comprobante.attr("SubTotal"),
        moneda: comprobante.attr("Moneda"),
        total: comprobante.attr("Total"),
        tipoDeComprobante: comprobante.attr("TipoDeComprobante"),
        serie: comprobante.attr("Serie"),
        descuento: comprobante.attr("Descuento"),
        exportacion: comprobante.attr("Exportacion"),
        metodoPago: comprobante.attr("MetodoPago"),
        lugarExpedicion: comprobante.attr("LugarExpedicion"),
        totalimpuestostrasladados: 0,
        totalimpuestosretenidos: 0,
        complemento: {} // Se inicializa el objeto complemento
        // otros atributos que desees extraer
      }

      if (comprobante.children("cfdi\\:Impuestos").length > 0) {
        out.totalimpuestostrasladados = parseFloat(
          comprobante
            .children("cfdi\\:Impuestos")
            .attr("TotalImpuestosTrasladados")
        )
      }

      if (comprobante.children("cfdi\\:Impuestos").length > 0) {
        out.totalimpuestosretenidos = parseFloat(
          comprobante
            .children("cfdi\\:Impuestos")
            .attr("TotalImpuestosRetenidos")
        )
      }

      // Obtener el complemento
      var complemento = $xml.find("cfdi\\:Comprobante cfdi\\:Complemento")
      //  console.log('Complemento:', complemento);

      if (complemento.length > 0) {
        // Si hay un complemento, procede a obtener los datos deseados
        var timbreFiscalDigital = complemento.find("tfd\\:TimbreFiscalDigital")
        out.complemento = {
          timbreFiscalDigital: {
            version: timbreFiscalDigital.attr("Version"),
            rfcProvCertif: timbreFiscalDigital.attr("RfcProvCertif"),
            uuid: timbreFiscalDigital.attr("UUID"),
            fechaTimbrado: timbreFiscalDigital.attr("FechaTimbrado"),
            selloCFD: timbreFiscalDigital.attr("SelloCFD"),
            noCertificadoSAT: timbreFiscalDigital.attr("NoCertificadoSAT"),
            selloSAT: timbreFiscalDigital.attr("SelloSAT")
          }

          // Puedes agregar más información del complemento si es necesario
        }
        if (complemento.length > 0) {
          // Buscar la etiqueta pago20:Pagos dentro de cfdi:Complemento
          var pagos = complemento.find("pago20\\:Pagos")
          if (pagos.length > 0) {
            // Obtener los atributos de la etiqueta pago20:Totales
            var totales = pagos.find("pago20\\:Totales")
            var totalesData = {
              totalTrasladosBaseIVA16: totales.attr("TotalTrasladosBaseIVA16"),
              totalTrasladosImpuestoIVA16: totales.attr(
                "TotalTrasladosImpuestoIVA16"
              ),
              montoTotalPagos: totales.attr("MontoTotalPagos")
            }
            out.complemento.totales = totalesData

            // Obtener información de la etiqueta pago20:Pago
            var pago = pagos.find("pago20\\:Pago")
            var pagoData = {
              fechaPago: pago.attr("FechaPago"),
              formaDePagoP: pago.attr("FormaDePagoP"),
              monto: pago.attr("Monto")
              // Puedes agregar más atributos según sea necesario
            }
            out.complemento.pago = pagoData
          }
        }

        // Aquí puedes seguir extrayendo información adicional del complemento si es requerido
      }

      var cfdiRelacionados = $xml.find("cfdi\\:CfdiRelacionados")
      if (cfdiRelacionados.length > 0) {
        var tipoRelacion = cfdiRelacionados.attr("TipoRelacion")

        var cfdiRelacionado = cfdiRelacionados.find("cfdi\\:CfdiRelacionado")
        if (cfdiRelacionado.length > 0) {
          var uuid = cfdiRelacionado.attr("UUID")

          // Agregar al objeto 'out'
          out.cfdiRelacionados = {
            tipoRelacion: tipoRelacion,
            uuid: uuid
          }
        }
      }

      var nomina = $xml.find("nomina12\\:Nomina")

      if (nomina.length > 0) {
        var nominaData = {
          version: nomina.attr("Version"),
          tipoNomina: nomina.attr("TipoNomina"),
          fechaPago: nomina.attr("FechaPago"),
          fechaInicialPago: nomina.attr("FechaInicialPago"),
          fechaFinalPago: nomina.attr("FechaFinalPago"),
          numDiasPagados: nomina.attr("NumDiasPagados"),
          totalPercepciones: nomina.attr("TotalPercepciones"),
          totalDeducciones: nomina.attr("TotalDeducciones"),
          totalOtrosPagos: nomina.attr("TotalOtrosPagos")
          // Puedes seguir agregando más atributos según sea necesario
        }

        var emisorNomina = nomina.find("nomina12\\:Emisor")
        var emisorData = {
          registroPatronal: emisorNomina.attr("RegistroPatronal"),
          Curp: emisorNomina.attr("Curp")
          // Puedes agregar más atributos del emisor de la nómina si es necesario
        }
        nominaData.emisor = emisorData

        var receptorNomina = nomina.find("nomina12\\:Receptor")
        var receptorData = {
          curp: receptorNomina.attr("Curp"),
          numSeguridadSocial: receptorNomina.attr("NumSeguridadSocial"),
          fechaInicioRelLaboral: receptorNomina.attr("FechaInicioRelLaboral"),
          antiguedad: receptorNomina.attr("Antigüedad"),
          tipoContrato: receptorNomina.attr("TipoContrato"),
          tipoJornada: receptorNomina.attr("TipoJornada"),
          tipoRegimen: receptorNomina.attr("TipoRegimen"),
          numEmpleado: receptorNomina.attr("NumEmpleado"),
          riesgoPuesto: receptorNomina.attr("RiesgoPuesto"),
          periodicidadPago: receptorNomina.attr("PeriodicidadPago"),
          cuentaBancaria: receptorNomina.attr("CuentaBancaria"),
          salarioBaseCotApor: receptorNomina.attr("SalarioBaseCotApor"),
          salarioDiarioIntegrado: receptorNomina.attr("SalarioDiarioIntegrado"),
          claveEntFed: receptorNomina.attr("ClaveEntFed")
          // Puedes seguir agregando más atributos del receptor de la nómina si es necesario
        }
        nominaData.receptor = receptorData

        var percepciones = nomina.find("nomina12\\:Percepciones")
        var percepcionesData = {
          totalSueldos: percepciones.attr("TotalSueldos"),
          totalGravado: percepciones.attr("TotalGravado"),
          totalExento: percepciones.attr("TotalExento")
          // Puedes seguir agregando más atributos de percepciones si es necesario
        }
        nominaData.percepciones = percepcionesData

        var percepcion = percepciones.find("nomina12\\:Percepcion")
        var percepcionData = {
          tipoPercepcion: percepcion.attr("TipoPercepcion"),
          clave: percepcion.attr("Clave"),
          concepto: percepcion.attr("Concepto"),
          importeGravado: percepcion.attr("ImporteGravado"),
          importeExento: percepcion.attr("ImporteExento")
          // Puedes seguir agregando más atributos de percepción si es necesario
        }
        nominaData.percepcion = percepcionData
        var separacionIndemnizacion = percepciones.find(
          "nomina12\\:SeparacionIndemnizacion"
        )
        var separacionIndemnizacionData = {
          totalPagado: separacionIndemnizacion.attr("TotalPagado"),
          numAñosServicio: separacionIndemnizacion.attr("NumAñosServicio"),
          ultimoSueldoMensOrd: separacionIndemnizacion.attr(
            "UltimoSueldoMensOrd"
          ),
          ingresoAcumulable: separacionIndemnizacion.attr("IngresoAcumulable"),
          ingresoNoAcumulable: separacionIndemnizacion.attr(
            "IngresoNoAcumulable"
          )
          // Puedes seguir agregando más atributos de la separación por indemnización si es necesario
        }
        nominaData.separacionIndemnizacion = separacionIndemnizacionData

        var deducciones = nomina.find("nomina12\\:Deducciones")
        var deduccionesData = {
          totalImpuestosRetenidos: deducciones.attr("TotalImpuestosRetenidos"),
          TotalOtrasDeducciones: deducciones.attr("TotalOtrasDeducciones")
          // Puedes seguir agregando más atributos de deducciones si es necesario
        }
        nominaData.deducciones = deduccionesData

        var deduccion = deducciones.find("nomina12\\:Deduccion")
        var deduccionData = {
          tipoDeduccion: deduccion.attr("TipoDeduccion"),
          clave: deduccion.attr("Clave"),
          concepto: deduccion.attr("Concepto"),
          importe: deduccion.attr("Importe")
          // Puedes seguir agregando más atributos de deducción si es necesario
        }
        nominaData.deduccion = deduccionData

        // Aquí puedes continuar extrayendo información adicional de la nómina si es necesario

        out.nomina = nominaData
      }

      //  var impuestosLocales = $xml.find('implocal\\:ImpuestosLocales');

      //  if (impuestosLocales.length > 0) {
      //    var totalTraslados = impuestosLocales.attr('TotaldeTraslados');
      //    var totalRetenciones = impuestosLocales.attr('TotaldeRetenciones');

      //    out.impuestosLocales = {
      //      totalTraslados: totalTraslados,
      //      totalRetenciones: totalRetenciones
      //    };
      //  }

      var trasladosLocales = $xml.find(
        "implocal\\:ImpuestosLocales implocal\\:TrasladosLocales"
      )
      out.trasladosLocales = []

      trasladosLocales.each(function () {
        var trasladoLocal = $(this)
        var trasladoLocalData = {
          ImpLocTrasladado: trasladoLocal.attr("ImpLocTrasladado"),
          Importe: trasladoLocal.attr("Importe"),
          TasadeTraslado: trasladoLocal.attr("TasadeTraslado")
        }
        out.trasladosLocales.push(trasladoLocalData)
      })

      // Continuar con el procesamiento del archivo o realizar otras operaciones según sea necesario

      // Agregar 'out' a tu aplicación o hacer cualquier cosa necesaria con los datos extraídos

      var emisor = comprobante.find("cfdi\\:Emisor")
      out.emisor = {
        rfc: emisor.attr("Rfc"),
        nombre: emisor.attr("Nombre"),
        regimenFiscal: emisor.attr("RegimenFiscal")
      }

      var emisor = comprobante.find("cfdi\\:Emisor")
      out.emisor = {
        rfc: emisor.attr("Rfc"),
        nombre: emisor.attr("Nombre"),
        regimenFiscal: emisor.attr("RegimenFiscal")
      }

      var receptor = comprobante.find("cfdi\\:Receptor")
      out.receptor = {
        rfc: receptor.attr("Rfc"),
        nombre: receptor.attr("Nombre"),
        domicilioFiscalReceptor: receptor.attr("DomicilioFiscalReceptor"),
        regimenFiscalReceptor: receptor.attr("RegimenFiscalReceptor"),
        usoCFDI: receptor.attr("UsoCFDI")
      }

      var conceptos = comprobante.find("cfdi\\:Conceptos cfdi\\:Concepto")
      out.conceptos = []

      conceptos.each(function () {
        var concepto = $(this)
        var conceptoData = {
          claveProdServ: concepto.attr("ClaveProdServ"),
          noIdentificacion: concepto.attr("NoIdentificacion"),
          cantidad: concepto.attr("Cantidad"),
          claveUnidad: concepto.attr("ClaveUnidad"),
          unidad: concepto.attr("Unidad"),
          descripcion: concepto.attr("Descripcion"),
          valorUnitario: concepto.attr("ValorUnitario"),
          importe: concepto.attr("Importe"),
          objetoImp: concepto.attr("ObjetoImp")
        }

        var impuestosTraslados = concepto.find(
          "cfdi\\:Impuestos cfdi\\:Traslados cfdi\\:Traslado"
        )
        conceptoData.impuestosTraslados = []

        impuestosTraslados.each(function () {
          var impuestoTraslado = $(this)
          var trasladoData = {
            base: impuestoTraslado.attr("Base"),
            impuesto: impuestoTraslado.attr("Impuesto"),
            tipoFactor: impuestoTraslado.attr("TipoFactor"),
            tasaOCuota: impuestoTraslado.attr("TasaOCuota"),
            importe: impuestoTraslado.attr("Importe")
          }
          conceptoData.impuestosTraslados.push(trasladoData)
        })

        var impuestosRetenciones = concepto.find(
          "cfdi\\:Impuestos cfdi\\:Retenciones cfdi\\:Retencion"
        )
        conceptoData.impuestosRetenciones = []

        impuestosRetenciones.each(function () {
          var impuestoRetencion = $(this)
          var retencionData = {
            base: impuestoRetencion.attr("Base"),
            impuesto: impuestoRetencion.attr("Impuesto"),
            tipoFactor: impuestoRetencion.attr("TipoFactor"),
            tasaOCuota: impuestoRetencion.attr("TasaOCuota"),
            importe: impuestoRetencion.attr("Importe")
          }
          conceptoData.impuestosRetenciones.push(retencionData)
        })

        out.conceptos.push(conceptoData)
      })

      var impuestos = comprobante.find("cfdi\\:Impuestos")
      out.impuestos = {
        trasladosImpuestos1: [],
        trasladosQuery:[],
        retencionesImpuestos: []
      }

      // Obtener los traslados dentro de Impuestos
      var trasladosImpuestos1 = impuestos.find(
        "cfdi\\:Comprobante cfdi\\:Impuestos cfdi\\:Traslados cfdi\\:Traslado"
      )
      trasladosImpuestos1.each(function () {
        var traslado = $(this)
        var trasladoData2 = {
          impuesto: traslado.attr("Impuesto"),
          TasaOCuota: traslado.attr("TasaOCuota"),

          importe: traslado.attr("Importe")
        }

        out.impuestos.trasladosImpuestos1.push(trasladoData2)
      })
      // -----------------------------------------------------------
      
    // Para Traslados
var trasladosQuery = impuestos.find(
  "cfdi\\:Comprobante > cfdi\\:Impuestos > cfdi\\:Traslados > cfdi\\:Traslado"
);
trasladosQuery.each(function () {
  var trasladoElement = $(this);
  var trasladoData = {
    impuesto: trasladoElement.attr("Impuesto"),
    TasaOCuota: trasladoElement.attr("TasaOCuota"),
    importe: trasladoElement.attr("Importe"),
  };

  out.impuestos.trasladosQuery.push(trasladoData);
});

      










      // Obtener las retenciones dentro de Impuestos
      var retencionesImpuestos = impuestos.find(
        "cfdi\\:Retenciones cfdi\\:Retencion"
      )
      retencionesImpuestos.each(function () {
        var retencion = $(this)
        var retencion3Data = {
          impuesto: retencion.attr("Impuesto"),
          TasaOCuota: traslado.attr("TasaOCuota"),

          importe: retencion.attr("Importe")
        }

        out.impuestos.retencionesImpuestos.push(retencion3Data)
      })



      























      var timbreFiscalDigital = comprobante.find("tfd\\:TimbreFiscalDigital")
      out.timbreFiscalDigital = {
        version: timbreFiscalDigital.attr("Version"),
        rfcProvCertif: timbreFiscalDigital.attr("RfcProvCertif"),
        uuid: timbreFiscalDigital.attr("UUID"),
        fechaTimbrado: timbreFiscalDigital.attr("FechaTimbrado"),
        selloCFD: timbreFiscalDigital.attr("SelloCFD"),
        noCertificadoSAT: timbreFiscalDigital.attr("NoCertificadoSAT"),
        selloSAT: timbreFiscalDigital.attr("SelloSAT")
      }
      var datosCFDI = {
        re: out.emisor.rfc,
        rr: out.receptor.rfc,
        tt: out.Total,
        id: out.timbreFiscalDigital.uuid,
        fe: out.timbreFiscalDigital.selloCFD.slice(-8)
      }

      // Construir cuerpo SOAP
      var xmlBody = `
        <soapenv:Envelope
           xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
           xmlns:tem="http://tempuri.org/">
           <soapenv:Header/>
           <soapenv:Body>
              <tem:Consulta>
                 <tem:expresionImpresa>
                    <![CDATA[?re=${datosCFDI.re}&rr=${datosCFDI.rr}&tt=${datosCFDI.tt}&id=${datosCFDI.id}&fe=${datosCFDI.fe}]]>
                 </tem:expresionImpresa>
              </tem:Consulta>
           </soapenv:Body>
        </soapenv:Envelope>`

      // Configuración de la solicitud
      var config = {
        method: "POST",
        body: JSON.stringify({ xmlDoc }),
        headers: {
          "Content-Type": "application/json"
        }
      }
      var url = "http://localhost:3000/obtenerEstado"

      // Realizar la solicitud SOAP utilizando fetch
      fetch(url, {
        method: "POST",
        body: JSON.stringify({ xmlDoc: contenido }),
        headers: {
          "Content-Type": "application/json"
        }
      })
        .then((response) => response.json())
        .then((responseData) => {
          console.log("Respuesta:")
          console.log(responseData)

          var estado = responseData.estadoFactura

          out.estadoFactura = estado
          app.agregar(out)
        })
        .catch((error) => {
          console.error("Error al enviar la solicitud:", error)
        })
    } catch (e) {
      app.errores.push({
        archivo: theFile.name,
        mensaje: e.message
      })
    }
  }
}
