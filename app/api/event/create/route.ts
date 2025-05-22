import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { eventName, hostName, date, location, description } = await request.json();
  
  // TODO: Fake handling for now
  console.log("Event data passed to the API: ", { eventName, hostName, date, location, description });

  return NextResponse.json({ message: "Event created successfully", data: [] }, { status: 200 });
}
