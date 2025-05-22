import { NextRequest, NextResponse } from "next/server";

// Get all events posted by a host
export async function GET(request: NextRequest) {
  const hostId = request.nextUrl.searchParams.get("hostId");

  if (!hostId) {
    return NextResponse.json({ error: "Host ID is required" }, { status: 400 });
  }
  
  // TODO: Fake handling of event retrieval
  const eventOne = {
    eventName: "Event 1",
    hostName: "Host 1",
    date: "2025-07-01",
    location: "Location 1",
    description: "Description 1",
  };
  const eventTwo = {
    eventName: "Event 2",
    hostName: "Host 2",
    date: "2025-08-02",
    location: "Location 2",
    description: "Description 2",
  };

  return NextResponse.json({ message: "Events retrieved successfully", data: [eventOne, eventTwo] }, { status: 200 });
}
