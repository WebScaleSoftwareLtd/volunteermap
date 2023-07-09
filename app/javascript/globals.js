// For the interests of transparency, this exists so that it is easy and extremely cheap to do geo-IP.
// Here is the code I am using in that worker:
// export default {
//   async fetch(request, env, ctx) {
//     return new Response(JSON.stringify({
//       lat: request.cf.latitude, lng: request.cf.longitude,
//     }), {
//       headers: {
//         'Content-Type': 'application/json; charset=utf-8',
//         'Access-Control-Allow-Origin': '*',
//       },
//     })
//   },
// };
export const geoIpResponse = (async () => {
    const res = await fetch("https://geo-ip.astrids.workers.dev")
    if (res.status !== 200) throw new Error("Failed to fetch geo-ip")
    return res.json()
})()
