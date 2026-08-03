import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { GalleriaModule } from 'primeng/galleria';
import { KnobModule } from 'primeng/knob';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SliderModule } from 'primeng/slider';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

interface ImagenGaleria {
  src: string;
  miniatura: string;
  titulo: string;
  descripcion: string;
  alt: string;
}

@Component({
  selector: 'app-galeria',
  standalone: true,
  imports: [
    FormsModule,
    CardModule,
    GalleriaModule,
    KnobModule,
    SelectButtonModule,
    SliderModule,
    ToggleSwitchModule
  ],
  templateUrl: './galeria.html',
  styleUrl: './galeria.css'
})
export class Galeria {
  readonly imagenes: ImagenGaleria[] = [
    {
      src: '/galeria/paisaje.svg',
      miniatura: '/galeria/paisaje.svg',
      titulo: 'Horizonte',
      descripcion: 'Un paisaje sereno de montaña al atardecer.',
      alt: 'Montañas frente a un cielo cálido'
    },
    {
      src: '/galeria/ciudad.svg',
      miniatura: '/galeria/ciudad.svg',
      titulo: 'Ciudad',
      descripcion: 'Arquitectura y movimiento bajo un cielo azul.',
      alt: 'Edificios modernos de una ciudad'
    },
    {
      src: '/galeria/bosque.svg',
      miniatura: '/galeria/bosque.svg',
      titulo: 'Bosque',
      descripcion: 'Capas de vegetación en distintos tonos verdes.',
      alt: 'Bosque verde con árboles y colinas'
    },
    {
      src: '/galeria/mar.svg',
      miniatura: '/galeria/mar.svg',
      titulo: 'Costa',
      descripcion: 'El encuentro entre el océano y la arena.',
      alt: 'Olas azules llegando a una playa'
    }
  ];

  readonly opcionesVista = ['Compacta', 'Cómoda', 'Amplia'];
  readonly opcionesResponsivas = [
    { breakpoint: '720px', numVisible: 3 },
    { breakpoint: '480px', numVisible: 2 }
  ];

  reproduccionAutomatica = false;
  mostrarMiniaturas = true;
  intervalo = 3000;
  vista = 'Cómoda';
  zoom = 70;
}
