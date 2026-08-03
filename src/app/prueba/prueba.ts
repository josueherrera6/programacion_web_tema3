import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-prueba',
  imports: [FormsModule],
  templateUrl: './prueba.html',
  styleUrl: './prueba.css',
})
export class Prueba {

  nombre = "KEVIN"

  boton = "ENVIAR INFORMACIÓN"

  imagen = "tecmina.png"
  ancho = 200
  alto = 200

  color = "blue"

  mostrar = true

  activar = true

  alumnos = ['ivan', 
    'miguel',
    'logan',
    'johan']

  nuevo = ''

  guardar = true;

  contenido = ''

  actualizar(event: Event){
    const input = event.target as HTMLInputElement
    this.contenido = input.value
    console.log(this.contenido)
  }

  agregarNuevo(){
    this.alumnos.push(this.nuevo)
    this.nuevo = ''
  }

  saludar(){
    alert("HOLA " + this.nombre)
  }

  cambiarTextoBoton(){
    if (this.boton == "ENVIAR INFORMACIÓN")
      this.boton = "CANCELAR"
    else 
      this.boton = "ENVIAR INFORMACIÓN"
  }

  aumentar(){
    this.ancho += 10
    this.alto += 10
  }

  reducir(){
    this.alto -= 10
    this.ancho -= 10
  }

}
