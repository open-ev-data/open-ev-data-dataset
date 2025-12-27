# How to Consume OpenEV Data

This guide explains how to download and use the OpenEV Data dataset in various formats.

## Available Formats

The dataset is available in multiple formats to suit different use cases:

| Format | Size | Best For | File Extension |
|--------|------|----------|----------------|
| JSON | ~46 KB | APIs, Web Apps, JavaScript | `.json` |
| CSV | ~4 KB | Spreadsheets, Analytics, Excel | `.csv` |
| PostgreSQL | ~37 KB | Production Databases, Complex Queries | `.sql` |
| SQLite | ~128 KB | Mobile Apps, Desktop Apps, Embedded | `.db` |
| XML | ~14 KB | Enterprise Systems, Legacy Integration | `.xml` |

## Downloading the Dataset

### Latest Release

Download the latest version directly from GitHub:

```bash
LATEST_TAG=$(curl -s https://api.github.com/repos/open-ev-data/open-ev-data-dataset/releases/latest | jq -r .tag_name)

curl -L -o open-ev-data.json "https://github.com/open-ev-data/open-ev-data-dataset/releases/download/$LATEST_TAG/open-ev-data-$LATEST_TAG.json"
curl -L -o open-ev-data.csv "https://github.com/open-ev-data/open-ev-data-dataset/releases/download/$LATEST_TAG/open-ev-data-$LATEST_TAG.csv"
curl -L -o open-ev-data.sql "https://github.com/open-ev-data/open-ev-data-dataset/releases/download/$LATEST_TAG/open-ev-data-$LATEST_TAG.sql"
curl -L -o open-ev-data.db "https://github.com/open-ev-data/open-ev-data-dataset/releases/download/$LATEST_TAG/open-ev-data-$LATEST_TAG.db"
curl -L -o open-ev-data.xml "https://github.com/open-ev-data/open-ev-data-dataset/releases/download/$LATEST_TAG/open-ev-data-$LATEST_TAG.xml"
```

### Specific Version

Replace `v1.0.0` with your desired version:

```bash
VERSION="v1.0.0"
curl -L -o open-ev-data.json "https://github.com/open-ev-data/open-ev-data-dataset/releases/download/$VERSION/open-ev-data-$VERSION.json"
```

## Using JSON Format

### Structure

```json
{
  "version": "1.0.0",
  "generated_at": "2025-01-01T00:00:00Z",
  "vehicles": [
    {
      "brand": "BYD",
      "model": "Dolphin",
      "variant": "Standard Range",
      "year": 2024,
      "battery": {
        "capacity_kwh": 44.9
      },
      "range": {
        "wltp": {
          "km": 340,
          "miles": 211
        }
      },
      "sources": [
        {
          "country": "Brazil",
          "name": "Official Website",
          "url": "https://..."
        }
      ]
    }
  ]
}
```

### Examples

#### JavaScript/Node.js

```javascript
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('open-ev-data.json', 'utf8'));

console.log(`Dataset version: ${data.version}`);
console.log(`Total vehicles: ${data.vehicles.length}`);

const bydVehicles = data.vehicles.filter(v => v.brand === 'BYD');
console.log(`BYD vehicles: ${bydVehicles.length}`);
```

#### Python

```python
import json
import requests

url = "https://github.com/open-ev-data/open-ev-data-dataset/releases/latest/download/open-ev-data.json"
response = requests.get(url)
data = response.json()

print(f"Dataset version: {data['version']}")
print(f"Total vehicles: {len(data['vehicles'])}")

byd_vehicles = [v for v in data['vehicles'] if v['brand'] == 'BYD']
print(f"BYD vehicles: {len(byd_vehicles)}")

for vehicle in byd_vehicles:
    print(f"- {vehicle['brand']} {vehicle['model']} ({vehicle['year']})")
```

#### curl + jq

```bash
curl -sL "https://github.com/open-ev-data/open-ev-data-dataset/releases/latest/download/open-ev-data.json" | \
  jq '.vehicles[] | select(.brand == "BYD") | "\(.brand) \(.model) \(.year)"'
```

## Using CSV Format

### Structure

```csv
brand,model,variant,year,battery_capacity_kwh,range_km,range_miles,charging_speed_kw,acceleration_0_100_kmh,top_speed_kmh,drive_type,seats,country,source_name,source_url
BYD,Dolphin,Standard Range,2024,44.9,340,211,60,10.5,160,FWD,5,Brazil,Official Website,https://...
```

### Examples

#### Excel/Google Sheets

1. Download the CSV file
2. Open in Excel or Google Sheets
3. Use built-in filters and pivot tables

#### Python/Pandas

```python
import pandas as pd

url = "https://github.com/open-ev-data/open-ev-data-dataset/releases/latest/download/open-ev-data.csv"
df = pd.read_csv(url)

print(df.describe())

avg_range = df.groupby('brand')['range_km'].mean()
print(avg_range)

df_2024 = df[df['year'] == 2024]
print(f"2024 vehicles: {len(df_2024)}")
```

#### R

```r
library(tidyverse)

url <- "https://github.com/open-ev-data/open-ev-data-dataset/releases/latest/download/open-ev-data.csv"
data <- read_csv(url)

summary(data)

data %>%
  group_by(brand) %>%
  summarise(avg_range = mean(range_km, na.rm = TRUE)) %>%
  arrange(desc(avg_range))
```

## Using PostgreSQL Format

### Import into Database

```bash
psql -U postgres -d mydb -f open-ev-data.sql
```

### Docker PostgreSQL

Use the pre-populated Docker image:

