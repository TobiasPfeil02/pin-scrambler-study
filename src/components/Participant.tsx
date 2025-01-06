import {useNavigate, useParams} from "react-router";
import {
    latinSquareOrder,
    loadVideos,
    ParticipantData,
    shuffleArray,
    writeDataToCombinedCSV
} from "@/utils.ts";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {useEffect, useState, useRef} from "react";
import NASATLX, {TLXData} from "./NasaTLX.tsx";
import testVideo from "@/assets/Example_8158.mp4";

export default function Participant() {
    const {id, condition, videoIndex} = useParams<{ id: string; condition: string; videoIndex: string }>();
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);

    const participant = id ? parseInt(id) : null;
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [videoEnded, setVideoEnded] = useState(false);
    const [showNextVideo, setShowNextVideo] = useState(false);
    const [showConditionTransition, setShowConditionTransition] = useState(false);

    const conditionOrder = participant ? latinSquareOrder(participant) : null;

    const [guess, setGuess] = useState<string>("");
    const [guessIndex, setGuessIndex] = useState<number>(1);
    const [videos, setVideos] = useState<{ video: string; pinCode: string }[]>();
    const [participantData, setParticipantData] = useState<ParticipantData[]>([]);

    const [showTLX, setShowTLX] = useState(false);
    const [tlxData, setTlxData] = useState<TLXData[]>([]);

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
        // Reset states when parameters change
        setVideoEnded(false);
        setShowNextVideo(false);
        setShowConditionTransition(false);
        setShowTLX(false);
    }, [participant, condition, videoIndex]);

    function handleTLXComplete(data: TLXData) {
        setTlxData(prev => [...prev, data]);
        setShowTLX(false);
        setShowConditionTransition(true);
    }

    function getNextCondition(): string | null {
        if (!condition || !conditionOrder) return null;

        if (condition === "test") {
            return conditionOrder[0];
        } else {
            const currentIndex = conditionOrder.indexOf(condition);
            if (currentIndex === -1) return null;
            return conditionOrder[currentIndex + 1] || null;
        }
    }

    function handleNavigate() {
        setGuessIndex(1);
        setVideoEnded(false);
        setShowNextVideo(false);

        if (!condition || !conditionOrder) return;

        const next = getNextCondition();
        if (!next) {
            writeDataToCombinedCSV(participantData, tlxData);
            navigate('/');
            return;
        }

        navigate(`/participant/${id}/${next}/1`);
    }

    function handleVideoEnd() {
        setVideoEnded(true);
    }

    function startNextVideo() {
        if (condition === "test") {
            setShowTLX(true); // Show TLX after test condition
        } else if (videos && parseInt(videoIndex!) < videos.length) {
            // If there are more videos in current condition, go to next video
            navigate(`/participant/${id}/${condition}/${parseInt(videoIndex!) + 1}`);
        } else {
            // If this was the last video of the condition, show TLX
            setShowTLX(true);
        }
    }

    function startNextCondition() {
        handleNavigate();
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
            setShowNextVideo(true);
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
    if (showTLX && condition) {
        return (
            <div className="w-full h-full">
                <NASATLX
                    condition={condition}
                    participantId={id!}
                    onComplete={handleTLXComplete}
                />
            </div>
        );
    }

    if (showConditionTransition) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full gap-4">
                <h1 className="text-2xl font-bold">New Condition Starting</h1>
                <p>Please take a moment to prepare. Click the button when you're ready to begin.</p>
                <Button onClick={startNextCondition} className="mt-4">
                    Start next Condition
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center w-full h-full gap-2">
            <a href={"/"}>&lt; Home</a>
            <h1>Participant {id}</h1>
            <h2>Condition: {condition}</h2>
            <div className="bg-gray-500 w-1/2 aspect-video">
                {!videoEnded ? (
                    condition === "test" ? (
                        <video
                            ref={videoRef}
                            src={testVideo}
                            className="w-full h-full"
                            autoPlay
                            muted
                            onEnded={handleVideoEnd}
                        />
                    ) : (
                        videos && videoIndex && (
                            <video
                                ref={videoRef}
                                src={videos[parseInt(videoIndex) - 1]?.video}
                                className="w-full h-full"
                                autoPlay
                                muted
                                onEnded={handleVideoEnd}
                                onError={() => setError("Error playing video")}
                            />
                        )
                    )
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-700 text-white">
                        Video Ended
                    </div>
                )}
            </div>
            {videoEnded && !showNextVideo && (
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
            )}
            {showNextVideo && (
                condition === "test" ? (
                    <Button onClick={startNextVideo}>Continue to Questionnaire</Button>
                ) : (
                    videos && videoIndex && (
                        <Button onClick={startNextVideo}>
                            {parseInt(videoIndex!) < videos.length ? "Start Next Video" : "Continue to Questionnaire"}
                        </Button>
                    )
                )
            )}
        </div>
    );
}
