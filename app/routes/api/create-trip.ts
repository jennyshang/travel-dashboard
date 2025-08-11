import { GoogleGenerativeAI } from "@google/generative-ai";
import { ID } from "appwrite";
import { data, type ActionFunctionArgs } from "react-router"
import { appwriteConfig, database } from "~/appwrite/client";
import { parseMarkdownToJson, parseTripData } from "~/lib/utils";
import { createProduct } from "~/lib/stripe";

export const action = async ({ request }: ActionFunctionArgs) => {
  const {
    country,
    numberOfDays,
    travelStyle,
    interests,
    budget,
    groupType,
    userId,
  } = await request.json();

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const unsplashApiKey = process.env.UNSPLASH_ACCESS_KEY!;

  try {
    const prompt = `Generate a ${numberOfDays}-day travel itinerary for ${country} based on the following user information:
    Budget: '${budget}'
    Interests: '${interests}'
    TravelStyle: '${travelStyle}'
    GroupType: '${groupType}'
    Return the itinerary and lowest estimated price. You are to output ONLY valid JSON and nothing else.
Format exactly as in the schema provided.
Do not include any markdown, explanations, or extra text.
Schema:
    {
    "name": "A descriptive title for the trip",
    "description": "A brief description of the trip and its highlights not exceeding 100 words",
    "estimatedPrice": "Lowest average price for the trip in USD, e.g.$price",
    "duration": ${numberOfDays},
    "budget": "${budget}",
    "travelStyle": "${travelStyle}",
    "country": "${country}",
    "interests": ${interests},
    "groupType": "${groupType}",
    "bestTimeToVisit": [
      '🌸 Season (from month to month): reason to visit',
      '☀️ Season (from month to month): reason to visit',
      '🍁 Season (from month to month): reason to visit',
      '❄️ Season (from month to month): reason to visit'
    ],
    "weatherInfo": [
      '☀️ Season: temperature range in Celsius (temperature range in Fahrenheit)',
      '🌦️ Season: temperature range in Celsius (temperature range in Fahrenheit)',
      '🌧️ Season: temperature range in Celsius (temperature range in Fahrenheit)',
      '❄️ Season: temperature range in Celsius (temperature range in Fahrenheit)'
    ],
    "location": {
      "city": "name of the city or region",
      "coordinates": [latitude, longitude],
      "openStreetMap": "link to open street map"
    },
    "itinerary": [
    {
      "day": 1,
      "location": "City/Region Name",
      "activities": [
        {"time": "Morning", "description": "🏫Experience the historic grandeur of the University of Oxford, one of the world's oldest universities, and explore its impressive collection of colleges and buildings."},
        {"time": "Afternoon", "description": "⛪Visit Christ Church, a constituent college of the University of Oxford, renowned for its architectural beauty and association with the Harry Potter film series. "},
        {"time": "Evening", "description": "🪻Explore the Cambridge University Botanic Garden, a haven of diverse plant life where you can enjoy a tranquil setting amidst a rich collection of species. "},
      ]
    },
    ...
    ]
    }`;

    const textResult = await genAI
      .getGenerativeModel({ model: 'gemini-2.5-flash' })
      .generateContent([prompt])

    const trip = parseMarkdownToJson(textResult.response.text());

    const imageResponse = await fetch(
      `https://api.unsplash.com/search/photos?query=${country} ${interests} ${travelStyle}&client_id=${unsplashApiKey}`
    )

    const imageUrls = (await imageResponse.json()).results.slice(0, 3)
      .map((result: any) => result.urls?.regular || null);

    const result = await database.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.tripCollectionId,
      ID.unique(),
      {
        tripDetail: JSON.stringify(trip),
        createdAt: new Date().toISOString(),
        imageUrls,
        userId
      }
    )
    const tripDetail = parseTripData(result.tripDetail) as Trip;
    const tripPrice = parseInt(tripDetail.estimatedPrice.replace('$', ''), 10)
    const paymentLink = await createProduct(
      tripDetail.name,
      tripDetail.description,
      imageUrls,
      tripPrice,
      result.$id
    )

    await database.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.tripCollectionId,
      result.$id,
      {
        payment_link: paymentLink.url
      }
    )

    return data({ id: result.$id })

  } catch (e) {
    console.error('Error generating travel plan: ', e);
  }
}