import { Controller } from "@hotwired/stimulus"
import { geoIpResponse } from "globals"

const clientPromise = window.algoliasearchWaitPromise.then(() => instantsearch({
  indexName: "Opportunity",
  searchClient: algoliasearch(...window.algoliaConfig),
}))

// Connects to data-controller="events-view"
export default class extends Controller {
  static targets = ["map"]

  connect() {
    clientPromise.then(this.loadEvents.bind(this))
  }

  async loadEvents(client) {
    // Get the lat and lng from the geo-ip response.
    let { lat, lng } = await geoIpResponse
    lat = parseFloat(lat)
    lng = parseFloat(lng)

    // Setup the map.
    const { Map } = await google.maps.importLibrary("maps")
    const map = new Map(this.mapTarget, {
      center: { lat, lng },
      zoom: 16,
    })
  }
}
