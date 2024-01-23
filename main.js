var app = new Vue({
  el: "#app",
  data: {
    cfdis: [],
    errores: []
  },

  mounted: function () {
    this.$refs.drop.addEventListener("dragover", this.handleDragOver, false)
    this.$refs.drop.addEventListener("drop", this.handleFileSelect, false)
  },

  computed: {
    cantidad: function () {
      return this.cfdis.length
    }
  },

  methods: {
    toggleDetails(index) {
      this.cfdis[index].showDetails = !this.cfdis[index].showDetails
    },
    procesarArchivo(event) {
      const archivo = event.target.files[0]
      if (archivo) {
        const reader = new FileReader()

        reader.onload = (e) => {
          const data = e.target.result
          const workbook = XLSX.read(data, { type: "binary" })

          // Nombre de la hoja de trabajo ("Hoja1" en este caso)
          const sheetName = workbook.SheetNames[0]
          const sheet = workbook.Sheets[sheetName]

          // Convertir la hoja de cálculo en un objeto JSON
          const jsonData = XLSX.utils.sheet_to_json(sheet)

          // Extraer solo las celdas de la columna "__EMPTY"
          this.datosExcel = jsonData.map((item) => item.__EMPTY)
        }

        reader.readAsBinaryString(archivo)
      }
    },
    mostrarDatos() {
      const cfdis = this.cfdis
      const indicesAEliminar = []

      cfdis.forEach((cfdi, i) => {
        const {
          emisor: { rfc }
        } = cfdi
        console.log({
          listaNegra: this.datosExcel,
          rfc,
          esta: this.datosExcel.includes(rfc)
        })
        if (this.datosExcel.includes(rfc)) {
          indicesAEliminar.push(i)
        }
      })

      for (let i = indicesAEliminar.length - 1; i >= 0; i--) {
        const index = indicesAEliminar[i]
        cfdis.splice(index, 1)
        console.log("delete")
        
      }

      // Utilizar Vue.set para notificar a Vue del cambio en el array
      Vue.set(this, "cfdis", cfdis)
    },

    obtenerEstados() {},

    handleDragOver: function (evt) {
      evt.stopPropagation()
      evt.preventDefault()
      evt.dataTransfer.dropEffect = "copy" // Explicitly show this is a copy.
    },

    handleFileSelect: function (evt) {
      evt.stopPropagation()
      evt.preventDefault()
      var files = evt.dataTransfer.files // FileList object.
      for (var i = 0, f; (f = files[i]); i++) {
        var reader = new FileReader()
        // Closure to capture the file information.
        reader.onload = cargarXML(f)
        // Read in the image file as a data URL.
        reader.readAsText(f)
      }
    },

    total: function (item) {
      var suma = 0
      for (var i = item.conceptos.length - 1; i >= 0; i--) {
        suma += item.conceptos[i].importe
      }
      return suma
    },

    agregar: function (item) {
      //borrar si es que estuviera duplicado
      var arr = this.cfdis.filter(function (el) {
        return el.archivo != item.archivo
      })
      arr.push(item)
      this.cfdis = arr
      console.log("cfdis:")
      console.log(arr)
    }
  }
})
