interface SentinelHubConfig {
  clientId: string
  clientSecret: string
  instanceId: string
}

interface BBox {
  minLng: number
  minLat: number
  maxLng: number
  maxLat: number
}

export class SentinelHubClient {
  private config: SentinelHubConfig
  private accessToken: string | null = null
  private tokenExpiry = 0

  constructor(config: SentinelHubConfig) {
    this.config = config
  }

  private async getAccessToken(): Promise<string> {
    // ✅ Si el token sigue siendo válido, lo usamos
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    // ✅ Pedir nuevo token
    const response = await fetch("https://services.sentinel-hub.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }),
    })

    if (!response.ok) {
      throw new Error("❌ No se pudo obtener el token de acceso de Sentinel Hub.")
    }

    const data: { access_token?: string; expires_in?: number } = await response.json()

    // ✅ Verificamos que se haya recibido un token válido
    if (!data.access_token) {
      throw new Error("❌ La respuesta de Sentinel Hub no contiene access_token.")
    }

    this.accessToken = data.access_token
    this.tokenExpiry = Date.now() + (data.expires_in ?? 3600) * 1000 - 60000 // Renovar 1 min antes de expirar

    return this.accessToken
  }

  async getNDVI(bbox: BBox, date: string): Promise<number> {
    const token = await this.getAccessToken()

    const evalscript = `
      //VERSION=3
      function setup() {
        return {
          input: ["B04", "B08"],
          output: { bands: 1 }
        };
      }
      function evaluatePixel(sample) {
        let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
        return [ndvi];
      }
    `

    const requestBody = {
      input: {
        bounds: {
          bbox: [bbox.minLng, bbox.minLat, bbox.maxLng, bbox.maxLat],
          properties: { crs: "http://www.opengis.net/def/crs/EPSG/0/4326" },
        },
        data: [
          {
            type: "sentinel-2-l2a",
            dataFilter: {
              timeRange: {
                from: `${date}T00:00:00Z`,
                to: `${date}T23:59:59Z`,
              },
              maxCloudCoverage: 30,
            },
          },
        ],
      },
      output: {
        width: 512,
        height: 512,
        responses: [
          {
            identifier: "default",
            format: { type: "image/tiff" },
          },
        ],
      },
      evalscript,
    }

    const response = await fetch("https://services.sentinel-hub.com/api/v1/process", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error("❌ No se pudo obtener datos NDVI desde Sentinel Hub.")
    }

    // 🔸 Valor NDVI simulado (para producción deberías analizar el TIFF)
    return 0.65 + Math.random() * 0.2 // Entre 0.65 y 0.85
  }

  async getNDWI(bbox: BBox, date: string): Promise<number> {
    const token = await this.getAccessToken()

    const evalscript = `
      //VERSION=3
      function setup() {
        return {
          input: ["B03", "B08"],
          output: { bands: 1 }
        };
      }
      function evaluatePixel(sample) {
        let ndwi = (sample.B03 - sample.B08) / (sample.B03 + sample.B08);
        return [ndwi];
      }
    `

    const requestBody = {
      input: {
        bounds: {
          bbox: [bbox.minLng, bbox.minLat, bbox.maxLng, bbox.maxLat],
          properties: { crs: "http://www.opengis.net/def/crs/EPSG/0/4326" },
        },
        data: [
          {
            type: "sentinel-2-l2a",
            dataFilter: {
              timeRange: {
                from: `${date}T00:00:00Z`,
                to: `${date}T23:59:59Z`,
              },
              maxCloudCoverage: 30,
            },
          },
        ],
      },
      output: {
        width: 512,
        height: 512,
        responses: [
          {
            identifier: "default",
            format: { type: "image/tiff" },
          },
        ],
      },
      evalscript,
    }

    const response = await fetch("https://services.sentinel-hub.com/api/v1/process", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error("❌ No se pudo obtener datos NDWI desde Sentinel Hub.")
    }

    // 🔸 Valor NDWI simulado
    return 0.15 + Math.random() * 0.15 // Entre 0.15 y 0.30
  }

  async getTrueColorImage(bbox: BBox, date: string): Promise<string> {
    const token = await this.getAccessToken()

    const evalscript = `
      //VERSION=3
      function setup() {
        return {
          input: ["B04", "B03", "B02"],
          output: { bands: 3 }
        };
      }
      function evaluatePixel(sample) {
        return [2.5 * sample.B04, 2.5 * sample.B03, 2.5 * sample.B02];
      }
    `

    const requestBody = {
      input: {
        bounds: {
          bbox: [bbox.minLng, bbox.minLat, bbox.maxLng, bbox.maxLat],
          properties: { crs: "http://www.opengis.net/def/crs/EPSG/0/4326" },
        },
        data: [
          {
            type: "sentinel-2-l2a",
            dataFilter: {
              timeRange: {
                from: `${date}T00:00:00Z`,
                to: `${date}T23:59:59Z`,
              },
              maxCloudCoverage: 30,
            },
          },
        ],
      },
      output: {
        width: 512,
        height: 512,
        responses: [
          {
            identifier: "default",
            format: { type: "image/png" },
          },
        ],
      },
      evalscript,
    }

    const response = await fetch("https://services.sentinel-hub.com/api/v1/process", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error("❌ No se pudo obtener la imagen satelital.")
    }

    const blob = await response.blob()
    const buffer = await blob.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")

    return `data:image/png;base64,${base64}`
  }
}

export function createSentinelHubClient(): SentinelHubClient {
  return new SentinelHubClient({
    clientId: process.env.SENTINEL_HUB_CLIENT_ID || "73ac3f94-c277-400c-9695-f4ea31c382c4",
    clientSecret: process.env.SENTINEL_HUB_CLIENT_SECRET || "PLAKca82a5b1310f46a7bc77dd9c45497be3",
    instanceId: process.env.SENTINEL_HUB_INSTANCE_ID || "00e12aad-05bb-4435-b83c-c4e01da407af",
  })
}
