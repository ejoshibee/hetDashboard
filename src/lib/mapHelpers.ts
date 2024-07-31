import { GsmData, msgData, WifiData, Bin } from "../types";

class WeightedGeoCenter {
  private locations: { lat: number; lng: number; accuracy: number }[] = [];

  constructor(private data: msgData[]) {
    this.processData();
  }

  private processData(): void {
    console.log(`Processing data: ${JSON.stringify(this.data, null, 2)}`)
    this.data.forEach(item => {
      // @ts-expect-error parsing
      const hetData = JSON.parse(item.data)
      hetData.forEach((point: GsmData | WifiData) => {
        // USING ALL POINTS, not just used: true
        this.locations.push({
          lat: point.lat,
          lng: point.lng,
          accuracy: point.accuracy
        });
      });
    });
  }

  private calculateDistances(): number[] {
    const distances: number[] = [];
    for (let i = 0; i < this.locations.length; i++) {
      for (let j = i + 1; j < this.locations.length; j++) {
        const lat1 = this.locations[i].lat;
        const lon1 = this.locations[i].lng;
        const lat2 = this.locations[j].lat;
        const lon2 = this.locations[j].lng;
        const distance = this.haversineDistance(lat1, lon1, lat2, lon2);
        distances.push(distance);
      }
    }
    return distances;
  }

  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  getWeightedCenter(): { lat: number; lng: number; accuracy: number } {
    if (this.locations.length === 0) {
      throw new Error("No valid points to calculate weighted center");
    }

    let latSum = 0;
    let lonSum = 0;
    let weightSum = 0;

    this.locations.forEach(location => {
      const weight = 1 / Math.pow(location.accuracy, 2);
      latSum += location.lat * weight;
      lonSum += location.lng * weight;
      weightSum += weight;
    });

    const lat = latSum / weightSum;
    const lng = lonSum / weightSum;

    const distances = this.calculateDistances();
    const accuracy = distances.reduce((sum, distance) => sum + distance, 0) / distances.length;

    return { lat, lng, accuracy };
  }

  addDataItem(item: msgData): void {
    this.data.push(item);
    item.data.forEach(point => {
      if (point.used !== false) {
        this.locations.push({
          lat: point.lat,
          lng: point.lng,
          accuracy: point.accuracy
        });
      }
    });
  }

  processBin(bin: Bin): { lat: number; lng: number; accuracy: number } {
    const center = new WeightedGeoCenter(bin.items);
    return center.getWeightedCenter();
  }
}


// func to define the tools utilized for map analysis
export const relocate = (data: msgData[]): { lat: number; lng: number; accuracy: number } => {
  // this function will accept the message data being inspected, particularly in msgData.data
  // initialize variable to store het data in
  const msgData = data
  console.log(`msgData: ${JSON.stringify(msgData, null, 2)}`)
  const geoCalculator = new WeightedGeoCenter(msgData)
  const center = geoCalculator.getWeightedCenter()
  return center

}

export const mute = (data: msgData[], selectedItems: number[]): void => {
  // if here we are muting selected points and presumably making api call
  // we need to get the points that are referenced by the selected items indices

  // @ts-expect-error parsing
  const hetData = JSON.parse(data[0].data)
  const selectedPoints = hetData.filter((_: never, index: number) => selectedItems.includes(index))
  console.log(`selectedPoints: ${JSON.stringify(selectedPoints, null, 2)}`)
}

export const validatePoint = (point: GsmData | WifiData) => {
  // this function will accept a point and validate it by some backend service.
  // it will return a boolean value

  // func can be used to look up point in count's database.
  console.log(`Point to validate: ${JSON.stringify(point, null, 2)}`)
}

