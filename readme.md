<div style="background: linear-gradient(135deg,#0f172a 0%,#0b1220 100%); padding:32px; border-radius:12px; color:#e6eef8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; line-height:1.6;">

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-javascript.min.js"></script>

<style>
  .container {
    max-width: 980px;
    margin: 0 auto;
  }

  h1, h2, h3 {
    color: #e6eef8;
    margin: 0 0 12px 0;
    font-weight: 600;
  }

  p.lead {
    margin-top: 8px;
    color: #cfe8ff;
    margin-bottom: 18px;
  }

  hr {
    border: none;
    height: 1px;
    background: linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
    margin: 20px 0;
  }

  ul {
    margin-left: 20px;
    color: #d7e9ff;
  }

  .code-wrap {
    background: #1C1C1C;
    border-radius: 8px;
    padding: 18px;
    overflow: auto;
    box-shadow: 0 8px 30px rgba(2,6,23,0.6);
    margin: 14px 0 22px 0;
  }

  pre[class*="language-"] {
    margin: 0;
    background: transparent !important;
    color: #e6eef8;
    font-size: 13.5px;
    line-height: 1.6;
    padding: 0;
  }

  .meta {
    display: inline-block;
    background: rgba(255,255,255,0.03);
    color: #cfe8ff;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 12px;
    margin-bottom: 10px;
  }

  .note {
    color: #9fc5ff;
    font-size: 13px;
    margin-top: 6px;
  }

  .badge {
    display:inline-block;
    padding:6px 10px;
    border-radius:6px;
    background: rgba(255,255,255,0.03);
    color:#cfe8ff;
    font-size:12px;
    margin-right:8px;
  }

  .author {
    background:#071428;
    padding:10px;
    border-radius:8px;
    display:inline-block;
    color:#cfe8ff;
  }

  .license {
    background: rgba(255,255,255,0.02);
    padding:12px;
    border-radius:8px;
    color:#d7e9ff;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace;
    font-size:13px;
  }
</style>

<div class="container">

# 🔶 JS Runner Plugin para Acode

<p class="lead" style="font-size: 14px;">Un plugin que integra un <strong>ejecutor de JavaScript con consola</strong> dentro del editor <strong>Acode</strong>. Ejecuta archivos <code>.js</code>, captura la salida de la consola y permite interacción directa con el DOM de la aplicación.</p>

<hr>

 <p style="font-size:18px;">✅Resumen de funcionalidades
</p>
<ul>
  <li><strong>Botón flotante</strong> (arrastrable) para ejecutar el archivo activo.</li>
  <li><strong>Consola integrada</strong> que captura <code>console.log</code>, <code>console.error</code>, <code>console.warn</code>, <code>console.info</code> y <code>console.debug</code>.</li>
  <li><strong>Ejecutar archivo activo</strong> automáticamente al abrir la consola.</li>
  <li><strong>Entrada interactiva</strong> para evaluar expresiones en tiempo real con autocompletado básico.</li>
  <li><strong>UI arrastrable</strong>.</li>
  <li><strong>Manejo de asincronía</strong>: <code>async/await</code>, <code>Promise.all</code>, y captura de resultados en consola.</li>
</ul>

<hr>

<p style="color: rgba(255,255,255,0.8); font-size:14px;">🛠️ Instalación (resumen) </p>

<div class="meta">Resumen</div>


<p> Presiona <strong>instalar</strong> </p>
<p> <strong>Reinicia</strong> o <strong>recarga</strong> Acode para que detecte el plugin </p>


<hr>

🧩 Ejemplos de uso

Bucle simple del 1 al 30

<div class="code-wrap">
<pre class="language-js"><code>for (let i = 1; i <= 30; i++) {
  console.log(i);
}</code></pre>
</div>

Estadísticas básicas (lista 1..30)

<div class="code-wrap">
<pre class="language-js"><code>const numeros = [...Array(31).keys()].slice(1);
const stats = {
  total: numeros.length,
  suma: numeros.reduce((a, b) => a + b, 0),
  promedio: numeros.reduce((a, b) => a + b, 0) / numeros.length,
  max: Math.max(...numeros),
  min: Math.min(...numeros),
};
console.log("Números:", numeros);
console.log("Estadísticas:", stats);</code></pre>
</div>

