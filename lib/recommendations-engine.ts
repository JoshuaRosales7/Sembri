interface SatelliteData {
  ndvi: number
  ndwi: number
  cloud_coverage: number
  date: string
}

interface Recommendation {
  type: "irrigation" | "fertilization" | "pest_control" | "harvest"
  message: string
  priority: "low" | "medium" | "high" | "urgent"
}

export class RecommendationsEngine {
  /**
   * Analyze NDVI (Normalized Difference Vegetation Index)
   * NDVI ranges from -1 to 1:
   * - 0.6 to 0.9: Dense, healthy vegetation
   * - 0.3 to 0.6: Moderate vegetation
   * - 0.1 to 0.3: Sparse vegetation
   * - Below 0.1: No vegetation or stressed crops
   */
  private analyzeNDVI(ndvi: number, previousNdvi?: number): Recommendation | null {
    // Critical: Very low NDVI indicates severe crop stress
    if (ndvi < 0.2) {
      return {
        type: "fertilization",
        message:
          "Critical: Very low crop health detected (NDVI: " +
          ndvi.toFixed(3) +
          "). Immediate intervention required. Consider soil testing and applying nitrogen-rich fertilizers.",
        priority: "urgent",
      }
    }

    // Low NDVI: Crop stress
    if (ndvi < 0.4) {
      return {
        type: "fertilization",
        message:
          "Low crop vigor detected (NDVI: " +
          ndvi.toFixed(3) +
          "). Your crops may be experiencing nutrient deficiency. Consider applying balanced NPK fertilizer.",
        priority: "high",
      }
    }

    // Declining NDVI trend
    if (previousNdvi && ndvi < previousNdvi - 0.1) {
      return {
        type: "pest_control",
        message:
          "Significant decline in crop health detected (NDVI dropped from " +
          previousNdvi.toFixed(3) +
          " to " +
          ndvi.toFixed(3) +
          "). Check for pest infestation or disease. Consider applying appropriate pesticides.",
        priority: "high",
      }
    }

    // Moderate NDVI: Room for improvement
    if (ndvi >= 0.4 && ndvi < 0.6) {
      return {
        type: "fertilization",
        message:
          "Moderate crop health (NDVI: " +
          ndvi.toFixed(3) +
          "). Your crops are growing but could benefit from additional nutrients. Consider a light application of fertilizer.",
        priority: "medium",
      }
    }

    // High NDVI: Approaching harvest
    if (ndvi >= 0.75) {
      return {
        type: "harvest",
        message:
          "Excellent crop health detected (NDVI: " +
          ndvi.toFixed(3) +
          "). Your crops are at peak vigor. Monitor closely for optimal harvest timing.",
        priority: "low",
      }
    }

    return null
  }

  /**
   * Analyze NDWI (Normalized Difference Water Index)
   * NDWI ranges from -1 to 1:
   * - Above 0.3: High water content
   * - 0.1 to 0.3: Moderate water content
   * - Below 0.1: Low water content (water stress)
   */
  private analyzeNDWI(ndwi: number): Recommendation | null {
    // Critical: Very low water content
    if (ndwi < 0.05) {
      return {
        type: "irrigation",
        message:
          "Critical water stress detected (NDWI: " +
          ndwi.toFixed(3) +
          "). Your crops are severely dehydrated. Immediate irrigation required to prevent crop failure.",
        priority: "urgent",
      }
    }

    // Low water content
    if (ndwi < 0.15) {
      return {
        type: "irrigation",
        message:
          "Low soil moisture detected (NDWI: " +
          ndwi.toFixed(3) +
          "). Your crops need water soon. Plan irrigation within the next 2-3 days.",
        priority: "high",
      }
    }

    // Moderate water stress
    if (ndwi >= 0.15 && ndwi < 0.25) {
      return {
        type: "irrigation",
        message:
          "Moderate soil moisture (NDWI: " +
          ndwi.toFixed(3) +
          "). Consider irrigation if no rain is expected in the coming week.",
        priority: "medium",
      }
    }

    return null
  }

  /**
   * Analyze cloud coverage impact on data quality
   */
  private analyzeCloudCoverage(cloudCoverage: number): Recommendation | null {
    if (cloudCoverage > 50) {
      return {
        type: "irrigation",
        message:
          "High cloud coverage (" +
          cloudCoverage.toFixed(1) +
          "%) may affect satellite data accuracy. Consider requesting a new scan on a clearer day for more reliable insights.",
        priority: "low",
      }
    }
    return null
  }

  /**
   * Generate recommendations based on satellite data
   */
  generateRecommendations(currentData: SatelliteData, previousData?: SatelliteData): Recommendation[] {
    const recommendations: Recommendation[] = []

    // Analyze NDVI
    const ndviRec = this.analyzeNDVI(currentData.ndvi, previousData?.ndvi)
    if (ndviRec) recommendations.push(ndviRec)

    // Analyze NDWI
    const ndwiRec = this.analyzeNDWI(currentData.ndwi)
    if (ndwiRec) recommendations.push(ndwiRec)

    // Analyze cloud coverage
    const cloudRec = this.analyzeCloudCoverage(currentData.cloud_coverage)
    if (cloudRec) recommendations.push(cloudRec)

    // Sort by priority (urgent > high > medium > low)
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

    return recommendations
  }

  /**
   * Get seasonal recommendations based on crop type and planting date
   */
  getSeasonalRecommendations(cropType: string, plantingDate: Date): Recommendation[] {
    const recommendations: Recommendation[] = []
    const daysSincePlanting = Math.floor((Date.now() - plantingDate.getTime()) / (1000 * 60 * 60 * 24))

    // Maize-specific recommendations
    if (cropType?.toLowerCase().includes("maize") || cropType?.toLowerCase().includes("corn")) {
      if (daysSincePlanting >= 30 && daysSincePlanting <= 45) {
        recommendations.push({
          type: "fertilization",
          message:
            "Your maize is in the vegetative stage (Day " +
            daysSincePlanting +
            "). This is the optimal time for top-dressing with nitrogen fertilizer to boost growth.",
          priority: "high",
        })
      }

      if (daysSincePlanting >= 60 && daysSincePlanting <= 75) {
        recommendations.push({
          type: "irrigation",
          message:
            "Your maize is entering the flowering stage (Day " +
            daysSincePlanting +
            "). Ensure consistent moisture during this critical period for good kernel development.",
          priority: "high",
        })
      }

      if (daysSincePlanting >= 120) {
        recommendations.push({
          type: "harvest",
          message:
            "Your maize is approaching maturity (Day " +
            daysSincePlanting +
            "). Monitor kernel moisture content. Harvest when kernels reach 20-25% moisture for optimal yield.",
          priority: "medium",
        })
      }
    }

    return recommendations
  }
}

export const recommendationsEngine = new RecommendationsEngine()
