import { Controller } from "@hotwired/stimulus"
import { geoIpResponse } from "globals"

const algoliaClient = window.algoliasearchWaitPromise.then(() => algoliasearch(...window.algoliaConfig))

// Connects to data-controller="events-view"
export default class extends Controller {
  static targets = ["map", "search", "hits", "refinements"]

  connect() {
    window.algoliasearchWaitPromise.then(this.loadEvents.bind(this))
  }

  async loadEvents() {
    // Load in the Google Maps SDK.
    await google.maps.importLibrary("maps")

    // Get the lat and lng from the geo-ip response.
    let { lat, lng } = await geoIpResponse
    lat = parseFloat(lat)
    lng = parseFloat(lng)

    // Setup the Algolia client.
    const client = instantsearch({
      indexName: "Opportunity",
      searchClient: await algoliaClient,
    })

    // Setup the Algolia widgets.
    client.addWidgets([
      instantsearch.widgets.geoSearch({
        container: this.mapTarget,
        googleReference: window.google,
        initialPosition: { lat, lng },
        mapOptions: {
          fullscreenControl: false,
          mapTypeControl: true,
          zoomControl: false,
          zoom: 14,
          mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
            mapTypeIds: ["roadmap", "satellite"],
            position: google.maps.ControlPosition.BOTTOM_LEFT,
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          },
        },
        enableRefineControl: false,
      }),

      instantsearch.widgets.searchBox({
        container: this.searchTarget,
        placeholder: "Search...",
        showReset: false,
        showSubmit: false,
        cssClasses: {
          input: "w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white rounded-lg",
        },
      }),

      instantsearch.widgets.hits({
        container: this.hitsTarget,
        templates: {
          item(hit, { html }) {
            return html`
              ${hit.__hitIndex ? html`<hr class="my-2 dark:border-gray-500" />` : ""}
              <turbo-frame src="/_home/opportunity/${hit.uuid}" id="opportunity-${hit.uuid}"></turbo-frame>
            `
          },
        },
      }),
    ])

    // Start the Algolia search client.
    client.start()
  }
}
