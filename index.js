
```javascript
import Anthropic from "@anthropic-ai/sdk";
import * as readline from "readline";

const client = new Anthropic();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to prompt user
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Main calculator class
class CarbonFootprintCalculator {
  constructor() {
    this.conversationHistory = [];
    this.userActivities = {
      transportation: [],
      energy: [],
      diet: [],
      shopping: [],
      waste: [],
    };
  }

  // Calculate carbon emissions from different sources
  calculateEmissions() {
    const emissions = {
      transportation: 0,
      energy: 0,
      diet: 0,
      shopping: 0,
      waste: 0,
      total: 0,
    };

    // Transportation: kg CO2 per km
    if (this.userActivities.transportation.length > 0) {
      for (const trip of this.userActivities.transportation) {
        const { distance, type } = trip;
        const emissionFactors = {
          car: 0.21, // kg CO2 per km
          bus: 0.089, // kg CO2 per km
          train: 0.041, // kg CO2 per km
          plane: 0.255, // kg CO2 per km
        };
        emissions.transportation +=
          distance * (emissionFactors[type] || 0.21);
      }
    }

    // Energy: kg CO2 per kWh
    if (this.userActivities.energy.length > 0) {
      for (const consumption of this.userActivities.energy) {
        const { kwh, source } = consumption;
        const emissionFactors = {
          coal: 0.92,
          natural_gas: 0.44,
          renewable: 0.02,
          grid_average: 0.47,
        };
        emissions.energy += kwh * (emissionFactors[source] || 0.47);
      }
    }

    // Diet: kg CO2 per meal
    if (this.userActivities.diet.length > 0) {
      for (const meal of this.userActivities.diet) {
        const { type, servings } = meal;
        const emissionFactors = {
          beef: 27,
          chicken: 6.9,
          fish: 5.9,
          vegetarian: 2.5,
          vegan: 1.5,
        };
        emissions.diet += servings * (emissionFactors[type] || 2.5);
      }
    }

    // Shopping: kg CO2 per item (average)
    if (this.userActivities.shopping.length > 0) {
      emissions.shopping = this.userActivities.shopping.length * 10; // ~10 kg CO2 per item average
    }

    // Waste: kg CO2 per kg of waste
    if (this.userActivities.waste.length > 0) {
      for (const wasteItem of this.userActivities.waste) {
        const { weight, type } = wasteItem;
        const emissionFactors = {
          plastic: 2.5,
          paper: 0.2,
          food: 0.5,
          general: 1.0,
        };
        emissions.waste += weight * (emissionFactors[type] || 1.0);
      }
    }

    emissions.total = Object.keys(emissions).reduce((sum, key) => {
      if (key !== "total") {
        sum += emissions[key];
      }
      return sum;
    }, 0);

    return emissions;
  }

  // Parse user input and extract activity data
  parseActivity(message) {
    const lowerMessage = message.toLowerCase();

    // Transportation
    if (
      lowerMessage.includes("drive") ||
      lowerMessage.includes("car") ||
      lowerMessage.includes("drove")
    ) {
      const kmMatch = message.match(/(\d+)\s*(km|kilometers|miles)/i);
      if (kmMatch) {
        const distance = kmMatch[1];
        const unit = kmMatch[2].toLowerCase().includes("mile") ? 1.609 : 1;
        this.userActivities.transportation.push({
          distance: parseFloat(distance) * unit,
          type: "car",
        });
        return true;
      }
    }

    // Diet
    if (
      lowerMessage.includes("ate") ||
      lowerMessage.includes("dinner") ||
      lowerMessage.includes("lunch") ||
      lowerMessage.includes("breakfast")
    ) {
      let mealType = "vegetarian";
      if (
        lowerMessage.includes("beef") ||
        lowerMessage.includes("burger") ||
        lowerMessage.includes("steak")
      ) {
        mealType = "beef";
      } else if (
        lowerMessage.includes("chicken") ||
        lowerMessage.includes("fish")
      ) {
        mealType =
          lowerMessage.includes("chicken") || lowerMessage.includes("poultry")
            ? "chicken"
            : "fish";
      } else if (
        lowerMessage.includes("vegan") ||
        lowerMessage.includes("vegetable")
      ) {
        mealType = "vegan";
      }
      this.userActivities.diet.push({ type: mealType, servings: 1 });
      return true;
    }

    // Energy usage
    if (
      lowerMessage.includes("electricity") ||
      lowerMessage.includes("kwh") ||
      lowerMessage.includes("power")
    ) {
      const kwhMatch = message.match(/(\d+)\s*kwh/i);
      if (kwhMatch) {
        