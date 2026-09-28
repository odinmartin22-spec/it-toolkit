# IT Toolkit

Pequeña navaja suiza para técnicos IT.

## Herramientas actuales

### 🌐 IP Calculator

Calculadora de redes IPv4 que permite obtener:

- Dirección de red
- Dirección de broadcast
- Primer host
- Último host
- Número de hosts disponibles

Trabaja con notación CIDR, por ejemplo:

`192.168.1.25/24`

### 🔐 Password Generator

Generador de contraseñas aleatorias que permite seleccionar la longitud.

Utiliza `crypto.getRandomValues()` del navegador para generar valores aleatorios de forma segura.

## Tecnología

Aplicación 100% frontend desarrollada con:

- HTML
- CSS
- JavaScript

No necesita backend, Python ni base de datos.

## Ejecutar localmente

```bash
python -m http.server 5500