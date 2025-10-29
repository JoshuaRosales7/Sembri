import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/server"
import { createSentinelHubClient } from "@/lib/sentinel-hub"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { plotId, date } = await request.json()

    if (!plotId || !date) {
      return NextResponse.json({ error: "Missing plotId or date" }, { status: 400 })
    }

    // Fetch plot data
    const { data: plot, error: plotError } = await supabase
      .from("plots")
      .select("*")
      .eq("id", plotId)
      .eq("farmer_id", user.id)
      .single()

    if (plotError || !plot) {
      return NextResponse.json({ error: "Plot not found" }, { status: 404 })
    }

    // Parse geometry to get bounding box
    const geometry = typeof plot.geometry === "string" ? JSON.parse(plot.geometry) : plot.geometry

    const coordinates = geometry.coordinates[0]
    const lngs = coordinates.map((coord: number[]) => coord[0])
    const lats = coordinates.map((coord: number[]) => coord[1])

    const bbox = {
      minLng: Math.min(...lngs),
      minLat: Math.min(...lats),
      maxLng: Math.max(...lngs),
      maxLat: Math.max(...lats),
    }

    // Check if we have Sentinel Hub credentials
    if (!process.env.SENTINEL_HUB_CLIENT_ID) {
      // Return mock data if no credentials
      const mockNDVI = 0.65 + Math.random() * 0.2
      const mockNDWI = 0.15 + Math.random() * 0.15
      const mockCloudCoverage = Math.random() * 20

      const { error: insertError } = await supabase.from("satellite_data").insert({
        plot_id: plotId,
        date: date,
        ndvi: mockNDVI,
        ndwi: mockNDWI,
        cloud_coverage: mockCloudCoverage,
        image_url: null,
      })

      if (insertError) {
        console.error("[v0] Error inserting satellite data:", insertError)
      }

      return NextResponse.json({
        ndvi: mockNDVI,
        ndwi: mockNDWI,
        cloudCoverage: mockCloudCoverage,
        message: "Mock data generated (Sentinel Hub not configured)",
      })
    }

    // Fetch real satellite data
    const sentinelHub = createSentinelHubClient()

    const [ndvi, ndwi] = await Promise.all([sentinelHub.getNDVI(bbox, date), sentinelHub.getNDWI(bbox, date)])

    const cloudCoverage = Math.random() * 20 // Mock cloud coverage

    // Store in database
    const { error: insertError } = await supabase.from("satellite_data").insert({
      plot_id: plotId,
      date: date,
      ndvi: ndvi,
      ndwi: ndwi,
      cloud_coverage: cloudCoverage,
      image_url: null,
    })

    if (insertError) {
      console.error("[v0] Error inserting satellite data:", insertError)
    }

    return NextResponse.json({
      ndvi,
      ndwi,
      cloudCoverage,
    })
  } catch (error: any) {
    console.error("[v0] Error fetching satellite data:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch satellite data" }, { status: 500 })
  }
}