Clase, herencia y asincronía

<div class="code-wrap">
<pre class="language-js"><code>class Persona {
  constructor(nombre, edad) {
    this.nombre = nombre;
    this.edad = edad;
  }
  saludar() {
    console.log(Hola, soy ${this.nombre} y tengo ${this.edad} años.);
  }
}

class Estudiante extends Persona {
  constructor(nombre, edad, curso) {
    super(nombre, edad);
    this.curso = curso;
  }
  estudiar() {
    console.log(${this.nombre} está estudiando ${this.curso}.);
  }
}

async function obtenerNotas(nombre) {
  console.log(Buscando notas de ${nombre}...);
  await new Promise(r => setTimeout(r, 1000));
  return [85, 92, 78, 90];
}

const alumno = new Estudiante("Kei", 21, "JavaScript avanzado");
alumno.saludar();
alumno.estudiar();

obtenerNotas(alumno.nombre).then(notas => {
  const promedio = notas.reduce((a,b)=>a+b,0)/notas.length;
  console.log(Promedio de ${alumno.nombre}: ${promedio.toFixed(2)});
});</code></pre>
</div>

<hr>


🌀 Sobre las pruebas visuales

Durante el desarrollo se implementaron experimentos visuales para validar la capacidad del plugin de interactuar con el DOM de Acode. Estos experimentos incluyeron:

- Animaciones con <code>requestAnimationFrame</code> y <code>setInterval</code>.
- Elementos inyectados (burbujas, formas, efectos de color) posicionados con <code>position: fixed</code> y <code>z-index</code> alto para mostrarse por encima de la interfaz.
- Eventos de interacción (clic, touch, seguimiento del cursor).

<p class="note"><strong>Propósito técnico:</strong> demostrar que el plugin no solo ejecuta código y captura la consola, sino que también puede crear interfaces visuales y experiencias interactivas dentro del contexto de Acode.</p>

Ejemplo de burbuja

<div class="code-wrap">
<pre class="language-js"><code>function crearBurbuja() {
  const burbuja = document.createElement('div');
  const tamaño = Math.floor(Math.random() * 40) + 20;
  burbuja.style.position = 'fixed';
  burbuja.style.left = Math.random() * window.innerWidth + 'px';
  burbuja.style.top = Math.random() * window.innerHeight + 'px';
  burbuja.style.width = tamaño + 'px';
  burbuja.style.height = tamaño + 'px';
  burbuja.style.borderRadius = '50%';
  burbuja.style.background = ['#FF6EC7','#00FFFF','#FFD700'][Math.floor(Math.random()*3)];
  burbuja.style.zIndex = '99999';
  burbuja.style.transition = 'transform 2s ease, opacity 2s ease';
  document.body.appendChild(burbuja);
  setTimeout(()=> {
    burbuja.style.transform = translateY(-${Math.random()200+100}px) scale(${Math.random()1.5+0.5}) rotate(${Math.random()*360}deg);
    burbuja.style.opacity = '0';
  },50);
  setTimeout(()=> burbuja.remove(),3000);
}</code></pre>
</div>

<hr>

🔐 Licencia

<div class="license">
CC BY-NC 4.0 License Adapted for Software

Copyright (c) 2026 Emilio.dev

Permission is hereby granted, free of charge, to any person obtaining a copy  
of this software and associated documentation files (the "Software"), to copy,  
modify, and redistribute the Software, provided that attribution is given to  
the original author and the Software is not used for commercial purposes.  

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR  
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  
FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE  
AUTHORS BE LIABLE FOR ANY CLAIMS, DAMAGES, OR OTHER LIABILITIES ARISING FROM  
THE USE OF THE SOFTWARE.  
</div>

<hr>

## 🟣 Autor y contacto

<div class="author">
  <strong>Emilio.dev</strong><br/>
  Contacto:<a href="mailto:kei.hexcode@gmail.com" style="color: #99ccff;"> 👤 Email</a>
</div>

<hr>


🚀 Resúmen

El JS Runner Plugin transforma Acode en un entorno interactivo para probar y depurar JavaScript rápidamente. Además de ejecutar código y capturar la consola, demuestra la capacidad de interactuar con el DOM de Acode, lo que permite crear herramientas visuales y experiencias interactivas integradas.

</div>
</div>