import Task from "@/models/task.model";
import { getUserIdFromCookies } from "@/utils";
import { connect } from "@/utils/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await connect();
    const userId = await getUserIdFromCookies(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const tasks = await Task.insertMany(
      body.map((task: any) => {
        const { _id, ...taskWithoutId } = task;
        return {
          ...taskWithoutId,
          user: userId,
        };
      })
    );

    return NextResponse.json(tasks, { status: 201 });
  } catch (error) {
    console.error("Bulk task creation error:", error);
    return NextResponse.json(
      { error: "Failed to create tasks" },
      { status: 500 }
    );
  }
}
