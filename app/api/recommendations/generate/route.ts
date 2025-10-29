import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/server"
import { recommendationsEngine } from "@/lib/recommendations-engine"

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

    const { plotId } = await request.json()

    if (!plotId) {
      return NextResponse.json({ error: "Missing plotId" }, { status: 400 })
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

    // Fetch latest satellite data
    const { data: satelliteData, error: satError } = await supabase
      .from("satellite_data")
      .select("*")
      .eq("plot_id", plotId)
      .order("date", { ascending: false })
      .limit(2)

    if (satError || !satelliteData || satelliteData.length === 0) {
      return NextResponse.json({ error: "No satellite data available" }, { status: 404 })
    }

    const currentData = satelliteData[0]
    const previousData = satelliteData[1]

    // Generate recommendations based on satellite data
    const recommendations = recommendationsEngine.generateRecommendations(
      {
        ndvi: Number.parseFloat(currentData.ndvi),
        ndwi: Number.parseFloat(currentData.ndwi),
        cloud_coverage: Number.parseFloat(currentData.cloud_coverage),
        date: currentData.date,
      },
      previousData
        ? {
            ndvi: Number.parseFloat(previousData.ndvi),
            ndwi: Number.parseFloat(previousData.ndwi),
            cloud_coverage: Number.parseFloat(previousData.cloud_coverage),
            date: previousData.date,
          }
        : undefined,
    )

    // Add seasonal recommendations if crop type and planting date are available
    if (plot.crop_type && plot.planting_date) {
      const seasonalRecs = recommendationsEngine.getSeasonalRecommendations(
        plot.crop_type,
        new Date(plot.planting_date),
      )
      recommendations.push(...seasonalRecs)
    }

    // Store recommendations in database
    const recommendationsToInsert = recommendations.map((rec) => ({
      plot_id: plotId,
      recommendation_type: rec.type,
      message: rec.message,
      priority: rec.priority,
      is_read: false,
    }))

    if (recommendationsToInsert.length > 0) {
      const { error: insertError } = await supabase.from("recommendations").insert(recommendationsToInsert)

      if (insertError) {
        console.error("[v0] Error inserting recommendations:", insertError)
      }
    }

    return NextResponse.json({
      recommendations,
      count: recommendations.length,
    })
  } catch (error: any) {
    console.error("[v0] Error generating recommendations:", error)
    return NextResponse.json({ error: error.message || "Failed to generate recommendations" }, { status: 500 })
  }
}
