import {useNavigate, useParams} from "react-router";
import {latinSquareOrder, loadVideos, ParticipantData, shuffleArray, writeDataToCSV} from "@/utils.ts";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {useEffect, useState} from "react";
import testVideo from "@/assets/Example_8158.mp4";

export default function Participant() {
    const {id, condition, videoIndex} = useParams<{ id: string; condition: string; videoIndex: string }>();
    const navigate = useNavigate();

    const participant = id ? parseInt(id) : null;
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState(false);  // Changed to false initially since test video doesn't need loading

    const conditionOrder = participant ? latinSquareOrder(participant) : null;

    const [guess, setGuess] = useState<string>("");
    const [guessIndex, setGuessIndex] = useState<number>(1);
    const [videos, setVideos] = useState<{ video: string; pinCode: string }[]>();
    const [participantData, setParticipantData] = useState<ParticipantData[]>([]);

    // Validate route parameters
    useEffect(() => {
        if (!participant || isNaN(participant)) {
            setError("Invalid participant ID");
            return;
        }
        if (!condition) {
            setError("Missing condition");
            return;
        }
        if (!videoIndex || isNaN(parseInt(videoIndex))) {
            setError("Invalid video index");
            return;
        }
        setError("");
    }, [participant, condition, videoIndex]);

    function handleNavigate() {
        setGuessIndex(1);
        if (!condition || !conditionOrder) return;

        if (condition === "test") {
            navigate(`/participant/${id}/${conditionOrder[0]}/1`);
        } else {
            const currentIndex = conditionOrder.indexOf(condition);
            if (currentIndex === -1) {
                setError("Invalid condition order");
                return;
            }

            const nextCondition = conditionOrder[currentIndex + 1];
            if (nextCondition) {
                navigate(`/participant/${id}/${nextCondition}/1`);
            } else {
                writeDataToCSV(participantData);
                navigate(`/`);
            }
        }
    }

    function checkGuess() {
        if (!guess.trim()) {
            setError("Please enter a guess");
            return;
        }

        if (!/^\d{4}$/.test(guess)) {
            setError("Please enter a 4-digit number");
            return;
        }

        let isCorrect = false;
        let currentPinCode = "";

        if (condition === "test") {
            isCorrect = guess === "8158";
            currentPinCode = "8158";
        } else if (videos && videoIndex) {
            const currentVideo = videos[parseInt(videoIndex) - 1];
            if (currentVideo) {
                isCorrect = guess === currentVideo.pinCode;
                currentPinCode = currentVideo.pinCode;
            }
        }

        setParticipantData(prevData => {
            const newData = [
                ...prevData,
                {
                    participant: id!,
                    condition: condition!,
                    videoIndex: parseInt(videoIndex!),
                    pinCode: currentPinCode,
                    guess,
                    correct: isCorrect
                }
            ];

            localStorage.setItem(`participant_${id}_data`, JSON.stringify(newData));
            return newData;
        });

        if (isCorrect || (guessIndex === 3)) {
            setGuess("");
            setGuessIndex(1);

            // Handle navigation differently for test and regular conditions
            if (condition === "test") {
                handleNavigate();
            } else if (videos && parseInt(videoIndex!) < videos.length) {
                navigate(`/participant/${id}/${condition}/${parseInt(videoIndex!) + 1}`);
            } else {
                handleNavigate();
            }
            return;
        }

        setGuess("");
        setGuessIndex(prevState => prevState + 1);
        setError("");
    }

    useEffect(() => {
        async function fetchVideos() {
            if (!condition || condition === "test") return;

            try {
                setLoading(true);
                const videoObjects = await loadVideos(condition);
                if (!videoObjects || videoObjects.length === 0) {
                    setError("No videos found for this condition");
                    return;
                }
                const shuffledVideos = participant ? shuffleArray(videoObjects, participant) : videoObjects;
                setVideos(shuffledVideos);
            } catch (err) {
                setError("Failed to load videos");
                console.error("Error loading videos:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchVideos();
    }, [participant, condition]);

    // Recover data from local storage on mount
    useEffect(() => {
        if (id) {
            const savedData = localStorage.getItem(`participant_${id}_data`);
            if (savedData) {
                setParticipantData(JSON.parse(savedData));
            }
        }
    }, [id]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full gap-2">
                <h1 className="text-red-500">{error}</h1>
                <Button onClick={() => navigate('/')}>Return Home</Button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full gap-2">
                <h1>Loading...</h1>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center w-full h-full gap-2">
            <a href={"/"}>&lt; Home</a>
            <h1>Participant {id}</h1>
            <h2>Condition: {condition}</h2>
            <div className="bg-gray-500 w-1/2 aspect-video">
                {condition === "test" ? (
                    <video src={testVideo} className="w-full h-full" autoPlay muted/>
                ) : (
                    videos && videoIndex && (
                        <video
                            src={videos[parseInt(videoIndex) - 1]?.video}
                            className="w-full h-full"
                            autoPlay
                            muted
                            onError={(e) => setError("Error playing video")}
                        />
                    )
                )}
            </div>
            <div className="flex flex-col items-center gap-2">
                <div className="flex gap-2">
                    <Input
                        type="text"
                        maxLength={4}
                        value={guess}
                        onChange={(event) => {
                            const value = event.target.value.replace(/[^0-9]/g, '');
                            setGuess(value);
                            setError("");
                        }}
                        placeholder="Enter 4-digit code"
                    />
                    <Button
                        onClick={checkGuess}
                        disabled={guessIndex > 3 || !guess || guess.length !== 4}
                    >
                        Submit ({guessIndex}/3)
                    </Button>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
            {condition === "test" ? (
                <Button onClick={handleNavigate}>Start Study</Button>
            ) : (
                videos && videoIndex && (
                    <Button onClick={handleNavigate} disabled={parseInt(videoIndex!) < videos.length}>
                        Continue
                    </Button>
                )
            )}
        </div>
    );
}
