import fetch from "node-fetch";

const DAILY_API_KEY = "0506743019fb18abd2f9c3669c353fb2261692e222b355b315b700a5e08327e5"
const BASE_URL = "https://api.daily.co/v1";

if (!DAILY_API_KEY) {
    console.error("❌ DAILY_API_KEY not set");
    process.exit(1);
}

async function getAllRooms() {
    const res = await fetch(`${BASE_URL}/rooms`, {
        headers: {
            Authorization: `Bearer ${DAILY_API_KEY}`,
        },
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch rooms: ${res.status}`);
    }

    const data = await res.json();
    return data.data || [];
}

async function deleteRoom(roomName) {
    const res = await fetch(`${BASE_URL}/rooms/${roomName}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${DAILY_API_KEY}`,
        },
    });

    if (!res.ok) {
        throw new Error(`Failed to delete room ${roomName}: ${res.status}`);
    }
}

async function clearAllRooms() {
    console.log("🔍 Fetching rooms...");
    const rooms = await getAllRooms();

    if (rooms.length === 0) {
        console.log("✅ No rooms to delete");
        return;
    }

    console.log(`🧹 Deleting ${rooms.length} rooms...\n`);

    for (const room of rooms) {
        const name = room.name;
        try {
            await deleteRoom(name);
            console.log(`🗑️ Deleted room: ${name}`);
        } catch (err) {
            console.error(`❌ Failed to delete ${name}:`, err.message);
        }
    }

    console.log("\n✅ All rooms processed");
}

clearAllRooms().catch((err) => {
    console.error("❌ Fatal error:", err);
});
