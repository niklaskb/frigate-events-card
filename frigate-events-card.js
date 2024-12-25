// Helper function to format date
function formatTimestamp(timestamp, timezone) {
    const date = new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
    return date.toLocaleString('sv-SE', { timeZone: timezone, hour12: false }); // Format date in 'YYYY-MM-DD HH:mm:ss'
}

class FrigateEventsCard extends HTMLElement {
    constructor() {
        super();
        this.initialized = false;
    }

    // Whenever the state changes, a new `hass` object is set. Use this to update your content.
    set hass(hass) {
        if (!this.config) {
            throw new Error("Config is not set. Ensure `setConfig` is called before `hass`.");
        }

        if (this.initialized && this.content) {
            return;
        }

        // Initialize the content if it's not there yet.
        if (!this.content) {
            this.innerHTML = `
                <ha-card header="">
                    <div style="overflow-x: auto; max-height: ${this.config.height_percent}vh;" class="card-content"></div>
                </ha-card>
            `;
            this.content = this.querySelector(".card-content");
        }

        const entityId = this.config.entity;
        const state = hass.states[entityId];
        const stateStr = state ? state.state : "unavailable";

        const end = new Date();
        const msToShow = this.config.hours_to_show * 60 * 60 * 1000; // Convert hours to milliseconds
        const start = new Date(end.getTime() - msToShow);

        hass.callWS({
            type: 'frigate/events/get',
            instance_id: this.config.instance_id,
            after: Math.floor(start.getTime() / 1000),
            before: Math.floor(end.getTime() / 1000),
            limit: this.config.max_num_events,
        }).then((response) => {
            if (this.content.innerHTML !== "<p>Loading...</p>") {
                return;
            }

            const events = Array.isArray(response) ? response : JSON.parse(response);
            this.renderEvents(events);
            this.initialized = true;
        }).catch((error) => {
            console.error("Error occurred:", error);
            this.content.innerHTML = "<p>Error loading events. Please try again.</p>";
        });

        this.content.innerHTML = "<p>Loading...</p>"; // Display loading message
    }

    // Render the events
    renderEvents(events) {
        this.content.innerHTML = ""; // Clear existing content
    
        if (!events || events.length === 0) {
            this.content.innerHTML = `<p>No events found for the last ${this.config.hours_to_show} hours.</p>`;
            return;
        }
    
        const ul = document.createElement("ul");
        ul.style.padding = "0";
        ul.style.marginBlock = "0";
        ul.style.listStyleType = "none";
    
        const fragment = document.createDocumentFragment(); // Use a document fragment
        events.forEach((event) => {
            const localTimestamp = formatTimestamp(event.start_time, this.config.timezone);
            const score = event.data ? Math.max(event.data.score, event.data.top_score) : 0;
            const confidentThreshold = this.config.confidence_thresholds[event.camera] || 0;
            const confident = score > confidentThreshold;
    
            if (this.config.show_non_confident) {
                if (score == 0 || confident) {
                    return;
                }
            } else {
                if (score > 0 && !confident) {
                    return;
                }
            }
    
            const labelDisplayName = this.config.label_display_names[event.label] || event.label;
            const unknownDisplayName = this.config.label_display_names["unknown"] || "Unknown";
            const percent = Math.round(score * 1000) / 10; // Round to 1 decimal place
            const label = score > 0
                ? `: ${confident ? labelDisplayName : unknownDisplayName} (${percent}%)`
                : `: ${labelDisplayName}`;
    
            const listItem = document.createElement("li");
            listItem.textContent = `• ${localTimestamp}${label}`;
    
            if (event.has_clip && event.has_snapshot) {
                const link = document.createElement("a");
                link.href = `/api/frigate/notifications/${event.id}/clip.mp4`;
                link.target = "_blank";
    
                const img = document.createElement("img");
                img.style.width = "100%";
                img.src = `/api/frigate/notifications/${event.id}/snapshot.jpg`;
                img.alt = `${event.camera} - ${localTimestamp}`;
    
                link.appendChild(img);
                listItem.appendChild(link);
            } else if (event.has_snapshot) {
                const img = document.createElement("img");
                img.style.width = "100%";
                img.style.border = "2px solid red";
                img.src = `/api/frigate/notifications/${event.id}/snapshot.jpg`;
                img.alt = `${event.camera} - ${localTimestamp}`;
    
                listItem.appendChild(img);
            }
    
            fragment.appendChild(listItem); // Append to fragment
        });
    
        ul.appendChild(fragment); // Append fragment to ul
        this.content.appendChild(ul); // Append ul to content
    }

    // The user supplied configuration. Throw an exception and Home Assistant will render an error card.
    setConfig(config) {
        const c = {};

        if (!config.timezone) {
            throw new Error("You need to define a timezone");
        }
        c.timezone = config.timezone;

        c.confidence_thresholds = config.confidence_thresholds || {};
        c.show_non_confident = config.show_non_confident || false;
        c.label_display_names = config.label_display_names || {};
        c.instance_id = config.instance_id || "frigate";
        c.hours_to_show = config.hours_to_show || 24;
        c.max_num_events = config.max_num_events || 100;
        c.height_percent = config.height_percent || 50;
        c.rows = config.rows || 5;

        this.config = c;
    }

    // The height of your card. Home Assistant uses this to automatically distribute cards in masonry view.
    getCardSize() {
        return this.config.rows;
    }

    // The rules for your card for sizing your card in grid view.
    getLayoutOptions() {
        return {
            grid_rows: this.config.rows,
            grid_columns: 6,
            grid_min_rows: this.config.rows,
            grid_max_rows: this.config.rows,
        };
    }
}

customElements.define("frigate-events-card", FrigateEventsCard);

