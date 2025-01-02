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
        "A_4062.mp4",
        "A_5268.mp4",
        "A_5301.mp4",
        "A_6510.mp4",
        "A_9289.mp4",
        "B_1745.mp4",
        "B_5610.mp4",
        "B_7441.mp4",
        "B_7814.mp4",
        "B_9373.mp4",
        "C_1114.mp4",
        "C_4960.mp4",
        "C_5201.mp4",
        "C_7865.mp4",
        "C_9216.mp4",
        "D_3502.mp4",
        "D_5294.mp4",
        "D_7500.mp4",
        "D_8831.mp4",
        "D_9953.mp4"
    ];
    const mappedCondition = conditionMapping[condition as keyof typeof conditionMapping];
    // Filter videos based on condition prefix
    const filteredVideos = allVideos.filter(video => video.startsWith(mappedCondition));

    // Dynamically import filtered videos and extract pincode
    return await Promise.all(
        filteredVideos.map(async (video) => {
            const module = await import(`./assets/${video}`);
            const pinCode = video.split("_")[1].split(".")[0];
            return {video: module.default, pinCode};
        })
    );
}
export function shuffleArray(array, seed:number) {
    let m = array.length, t, i;

    // Seeded random function
    function seededRandom(seed:number) {
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
