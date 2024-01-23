const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
const axios = require("axios")
const fs = require("fs")
const app = express()
const https = require("https")
const unzipper = require("unzipper")
// Middlewares
app.use(cors())
app.use(morgan("combined"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Ruta obtenerEstado
app.post("/obtenerEstado", (req, res) => {
  const xmlDoc = req.body.xmlDoc
  const xmlDocCookie = req.body
  const parser = require("xml2js").parseString
  parser(xmlDoc, { explicitArray: false }, (err, result) => {
    if (err) {
      console.error("Error al convertir XML a JSON:", err)
      return
    }

    const timbreFiscal =
      result["cfdi:Comprobante"]["cfdi:Complemento"]["tfd:TimbreFiscalDigital"][
        "$"
      ]

    const rfcEmisor = result["cfdi:Comprobante"]["cfdi:Emisor"]["$"]["Rfc"]
    const rfcReceptor = result["cfdi:Comprobante"]["cfdi:Receptor"]["$"]["Rfc"]
    const totalComprobante = result["cfdi:Comprobante"]["$"]["Total"]
    const uuidReq =
      result["cfdi:Comprobante"]["cfdi:Complemento"]["tfd:TimbreFiscalDigital"][
        "$"
      ]["UUID"]

    const selloEmisor2 =
      result["cfdi:Comprobante"]["cfdi:Complemento"]["tfd:TimbreFiscalDigital"][
        "$"
      ]["SelloCFD"]
    const ultimosOchoCaracteres = selloEmisor2.slice(-8)

    const datosCFDI = {
      re: rfcEmisor,
      rr: rfcReceptor,
      tt: totalComprobante,
      id: uuidReq,
      fe: ultimosOchoCaracteres
    }

    const uuid = timbreFiscal["UUID"]
    const selloEmisor = timbreFiscal["SelloCFD"]

    const xmlBody = `
        <soapenv:Envelope
           xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
           xmlns:tem="http://tempuri.org/">
           <soapenv:Header/>
           <soapenv:Body>
              <tem:Consulta>
                 <tem:expresionImpresa>
                    <![CDATA[?re=${datosCFDI.re}&rr=${datosCFDI.rr}&tt=${datosCFDI.tt}&id=${uuid}&fe=${selloEmisor}]]>
                 </tem:expresionImpresa>
              </tem:Consulta>
           </soapenv:Body>
        </soapenv:Envelope>`

    // Configuración de la solicitud
    const config = {
      headers: {
        "Content-Type": "text/xml;charset=utf-8",
        Accept: "text/xml",
        SOAPAction: "http://tempuri.org/IConsultaCFDIService/Consulta"
      }
    }
    const url =
      "https://consultaqr.facturaelectronica.sat.gob.mx/ConsultaCFDIService.svc"

    axios
      .post(url, xmlBody, config)
      .then((response) => {
        const responseData = response.data
        parser(responseData, { explicitArray: false }, (err, result) => {
          if (err) {
            console.error("Error al convertir XML a JSON:", err)
            return
          }
          const estadoFactura =
            result["s:Envelope"]["s:Body"]["ConsultaResponse"][
              "ConsultaResult"
            ]["a:Estado"]
          return res.json({
            estadoFactura
          })
        })
      })
      .catch((error) => {
        console.error("Error al enviar la solicitud:", error)
      })
  })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server Listening on PORT: ${PORT}`)
})