```bash
docker run -d \
  --name openev-postgres \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=openevdata \
  ghcr.io/open-ev-data/open-ev-data-postgres:latest
```

Connect:
```bash
psql -h localhost -U openevdata -d openevdata
```

### Query Examples

```sql
SELECT brand, model, year, battery_capacity_kwh
FROM vehicles
WHERE brand = 'BYD'
ORDER BY year DESC;

SELECT brand, COUNT(*) as total_models
FROM vehicles
GROUP BY brand
ORDER BY total_models DESC;

SELECT v.brand, v.model, v.year, s.country
FROM vehicles v
JOIN sources s ON v.id = s.vehicle_id
WHERE s.country = 'Brazil';

SELECT brand, AVG(range_wltp_km) as avg_range
FROM vehicles
WHERE range_wltp_km IS NOT NULL
GROUP BY brand
HAVING COUNT(*) > 1
ORDER BY avg_range DESC;
```

## Using SQLite Format

### Query from Command Line

```bash
sqlite3 open-ev-data.db "SELECT brand, model, year FROM vehicles WHERE brand = 'BYD';"
```

### Python

```python
import sqlite3

conn = sqlite3.connect('open-ev-data.db')
cursor = conn.cursor()

cursor.execute("SELECT brand, COUNT(*) FROM vehicles GROUP BY brand")
for row in cursor.fetchall():
    print(f"{row[0]}: {row[1]} models")

conn.close()
```

### Node.js

```javascript
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('open-ev-data.db');

db.all("SELECT brand, model, year FROM vehicles WHERE brand = ?", ['BYD'], (err, rows) => {
  if (err) throw err;
  rows.forEach(row => {
    console.log(`${row.brand} ${row.model} (${row.year})`);
  });
});

db.close();
```

## Using XML Format

### Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<dataset version="1.0.0" generated_at="2025-01-01T00:00:00Z">
  <vehicles>
    <vehicle>
      <brand>BYD</brand>
      <model>Dolphin</model>
      <year>2024</year>
      <battery capacity_kwh="44.9"/>
      <range>
        <wltp km="340" miles="211"/>
      </range>
    </vehicle>
  </vehicles>
</dataset>
```

### Examples

#### Python

```python
import xml.etree.ElementTree as ET
import requests

url = "https://github.com/open-ev-data/open-ev-data-dataset/releases/latest/download/open-ev-data.xml"
response = requests.get(url)

root = ET.fromstring(response.content)

for vehicle in root.findall('.//vehicle'):
    brand = vehicle.find('brand').text
    model = vehicle.find('model').text
    year = vehicle.find('year').text
    print(f"{brand} {model} ({year})")
```

#### Java

```java
import javax.xml.parsers.*;
import org.w3c.dom.*;

DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
DocumentBuilder builder = factory.newDocumentBuilder();
Document doc = builder.parse("open-ev-data.xml");

NodeList vehicles = doc.getElementsByTagName("vehicle");
for (int i = 0; i < vehicles.getLength(); i++) {
    Element vehicle = (Element) vehicles.item(i);
    String brand = vehicle.getElementsByTagName("brand").item(0).getTextContent();
    String model = vehicle.getElementsByTagName("model").item(0).getTextContent();
    System.out.println(brand + " " + model);
}
```

## Full Stack with Docker Compose

See the `docker-compose.yml` in the repository root to run the complete stack with API and database.

```bash
docker-compose up -d
```

This starts:
- PostgreSQL database with pre-populated data (port 5432)
- OpenEV Data API (port 8080)

Access the API:
```bash
curl http://localhost:8080/api/v1/vehicles
curl http://localhost:8080/api/v1/vehicles?brand=BYD
```

See [API Documentation](../../open-ev-data-api/README.md) for more details.

## Integration Examples

### REST API Endpoint

```javascript
app.get('/api/vehicles', async (req, res) => {
  const response = await fetch('https://github.com/open-ev-data/open-ev-data-dataset/releases/latest/download/open-ev-data.json');
  const data = await response.json();

  const { brand, year } = req.query;
  let vehicles = data.vehicles;

  if (brand) vehicles = vehicles.filter(v => v.brand === brand);
  if (year) vehicles = vehicles.filter(v => v.year === parseInt(year));

  res.json(vehicles);
});
```

### Caching Strategy

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 });

async function getVehicles() {
  const cached = cache.get('vehicles');
  if (cached) return cached;

  const response = await fetch('https://github.com/open-ev-data/open-ev-data-dataset/releases/latest/download/open-ev-data.json');
  const data = await response.json();

  cache.set('vehicles', data.vehicles);
  return data.vehicles;
}
```

### Automated Updates

```bash
#!/bin/bash

LATEST_TAG=$(curl -s https://api.github.com/repos/open-ev-data/open-ev-data-dataset/releases/latest | jq -r .tag_name)
CURRENT_TAG=$(cat .current_version 2>/dev/null || echo "")

if [ "$LATEST_TAG" != "$CURRENT_TAG" ]; then
  echo "New version available: $LATEST_TAG"

  curl -L -o open-ev-data.json "https://github.com/open-ev-data/open-ev-data-dataset/releases/download/$LATEST_TAG/open-ev-data-$LATEST_TAG.json"

  echo "$LATEST_TAG" > .current_version

  systemctl restart my-app
fi
```

## License

This dataset is released under [CDLA-Permissive-2.0](../LICENCE).

## References

- [Dataset Schema](./SCHEMA.md)
- [Dataset Architecture](./ARCHITECTURE.md)
- [API Documentation](../../open-ev-data-api/README.md)
- [Release Process](./RELEASE_PROCESS.md)
