# Gauge prototype

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
* Create browser source and select target file to `index.html`
