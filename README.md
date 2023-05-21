# Gauge prototype

## Purpose
A gauge-style display with a pointer and a variable value range for OBS that can be controlled over a websocket.
The value gradually decreases over time. When the value reaches the minimum a message is dispatched via websocket to the server.
The visuals are rather simple and probably not very pleasing to the eye, yet. However, this proof of concept depicts the
communication between a bot and the webpage.

## Motivation
When trying to create dynamic graphics or animations for your stream, you sometimes reach the limits of layering multiple graphics
and texts inside OBS and controlling their visibility, position or size via a bot script. There are lots of graphics and animations
out there on sites like [CodePen](https://codepen.io/) that are written in HTML, CSS and JavaScript and can simply be integrated as
a browser source in OBS. Even parameterization is possible via query parameters. Bots such as streamer.bot can set the OBS
browser source and alter the query parameters, the webpage itself can gain access to those via JavaScript.

However, when we tried to design a very fluent gauge animation with a decreasing value and a pointer that smoothly changes its position,
updating gauge parameters by changing query parameters and setting the browser source target always causes a reload. That is rather
unpleasing, as you can witness the reload quite easily and the pointer is not smoothly transitioned into its new state. A basic solution
could have been to just capture the pointer position or its underlying value and use it as the pointer's start position. However, that
would require us to somehow transfer the current state to the bot. As the value is decreasing over time you could approximate the amount
the pointer has moved in the meantime. As it would also require the browser source to refresh the page, the user might notice anyways.
We therefore came up with the idea of communicating parameter and state changes via websocket communication. The bot sets up a websocket server and the webpage connects to it and listens for gauge parameter updates.

## Installation

### Streamer.bot
1) Import `sbexport` file, which contains following actions
    * `Gauge Message Received`
    * `Reset Gauge`
2) Under `Servers/Clients` / `Websocket Servers` add a server
    * Name: `Gauge`
    * Address: `127.0.0.1`
    * Port: `9090`
    * Endpoint: `/gauge`
    * Set message action to `Gauge Message Received`

### OBS
Create browser source and select target file to `gauge.html`.

## ToDo's
- Better visuals
    - [ ] Dynamic size
    - [ ] Configurable colors and fonts
    - [ ] Optional fade-in and fade-out
- [ ] Configurable pointer direction (increasing / decreasing)
