import { Controller } from "@hotwired/stimulus"

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
const geoIpResponse = (async () => {
  const res = await fetch("https://geo-ip.astrids.workers.dev")
  if (res.status !== 200) throw new Error("Failed to fetch geo-ip")
  return res.json()
})()

// Connects to data-controller="google-maps"
export default class extends Controller {
  static targets = ["map", "lat", "lng"]

  connect() {
    google.maps.importLibrary("maps").then(({ Map }) => {
      this.loadMap(Map)
    })
  }

  async loadMap(Map) {
    // Get the lat and lng from the data attributes.
    let lat = parseFloat(this.latTarget.value)
    if (isNaN(lat)) lat = parseFloat((await geoIpResponse).lat)
    let lng = parseFloat(this.lngTarget.value)
    if (isNaN(lng)) lng = parseFloat((await geoIpResponse).lng)

    // Setup the map.
    const map = new Map(this.mapTarget, {
      center: { lat, lng },
      zoom: 16,
    })

    // Add a marker.
    const marker = new google.maps.Marker({
      position: { lat, lng },
      map,
      draggable: true,
    })

    // Handle any drag events on the marker.
    marker.addListener("dragend", () => {
      const position = marker.getPosition()
      this.latTarget.value = position.lat().toString()
      this.lngTarget.value = position.lng().toString()
    })
  }
}
