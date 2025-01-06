import {saveAs} from "file-saver";

export const latinSquareOrder = (participantNumber: number | undefined) => {
    if (!participantNumber) return "invalid participant number"
    const latinSquare = [
        ["normal-keypad", "random-keypad-shuffled-once", "drawing-touchscreen", "random-keypad"],
        ["random-keypad-shuffled-once", "drawing-touchscreen", "random-keypad", "normal-keypad"],
        ["drawing-touchscreen", "random-keypad", "normal-keypad", "random-keypad-shuffled-once"],
        ["random-keypad", "normal-keypad", "random-keypad-shuffled-once", "drawing-touchscreen"]
    ];
    const index = (participantNumber - 1) % 4;
    return latinSquare[index];
};

const conditionMapping = {
    "normal-keypad": "A",
    "random-keypad-shuffled-once": "B",
    "random-keypad": "C",
    "drawing-touchscreen": "D",
}

export async function loadVideos(condition: string) {
    const allVideos = [
        "A_4062",
        "A_5268",
        "A_5301",
        "A_6510",
        "A_9289",
        "B_1745",
        "B_5610",
        "B_7441",
        "B_7814",
        "B_9373",
        "C_1114",
        "C_4960",
        "C_5201",
        "C_7865",
        "C_9216",
        "D_3502",
        "D_5294",
        "D_7500",
        "D_8831",
        "D_9953"
    ];
    const mappedCondition = conditionMapping[condition as keyof typeof conditionMapping];
    // Filter videos based on condition prefix
    const filteredVideos = allVideos.filter(video => video.startsWith(mappedCondition));

    // Dynamically import filtered videos and extract pincode
    return await Promise.all(
        filteredVideos.map(async (video) => {
            const module = await import(`./assets/${video}.mp4`);
            const pinCode = video.split("_")[1];
            return {video: module.default, pinCode};
        })
    );
}

export function shuffleArray(array: Array<any>, seed: number) {
    let m = array.length, t, i;

    // Seeded random function
    function seededRandom(seed: number) {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    // While there remain elements to shuffle…
    while (m) {
        i = Math.floor(seededRandom(seed) * m--);

        // Swap
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }

    return array;
}

export interface ParticipantData {
    participant: string;
    condition: string;
    videoIndex: number;
    pinCode: string;
    guess: string;
    correct: boolean;
}

export interface TLXData {
    participantId: string;
    condition: string;
    mentalDemand: number;
    physicalDemand: number;
    temporalDemand: number;
    performance: number;
    effort: number;
    frustration: number;
}

export function writeDataToCombinedCSV(participantData: ParticipantData[], tlxData: TLXData[]): void {
    // Create a lookup for TLX data by condition
    const tlxLookup = new Map(
        tlxData.map(data => [`${data.participantId}-${data.condition}`, data])
    );

    // Group participant data by condition
    const groupedData = participantData.reduce((acc, curr) => {
        const key = `${curr.participant}-${curr.condition}`;
        if (!acc.has(key)) {
            acc.set(key, {
                participant: curr.participant,
                condition: curr.condition,
                totalAttempts: 0,
                correctAttempts: 0,
                averageAttempts: 0,
                tlxData: tlxLookup.get(key)
            });
        }

        const group = acc.get(key)!;
        group.totalAttempts++;
        if (curr.correct) group.correctAttempts++;
        group.averageAttempts = group.correctAttempts / group.totalAttempts;

        return acc;
    }, new Map());

    // Create headers and rows for combined data
    const headers = [
        "Participant",
        "Condition",
        "CorrectAttempts",
        "TotalAttempts",
        "SuccessRate",
        "MentalDemand",
        "PhysicalDemand",
        "TemporalDemand",
        "Performance",
        "Effort",
        "Frustration"
    ];

    const rows = Array.from(groupedData.values()).map(({
                                                           participant,
                                                           condition,
                                                           correctAttempts,
                                                           totalAttempts,
                                                           tlxData
                                                       }) => [
        participant,
        condition,
        correctAttempts,
        totalAttempts,
        (correctAttempts / totalAttempts).toFixed(2),
        tlxData?.mentalDemand ?? "",
        tlxData?.physicalDemand ?? "",
        tlxData?.temporalDemand ?? "",
        tlxData?.performance ?? "",
        tlxData?.effort ?? "",
        tlxData?.frustration ?? ""
    ]);

    const csvContent = [headers, ...rows]
        .map(row => row.join(","))
        .join("\n");

    // Save combined data
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `study_data_participant_${participantData[0].participant}.csv`);
}

