# CoterieWebRTC

# install

just run

```
npm install
```

# run

in develop

```
npm run dev
```

# Emits

|  name  |                          params                           |                        description                         |
| :----: | :-------------------------------------------------------: | :--------------------------------------------------------: |
| `join` |                          string                           | unirse al chat con un `username` único |
| `call` | `{ username: string, offer: { type: string, sdp: any } }` | llama a un usuario por su `username` y necesitas pasar el `offer`  |
| `answer` | `{ username: string, answer: { type: string, sdp: any } }` | envia una respuesta a alguien que solicite una llamada por `username` y necesitas pasar el `answer`  |
| `candidate` | `{ username: string, candidate: { candidate: string, sdpMid: string, sdpMLineIndex: int } }` | cuando las dos partes se han unido a una llamada, ambos necesitan enviar sus `ICECandidates` a la otra parte  |
# Ons

|  name  |                          params                           |                        description                         |
| :----: | :-------------------------------------------------------: | :--------------------------------------------------------: |
| `on-join` |                          boolean                           | este listener es la respuesta a `join` , si el parametro `boolean` es True se unió al chat |
| `on-call` | `{ username: string, offer: { type: string, sdp: any } }` | llamada entrante  |
| `on-answer` | `{ type: string, sdp: any }` | respuesta e una `call`  |
| `on-candidate` | `{ candidate: string, sdpMid: string, sdpMLineIndex: int }` | escucha el `ICECandidate` de la otra parte  |
 
