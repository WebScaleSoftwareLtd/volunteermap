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
  static targets = ["map", "lat", "lng", "search"]

  connect() {
    const promise = Promise.all([
      google.maps.importLibrary("maps"),
      google.maps.importLibrary("places"),
    ]).then(([{ Map }, { SearchBox }]) => ({Map, SearchBox}))

    promise.then(({ Map, SearchBox }) => {
      this.loadMap(Map, SearchBox)
    })
  }

  async loadMap(Map, SearchBox) {
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

    // Check if the search box is present.
    try {
      // Setup the search box.
      const searchBox = new SearchBox(this.searchTarget)

      // Listen for the event fired when the user selects a prediction and move
      // the map and marker to that location.
      searchBox.addListener("places_changed", () => {
        const places = searchBox.getPlaces()
        if (places.length === 0) return
        const place = places[0]

        // If the place has no geometry, bail.
        if (!place.geometry) return

        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
          map.fitBounds(place.geometry.viewport)
        }

        // Set the position of the marker using the place ID and location.
        const position = place.geometry.location
        this.latTarget.value = position.lat().toString()
        this.lngTarget.value = position.lng().toString()
        marker.setPosition(position)
      })
    } catch {}

    // Add a marker.
    const marker = new google.maps.Marker({
      position: { lat, lng },
      map,
      draggable: this.element.dataset.draggable ? this.element.dataset.draggable === "true" : true,
    })

    // Handle any drag events on the marker.
    marker.addListener("dragend", () => {
      const position = marker.getPosition()
      this.latTarget.value = position.lat().toString()
      this.lngTarget.value = position.lng().toString()
    })
  }
}
