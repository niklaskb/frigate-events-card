# Frigate Events Card

**Frigate Events Card** is a custom Home Assistant Lovelace card that displays events from your Frigate instance in a user-friendly and compact format. This card allows you to easily monitor captured events, including clips, snapshots, and other relevant details.

## Features
- Displays a list of Frigate events (including custom events) with timestamps and confidence scores.
- Supports filtering based on confidence thresholds.
- Shows snapshots and clips when available.


## Installation

### Option 1: Install via HACS (Recommended)

1. **Ensure HACS is Installed**
   - If you don't already have HACS installed, follow the [HACS installation guide](https://hacs.xyz/docs/setup/download).

2. **Add the Repository**
   - In HACS, navigate to **Frontend > Explore & Download Repositories**.
   - Search for **Frigate Events Card** or manually add the repository:
     1. Go to **HACS > Settings**.
     2. Under "Custom repositories," paste the repository URL (e.g., `https://github.com/niklaskb/frigate-events-card`) and select **Lovelace** as the category.
     3. Click **Add**.

3. **Install the Card**
   - Find **Frigate Events Card** in the HACS Frontend section.
   - Click **Download** to install.

4. **Add to Resources**
   - HACS usually handles resources automatically. Verify the card is added under **Settings > Dashboards > Resources**:
     ```yaml
     url: /hacsfiles/frigate-events-card.js
     type: module
     ```

5. **Restart Home Assistant**
   - Restart Home Assistant to apply changes.

### Option 2: Manual Installation

1. **Download the Card**
   - Save the JavaScript file (`frigate-events-card.js`) to your Home Assistant `www` directory (e.g., `/config/www/`).

2. **Add to Resources**
   - In Home Assistant, go to **Settings > Dashboards > Resources**.
   - Add the following resource:
     ```yaml
     url: /local/frigate-events-card.js
     type: module
     ```

3. **Restart Home Assistant**
   - Restart Home Assistant to ensure the card is loaded properly.


## Configuration

Add the card to your Lovelace dashboard using the YAML editor or visual editor.

### Example Configuration
```yaml
type: custom:frigate-events-card
timezone: Europe/Stockholm
label_display_names:
  person: Person
  car: Car
  ir: Infrared
  unknown: Unknown
confidence_thresholds:
  camera_driveway: 0.8
  camera_backyard: 0.9
hours_to_show: 48
rows: 7
```

### Configuration Options
| Option                  | Type      | Default      | Description                                               |
|-------------------------|-----------|--------------|-----------------------------------------------------------|
| `instance_id`           | string    | `frigate`    | The Frigate instance ID.                                  |
| `timezone`              | string    | **Required** | The timezone for displaying event timestamps.             |
| `hours_to_show`         | number    | `24`         | The number of hours of events to display.                 |
| `max_num_events`        | number    | `100`        | The maximum number of events to retrieve.                 |
| `height_percent`        | number    | `50`         | The height of the card as a percentage of the viewport.   |
| `confidence_thresholds` | object    | `{}`         | Per-camera confidence thresholds for filtering events.    |
| `label_display_names`   | object    | `{}`         | Custom display names for event labels.                    |
| `show_non_confident`    | boolean   | `false`      | Whether to display non-confident events.                  |
| `rows`                  | number    | `5`          | The number of rows to allocate in grid layouts.           |

## Screenshots


### Contributing

Feel free to submit bug reports or feature requests via [GitHub Issues](https://github.com/your-repo-url). Contributions are welcome!


### License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
